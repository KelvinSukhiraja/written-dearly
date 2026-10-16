import { validSignature, statusReceipts } from "@/lib/whatsapp/core";
import { deliveryStore } from "@/lib/whatsapp/server";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const challenge = url.searchParams.get("hub.challenge");
  if (!token || url.searchParams.get("hub.mode") !== "subscribe" || url.searchParams.get("hub.verify_token") !== token || !challenge)
    return new Response("Forbidden", { status: 403 });
  return new Response(challenge, { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!secret || !phoneId || !process.env.SUPABASE_SECRET_KEY) return new Response("Not configured", { status: 503 });
  // Bound the actual stream, rather than trusting Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return new Response("Missing body", { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 256 * 1024) { await reader.cancel(); return new Response("Too large", { status: 413 }); }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks);
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"), secret)) return new Response("Forbidden", { status: 403 });
  let body: unknown;
  try { body = JSON.parse(raw.toString("utf8")); } catch { return new Response("Invalid JSON", { status: 400 }); }
  try {
    const store = deliveryStore();
    for (const receipt of statusReceipts(body, phoneId)) {
      const { error } = await store.rpc("record_whatsapp_status", { p_attempt: receipt.attempt, p_provider: receipt.providerId,
        p_recipient: receipt.recipient, p_status: receipt.status, p_code: receipt.code });
      if (error) return new Response("Tracking unavailable", { status: 503 });
    }
    return new Response("OK");
  } catch { return new Response("Tracking unavailable", { status: 503 }); }
}
