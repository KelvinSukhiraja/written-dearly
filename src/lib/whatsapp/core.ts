import { createHmac, timingSafeEqual } from "node:crypto";
import { whatsappPhone, publicShareOrigin, invitationLink } from "../guests/whatsapp.ts";

import { TEMPLATE_BODY } from "./template.ts";
export type DeliveryStatus = "sending" | "unknown" | "accepted" | "sent" | "failed" | "delivered" | "read";
export type Delivery = { id: string; status: DeliveryStatus; updated_at: string; error_code: string | null };
export type WhatsAppConfig = { token: string; phoneId: string; version: string; template: string; language: string; origin: string; appSecret: string; verifyToken: string };

export function readConfig(env: Record<string, string | undefined>): WhatsAppConfig | null {
  if (env.WHATSAPP_ENABLED !== "true" || env.WHATSAPP_TEMPLATE_APPROVED !== "true") return null;
  const { WHATSAPP_ACCESS_TOKEN: token, WHATSAPP_PHONE_NUMBER_ID: phoneId, WHATSAPP_API_VERSION: version,
    WHATSAPP_TEMPLATE_NAME: template, WHATSAPP_TEMPLATE_LANGUAGE: language, APP_URL: origin,
    WHATSAPP_APP_SECRET: appSecret, WHATSAPP_WEBHOOK_VERIFY_TOKEN: verifyToken } = env;
  if (!token || !phoneId || !version || !template || !language || !origin || !appSecret || !verifyToken) return null;
  if (!/^\d+$/.test(phoneId) || !/^v\d+\.\d+$/.test(version) || !/^[a-z0-9_]+$/.test(template) || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) return null;
  try {
    const url = new URL(origin);
    if (!publicShareOrigin(origin) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
  } catch { return null; }
  return { token, phoneId, version, template, language, origin, appSecret, verifyToken };
}

export function templateParameters(guest: { name: string; public_token: string; invited_count: number }, couple: string, slug: string, origin: string) {
  return [guest.name, couple, String(guest.invited_count), invitationLink(origin, slug, guest.public_token)];
}
export function renderTemplate(parameters: string[]) {
  return TEMPLATE_BODY.replace(/\{\{([1-4])\}\}/g, (_, n: string) => parameters[Number(n) - 1] ?? "");
}

export type SendResult = { status: "accepted"; providerId: string } | { status: "failed" | "unknown"; code: string };
export async function sendTemplate(config: WhatsAppConfig, phone: string, parameters: string[], attempt: string, transport: typeof fetch = fetch): Promise<SendResult> {
  const to = whatsappPhone(phone);
  if (!to || parameters.length !== 4 || parameters.some(p => !p.trim() || p.length > 1024 || /[\r\n\t]/.test(p))) return { status: "failed", code: "invalid_parameters" };
  try {
    const response = await transport(`https://graph.facebook.com/${config.version}/${config.phoneId}/messages`, {
      method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "template",
        biz_opaque_callback_data: attempt,
        template: { name: config.template, language: { code: config.language }, components: [{ type: "body", parameters: parameters.map(text => ({ type: "text", text })) }] } }),
    });
    const body = await response.json().catch(() => null);
    if (response.ok && typeof body?.messages?.[0]?.id === "string") return { status: "accepted", providerId: body.messages[0].id };
    // Only an explicit Graph rejection establishes that no message was accepted.
    if (response.status >= 400 && response.status < 500 && Number.isInteger(body?.error?.code)) return { status: "failed", code: String(body.error.code) };
    return { status: "unknown", code: "unconfirmed_response" };
  } catch { return { status: "unknown", code: "network_unconfirmed" }; }
}

export function validSignature(raw: Uint8Array, signature: string | null, secret: string) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex"));
}

type Receipt = { attempt: string | null; providerId: string; recipient: string; status: "sent" | "delivered" | "read" | "failed"; code: string | null };
export function statusReceipts(input: unknown, phoneId: string): Receipt[] {
  const result: Receipt[] = [];
  if (!input || typeof input !== "object" || !("object" in input) || input.object !== "whatsapp_business_account") return result;
  const body = input as { entry?: { changes?: { field?: string; value?: { metadata?: { phone_number_id?: string }; statuses?: { id?: string; recipient_id?: string; status?: string; biz_opaque_callback_data?: string; errors?: { code?: number }[] }[] } }[] }[] };
  if (!Array.isArray(body.entry)) return result;
  for (const entry of body.entry) {
    if (!Array.isArray(entry?.changes)) continue;
    for (const change of entry.changes) {
      if (change?.field !== "messages" || change.value?.metadata?.phone_number_id !== phoneId || !Array.isArray(change.value.statuses)) continue;
      for (const status of change.value.statuses) {
        if (!status || typeof status.id !== "string" || typeof status.recipient_id !== "string" || !["sent", "delivered", "read", "failed"].includes(status.status ?? "")) continue;
        const callback = status.biz_opaque_callback_data;
        result.push({ attempt: typeof callback === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(callback) ? callback : null,
          providerId: status.id, recipient: status.recipient_id, status: status.status as Receipt["status"],
          code: Number.isInteger(status.errors?.[0]?.code) ? String(status.errors![0].code) : null });
      }
    }
  }
  return result;
}
