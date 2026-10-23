"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireInvitation } from "@/lib/dashboard/session";
import { mergeInvitationTheme } from "@/lib/invitations/theme";
import { vendorSocialUrl } from "@/lib/invitations/coastal-options";
import { eventRsvpReady } from "@/lib/invitations/event-rsvp-setup";
import { safeUrl, seatCount } from "@/lib/invitations/validation";
import { guestDatabaseError } from "@/lib/guests/errors";
import {
  normalizeGuestPhone,
  validGuestEmail,
  PHONE_ERROR,
} from "@/lib/guests/contact";
import type { Guest, GuestSide, RsvpStatus } from "@/lib/supabase/types";

export type ActionResult =
  | { ok: true; guest?: Guest }
  | { ok: false; error: string };

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function signUp(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));

  if (!name || !email || password.length < 6) {
    return {
      ok: false,
      error:
        "Name, email, and a password of at least 6 characters are required.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data.session) {
    return {
      ok: false,
      error:
        "Account created. Confirm your email in Supabase Auth, then sign in.",
    };
  }

  redirect("/dashboard");
}

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = asString(formData.get("email"));
  const password = asString(formData.get("password"));

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: error.message };
  }

  const next = asString(formData.get("next"));
  redirect(
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateInvitation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, invitation } = await requireInvitation();
  const weddingDate = asString(formData.get("wedding_date"));
  if (weddingDate && Number.isNaN(Date.parse(weddingDate)))
    return { ok: false, error: "Please enter a valid wedding date." };
  let theme;
  try {
    const inputTheme = JSON.parse(
      asString(formData.get("theme")) || JSON.stringify(invitation.theme),
    );
    if (
      !inputTheme ||
      typeof inputTheme !== "object" ||
      Array.isArray(inputTheme)
    )
      throw new Error("Invalid invitation settings");
    // Editors opened before this feature existed omit the key. Preserve the
    // current server setting; a modern editor can still explicitly turn it off.
    for (const kind of ["whatsapp", "instagram"] as const) {
      const value = inputTheme.footer?.[`${kind}_url`];
      if (value && !vendorSocialUrl(value, kind))
        return {
          ok: false,
          error: `Add a valid HTTPS ${kind === "whatsapp" ? "WhatsApp (wa.me or whatsapp.com)" : "Instagram (instagram.com)"} link in Footer, or clear the link.`,
        };
    }
    theme = mergeInvitationTheme(invitation.theme, inputTheme);
  } catch {
    return {
      ok: false,
      error:
        "The invitation settings could not be read. Please reload and try again.",
    };
  }
  if (theme.music_source === "youtube" && !theme.youtube_url)
    return {
      ok: false,
      error:
        "Add a valid YouTube video link in Music, or choose a different music source.",
    };
  if (theme.rsvp_events_enabled) {
    if (
      !theme.events.length ||
      new Set(theme.events.map((e) => e.id)).size !== theme.events.length
    )
      return {
        ok: false,
        error:
          "Add at least one named event with a unique ID before enabling event attendance.",
      };
    if (!(await eventRsvpReady(supabase, invitation.id)))
      return {
        ok: false,
        error:
          "Per-event RSVP needs its database update before it can be enabled.",
      };
  }
  if (
    formData.get("published") === "on" &&
    (!asString(formData.get("bride_name")) ||
      !asString(formData.get("groom_name")) ||
      !weddingDate)
  )
    return {
      ok: false,
      error: "Add both names and the wedding date before publishing.",
    };

  const { error } = await supabase
    .from("invitations")
    .update({
      bride_name: asString(formData.get("bride_name")) || null,
      groom_name: asString(formData.get("groom_name")) || null,
      wedding_date: weddingDate ? new Date(weddingDate).toISOString() : null,
      venue_name: asString(formData.get("venue_name")) || null,
      venue_address: asString(formData.get("venue_address")) || null,
      story: asString(formData.get("story")) || null,
      cover_photo_url: safeUrl(asString(formData.get("cover_photo_url"))),
      theme,
      published: formData.get("published") === "on",
    })
    .eq("id", invitation.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invitation");
  revalidatePath(`/i/${invitation.slug}`);
  return { ok: true };
}

export async function addGuest(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, invitation } = await requireInvitation();
  const name = asString(formData.get("name"));
  const side = asString(formData.get("side")) as GuestSide;
  const phone = normalizeGuestPhone(asString(formData.get("phone")));
  const email = asString(formData.get("email"));
  const invitedCount = seatCount(
    asString(formData.get("invited_count")) || "1",
  );

  if (
    !name ||
    name.length > 200 ||
    !invitedCount ||
    (side !== "bride" && side !== "groom")
  ) {
    return {
      ok: false,
      error: "Guest name, WhatsApp number and side are required.",
    };
  }
  if (!phone) return { ok: false, error: PHONE_ERROR };
  if (!validGuestEmail(email))
    return { ok: false, error: "Enter a valid email address." };

  const { data, error } = await supabase
    .from("guests")
    .insert({
      id: crypto.randomUUID(),
      invitation_id: invitation.id,
      name,
      side,
      group: asString(formData.get("group")) || null,
      invited_count: invitedCount,
      email: email || null,
      phone,
      table_name: asString(formData.get("table_name")) || null,
      notes: asString(formData.get("notes")) || null,
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: guestDatabaseError(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/check-in");
  return { ok: true, guest: data as Guest };
}

export async function importGuests(
  rows: Array<{
    name: string;
    side: GuestSide;
    group?: string;
    phone?: string;
    email?: string;
    invited_count?: number;
  }>,
): Promise<ActionResult> {
  const { supabase, invitation } = await requireInvitation();
  if (
    !Array.isArray(rows) ||
    rows.length === 0 ||
    rows.length > 500 ||
    rows.some(
      (row) =>
        !row ||
        typeof row.name !== "string" ||
        !row.name.trim() ||
        !["bride", "groom"].includes(row.side) ||
        (row.phone !== undefined && typeof row.phone !== "string") ||
        (row.email !== undefined && typeof row.email !== "string") ||
        (row.group !== undefined && typeof row.group !== "string") ||
        !seatCount(row.invited_count ?? 1),
    )
  )
    return {
      ok: false,
      error: "Import up to 500 parties at a time, with 1–100 seats each.",
    };
  for (const [index, row] of rows.entries()) {
    if (!normalizeGuestPhone(row.phone))
      return { ok: false, error: `Row ${index + 2}: ${PHONE_ERROR}` };
    if (!validGuestEmail(row.email?.trim() ?? ""))
      return {
        ok: false,
        error: `Row ${index + 2}: enter a valid email address.`,
      };
    if (row.name.trim().length > 200)
      return {
        ok: false,
        error: `Row ${index + 2}: keep the name under 200 characters.`,
      };
  }
  const payload = rows
    .map((row) => ({
      id: crypto.randomUUID(),
      invitation_id: invitation.id,
      name: row.name.trim(),
      side: row.side,
      group: row.group?.trim() || null,
      phone: normalizeGuestPhone(row.phone),
      email: row.email?.trim().slice(0, 254) || null,
      invited_count: Math.max(1, row.invited_count ?? 1),
    }))
    .filter(
      (row) => row.name && (row.side === "bride" || row.side === "groom"),
    );

  if (payload.length === 0) {
    return { ok: false, error: "No valid guest rows found in the CSV." };
  }

  const { error } = await supabase.from("guests").insert(payload);
  if (error) {
    return { ok: false, error: guestDatabaseError(error) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/check-in");
  return { ok: true };
}

export async function updateGuestStatus(
  guestId: string,
  rsvpStatus: RsvpStatus,
) {
  const { supabase, invitation } = await requireInvitation();
  const { error } = await supabase
    .from("guests")
    .update({
      rsvp_status: rsvpStatus,
      responded_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .eq("invitation_id", invitation.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/guests");
  return { ok: true as const };
}

export async function deleteGuest(guestId: string) {
  const { supabase, invitation } = await requireInvitation();
  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("invitation_id", invitation.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard/check-in");
  return { ok: true as const };
}

export async function setGuestCheckedIn(guestId: string, checkedIn: boolean) {
  const { supabase, invitation } = await requireInvitation();
  const { error } = await supabase
    .from("guests")
    .update({
      checked_in: checkedIn,
      checked_in_at: checkedIn ? new Date().toISOString() : null,
    })
    .eq("id", guestId)
    .eq("invitation_id", invitation.id);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard/check-in");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function updateSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase, profile, invitation } = await requireInvitation();
  const name = asString(formData.get("name"));
  const slug = asString(formData.get("slug"))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!name) {
    return { ok: false, error: "Account name is required." };
  }

  if (slug.length < 3) {
    return {
      ok: false,
      error: "Invitation slug must be at least 3 characters.",
    };
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({ name })
    .eq("id", profile.id);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: slugError } = await supabase
    .from("invitations")
    .update({ slug })
    .eq("id", invitation.id);

  if (slugError) {
    if (slugError.message.includes("invitations_slug_key")) {
      return { ok: false, error: "That invitation URL is already taken." };
    }
    return { ok: false, error: slugError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/i/${invitation.slug}`);
  revalidatePath(`/i/${slug}`);
  return { ok: true };
}
