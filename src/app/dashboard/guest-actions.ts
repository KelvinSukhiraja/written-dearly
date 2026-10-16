"use server";

import { revalidatePath } from "next/cache";
import { requireInvitation } from "@/lib/dashboard/session";
import { seatCount, receptionToken } from "@/lib/invitations/validation";
import type { Guest } from "@/lib/supabase/types";
import { guestDatabaseError } from "@/lib/guests/errors";
import { normalizeGuestPhone, PHONE_ERROR } from "@/lib/guests/contact";

export async function saveGuest(id: string, form: FormData) {
  const { supabase, invitation } = await requireInvitation();
  const text = (key: string, max = 500) =>
    String(form.get(key) ?? "")
      .trim()
      .slice(0, max);
  const invited = seatCount(form.get("invited_count"));
  const status = text("rsvp_status");
  const count = status === "attending" ? seatCount(form.get("rsvp_attending_count"), 1) : 0;
  if (
    !text("name") ||
    !invited ||
    !["pending", "attending", "declined"].includes(status) ||
    count === null ||
    count > invited ||
    (status === "attending" && count < 1)
  )
    return {
      ok: false,
      error: "Check the party name, seats and attending count.",
    };
  const email = text("email");
  const phone = normalizeGuestPhone(text("phone"));
  if (!phone) return { ok: false, error: PHONE_ERROR };
  const side = text("side");
  if (!["bride", "groom"].includes(side)) return { ok: false, error: "Choose bride or groom." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid email address." };
  const { data, error } = await supabase
    .from("guests")
    .update({
      name: text("name", 200),
      side,
      email: email || null,
      phone,
      group: text("group", 100) || null,
      table_name: text("table_name", 100) || null,
      notes: text("notes", 1000) || null,
      dietary: text("dietary") || null,
      invited_count: invited,
      rsvp_status: status,
      rsvp_attending_count:
        status === "attending" ? count : status === "declined" ? 0 : null,
      responded_at: status === "pending" ? null : new Date().toISOString(),
      event_ids: form.getAll("event_ids").map(String),
      version: Number(form.get("version")) + 1,
    })
    .eq("id", id)
    .eq("invitation_id", invitation.id)
    .eq("version", Number(form.get("version")))
    .select("*")
    .maybeSingle();
  if (error || !data)
    return {
      ok: false,
      error: error
        ? guestDatabaseError(error)
        : "This party changed in another session. Refresh before editing.",
    };
  revalidatePath("/dashboard", "layout");
  return { ok: true, guest: data as Guest };
}

export async function markInvitationSent(id: string, expectedVersion: number, sent: boolean) {
  const { supabase, invitation } = await requireInvitation();
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || typeof sent !== "boolean")
    return { ok: false, error: "Refresh this guest before updating their invitation status." };
  const { data, error } = await supabase.from("guests")
    .update({ invitation_sent_at: sent ? new Date().toISOString() : null, version: expectedVersion + 1 })
    .eq("id", id).eq("invitation_id", invitation.id).eq("version", expectedVersion)
    .select("*").maybeSingle();
  if (error || !data) return { ok: false, error: error ? guestDatabaseError(error) : "This guest changed in another session. Refresh before trying again." };
  revalidatePath("/dashboard", "layout");
  return { ok: true, guest: data as Guest };
}

export async function confirmArrival(
  id: string,
  expectedVersion: number,
  count: number,
  extra: number,
  note: string,
) {
  const { supabase, invitation } = await requireInvitation();
  if (
    seatCount(count, 0, 200) === null ||
    seatCount(extra, 0, 100) === null ||
    (extra > 0 && !note.trim())
  )
    return {
      ok: false,
      error: "Enter a valid arrival count and a note for additional guests.",
    };
  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .eq("invitation_id", invitation.id)
    .maybeSingle();
  if (!guest || count > guest.invited_count + extra)
    return {
      ok: false,
      error: "Arrivals exceed the seats allocated to this party.",
    };
  const { data, error } = await supabase
    .from("guests")
    .update({
      checked_in_count: count,
      extra_seats: extra,
      checked_in: count > 0,
      checked_in_at:
        count > 0 ? guest.checked_in_at || new Date().toISOString() : null,
      staff_notes: note.trim().slice(0, 1000),
      version: expectedVersion + 1,
    })
    .eq("id", id)
    .eq("invitation_id", invitation.id)
    .eq("version", expectedVersion)
    .select("*")
    .maybeSingle();
  if (error || !data)
    return {
      ok: false,
      error:
        error?.message ??
        "Another staff member updated this party. Refresh and check the latest arrival count.",
    };
  revalidatePath("/dashboard", "layout");
  return { ok: true, guest: data as Guest };
}

export async function findReceptionGuest(value: string) {
  const token = receptionToken(value);
  if (!token)
    return { ok: false, error: "That is not a Written Dearly reception code." };
  const { supabase, invitation } = await requireInvitation();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("checkin_token", token)
    .eq("invitation_id", invitation.id)
    .maybeSingle();
  if (error || !data)
    return {
      ok: false,
      error: "This code is invalid or belongs to another wedding.",
    };
  return { ok: true, guest: data as Guest };
}
