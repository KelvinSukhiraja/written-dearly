"use server";
import { requireInvitation } from "@/lib/dashboard/session";
import { whatsappConfig, deliveryStore } from "@/lib/whatsapp/server";
import { renderTemplate, templateParameters, sendTemplate, type Delivery } from "@/lib/whatsapp/core";
import { whatsappPhone } from "@/lib/guests/whatsapp";

async function context(guestId: string) {
  const session = await requireInvitation();
  const { data: guest } = await session.supabase.from("guests").select("*")
    .eq("id", guestId).eq("invitation_id", session.invitation.id).maybeSingle();
  if (!guest) throw new Error("Guest not found.");
  return { ...session, guest };
}
function couple(invitation: { bride_name: string | null; groom_name: string | null }) {
  return [invitation.bride_name, invitation.groom_name].filter(Boolean).join(" & ");
}

export async function prepareWhatsAppApi(guestId: string) {
  const config = whatsappConfig();
  // Inactive setup exposes no guest data and performs no database operation.
  if (!config || !process.env.SUPABASE_SECRET_KEY) return { issue: "Business API sending is not active. The approved template and server setup are required.",
    delivery: null as Delivery | null, recipient: null as string | null, version: 0, preview: "", template: "" };
  const { supabase, invitation, guest, user } = await context(guestId);
  const enabled = !!config && !!process.env.SUPABASE_SECRET_KEY && process.env.WHATSAPP_OWNER_ID === user.id;
  let delivery: Delivery | null = null;
  let issue = enabled ? "" : "Business API sending is not active. The approved template and server setup are required.";
  if (enabled) {
    const result = await supabase.from("whatsapp_deliveries").select("id,status,updated_at,error_code").eq("guest_id", guest.id).maybeSingle();
    if (result.error) issue = "Delivery tracking is not ready. Complete the approved database setup before sending.";
    else delivery = result.data as Delivery | null;
  }
  if (!invitation.published) issue = "Publish the invitation before sending.";
  if (!whatsappPhone(guest.phone) || !guest.public_token) issue = "Save a valid international phone number and personal link first.";
  if (!couple(invitation)) issue = "Save the couple names before sending.";
  const parameters = config ? templateParameters(guest, couple(invitation), invitation.slug, config.origin) : [];
  return { issue, delivery, recipient: guest.phone as string | null, version: guest.version as number,
    preview: parameters.length ? renderTemplate(parameters) : "", template: config ? `${config.template} · ${config.language}` : "" };
}

export async function sendWhatsAppInvitation(guestId: string, expectedVersion: number, reviewedPreview: string, consent: boolean) {
  const { invitation, guest, user } = await context(guestId);
  const config = whatsappConfig();
  if (!config || !process.env.SUPABASE_SECRET_KEY || process.env.WHATSAPP_OWNER_ID !== user.id)
    return { ok: false, message: "Business API sending is not active." };
  if (consent !== true) return { ok: false, message: "Confirm this recipient agreed to receive the invitation on WhatsApp." };
  const phone = whatsappPhone(guest.phone);
  if (!invitation.published || !phone || !guest.public_token || !couple(invitation) || guest.version !== expectedVersion)
    return { ok: false, message: "Invitation or guest details changed. Refresh the preview before sending." };
  const parameters = templateParameters(guest, couple(invitation), invitation.slug, config.origin);
  if (renderTemplate(parameters) !== reviewedPreview) return { ok: false, message: "The message changed. Refresh and review it before sending." };
  const store = deliveryStore();
  const attempt = crypto.randomUUID();
  const { data: reserved, error } = await store.rpc("reserve_whatsapp_invitation", { p_id: attempt, p_guest: guest.id,
    p_owner: user.id, p_version: expectedVersion, p_recipient: phone, p_template: config.template, p_language: config.language });
  if (error || !reserved) return { ok: false, message: "Nothing was sent by this request. Tracking may be unavailable, an attempt already exists, details changed, or the sending limit was reached. Refresh the status before continuing." };
  const result = await sendTemplate(config, guest.phone, parameters, attempt);
  const saved = await store.rpc("record_whatsapp_status", { p_attempt: attempt, p_provider: result.status === "accepted" ? result.providerId : null,
    p_recipient: phone, p_status: result.status, p_code: result.status === "accepted" ? null : result.code });
  if (saved.error) return { ok: false, message: "An attempt was made but its status could not be saved. Do not resend; reconcile with Meta first." };
  return { ok: result.status === "accepted", message: result.status === "accepted"
    ? "Accepted by WhatsApp. Delivery will be confirmed separately."
    : result.status === "failed" ? "WhatsApp rejected the invitation. Check the template, recipient and provider setup."
      : "Sending outcome is unknown. Do not resend; check Meta and refresh delivery status." };
}
