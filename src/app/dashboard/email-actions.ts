"use server";
import { requireInvitation } from "@/lib/dashboard/session";
import { emailConfigured, deliverEmail } from "@/lib/email/provider";
import { invitationEmail } from "@/lib/email/template";
import { coupleNames, formatInviteDate } from "@/lib/invitations/display";
import { revalidatePath } from "next/cache";

export async function sendInvitationEmail(guestId: string, test = false) {
  const { supabase, invitation, user } = await requireInvitation();
  if (!emailConfigured())
    return {
      ok: false,
      error:
        "Email delivery is not configured yet. Ask your administrator to connect a sender.",
    };
  if (!invitation.published && !test)
    return {
      ok: false,
      error: "Publish your invitation before emailing guests.",
    };
  let origin: URL;
  try {
    origin = new URL(process.env.APP_URL!);
    if (origin.protocol !== "https:") throw new Error();
  } catch {
    return {
      ok: false,
      error: "Set APP_URL to the secure public website address.",
    };
  }
  const { data: slot, error: slotError } =
    await supabase.rpc("reserve_mail_slot");
  if (slotError || !slot)
    return {
      ok: false,
      error: slotError
        ? "Email tracking is not configured yet."
        : "Sending limit reached. Please wait a minute before continuing.",
    };
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .eq("invitation_id", invitation.id)
    .maybeSingle();
  if (!guest) return { ok: false, error: "Guest not found." };
  const to = test ? user.email : guest.email;
  if (
    !to ||
    to.length > 254 ||
    !/^[^\s@<>(),;]+@[^\s@<>(),;]+\.[^\s@<>(),;]+$/.test(to)
  )
    return {
      ok: false,
      error: "Add a valid email address for this party first.",
    };
  const message = invitationEmail({
    name: test ? "A preview for you" : guest.name,
    couple: coupleNames(invitation),
    date: formatInviteDate(invitation.wedding_date) ?? "",
    url: test
      ? new URL("/i/" + invitation.slug, origin).href
      : new URL(
          "/i/" + invitation.slug + "?guest=" + guest.public_token,
          origin,
        ).href,
  });
  const attempt = crypto.randomUUID();
  if (!test) {
    const { error } = await supabase
      .from("email_deliveries")
      .insert({
        id: attempt,
        invitation_id: invitation.id,
        guest_id: guest.id,
        recipient: to,
        status: "sending",
      });
    if (error) {
      if (error.code !== "23505")
        return {
          ok: false,
          error: "Could not reserve this email. Nothing was sent.",
        };
      const { data: claimed, error: claimError } = await supabase
        .from("email_deliveries")
        .update({
          status: "sending",
          recipient: to,
          error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("guest_id", guest.id)
        .eq("status", "failed")
        .select("id")
        .maybeSingle();
      if (claimError || !claimed)
        return {
          ok: false,
          error:
            "This invitation was already sent or is still being processed. Check its status before sending again.",
        };
    }
  }
  try {
    const providerId = await deliverEmail(
      to,
      message,
      "<" + attempt + "@" + origin.hostname + ">",
    );
    if (!test) {
      const { error } = await supabase
        .from("email_deliveries")
        .update({
          status: "accepted",
          provider_id: providerId,
          updated_at: new Date().toISOString(),
        })
        .eq("guest_id", guest.id);
      if (error)
        return {
          ok: false,
          error:
            "The provider accepted the email, but tracking could not be updated. Do not resend; check provider logs.",
        };
    }
    revalidatePath("/dashboard/emails");
    return {
      ok: true,
      message: test
        ? "Test sent to your account email."
        : "Accepted by the mail provider. Delivery is not yet confirmed.",
    };
  } catch (error) {
    // Network failures can occur after SMTP acceptance. Do not automatically resend ambiguous attempts.
    const detail = error as { code?: string; responseCode?: number };
    const definite =
      detail.code === "EAUTH" ||
      !!(detail.responseCode && detail.responseCode >= 400);
    if (!test)
      await supabase
        .from("email_deliveries")
        .update({
          status: definite ? "failed" : "unknown",
          error: definite
            ? "The mail provider rejected this message. Check sender configuration and recipient."
            : "Delivery outcome is unknown. Check provider logs before retrying.",
          updated_at: new Date().toISOString(),
        })
        .eq("guest_id", guest.id);
    revalidatePath("/dashboard/emails");
    return {
      ok: false,
      error: definite
        ? "The mail provider rejected this email."
        : "Could not confirm the send. Check provider logs before retrying to avoid duplicates.",
    };
  }
}
