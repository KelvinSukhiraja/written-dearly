"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventResponseMap } from "@/lib/invitations/event-rsvp";
import type { EventResponses } from "@/lib/supabase/types";
export type RsvpResult =
  | {
      ok: true;
      preview?: boolean;
      version?: number;
      eventResponses?: EventResponses;
    }
  | { ok: false; error: string };

export async function submitRsvp(
  _prev: RsvpResult | null,
  form: FormData,
): Promise<RsvpResult> {
  const slug = String(form.get("slug") ?? ""),
    token = String(form.get("token") ?? "");
  const status = String(form.get("attending"));
  const count = status === "no" ? 0 : Number(form.get("attending_count"));
  if (
    !/^[a-f0-9]{64}$/.test(token) ||
    !["yes", "no"].includes(status) ||
    !Number.isInteger(count) ||
    count < 0 ||
    count > 100 ||
    (status === "yes" && count === 0)
  )
    return {
      ok: false,
      error:
        "Please use your personal invitation link and select your attendance.",
    };
  const message = String(form.get("message") ?? ""),
    dietary = status === "no" ? "" : String(form.get("dietary") ?? "");
  if (message.length > 1000 || dietary.length > 500)
    return { ok: false, error: "Please shorten your message." };
  try {
    const supabase = await createClient();
    const params = {
      p_slug: slug,
      p_token: token,
      p_attending: count,
      p_message: message,
      p_dietary: dietary,
    };
    let result;
    if (form.get("event_mode") === "on") {
      let ids: unknown;
      try {
        ids = JSON.parse(String(form.get("event_ids") ?? ""));
      } catch {
        ids = null;
      }
      const selected =
        status === "no" ? [] : form.getAll("selected_events").map(String);
      const rawVersion = String(form.get("version") ?? "");
      const version = Number(rawVersion);
      if (
        !Array.isArray(ids) ||
        ids.length < 1 ||
        ids.length > 30 ||
        ids.some((id) => typeof id !== "string" || !id || id.length > 80) ||
        new Set(ids).size !== ids.length ||
        selected.length > 30 ||
        selected.some((id) => !(ids as string[]).includes(id)) ||
        new Set(selected).size !== selected.length ||
        !/^\d+$/.test(rawVersion) ||
        !Number.isSafeInteger(version)
      )
        return {
          ok: false,
          error:
            "Reload your personal invitation to check the latest events and reply.",
        };
      if (count > 0 && !selected.length)
        return {
          ok: false,
          error: "Choose at least one event, or select that you cannot attend.",
        };
      const { data, error } = await supabase.rpc(
        form.get("public_wish") === "on"
          ? "respond_to_invitation_with_wish"
          : "respond_to_invitation_events",
        {
          ...params,
          p_selected_events: selected,
          p_event_ids: ids,
          p_version: version,
          ...(form.get("public_wish") === "on" ? { p_event_mode: true } : {}),
        },
      );
      if (error)
        return {
          ok: false,
          error: ["PGRST202", "42883", "42703"].includes(error.code)
            ? "Event RSVP is being prepared. Please contact the couple."
            : error.message,
        };
      if (!data || !Number.isSafeInteger(data.version))
        return {
          ok: false,
          error:
            "Your save could not be confirmed. Reload before trying again.",
        };
      result = {
        ok: true as const,
        version: data.version as number,
        eventResponses: eventResponseMap(data.event_responses),
      };
    } else {
      const { error } = await supabase.rpc(
        form.get("public_wish") === "on"
          ? "respond_to_invitation_with_wish"
          : "respond_to_invitation",
        {
          ...params,
          ...(form.get("public_wish") === "on"
            ? {
                p_event_mode: false,
                p_selected_events: [],
                p_event_ids: [],
                p_version: 0,
              }
            : {}),
        },
      );
      if (error)
        return {
          ok: false,
          error: ["PGRST202", "42883"].includes(error.code)
            ? "RSVP is being prepared. Please contact the couple."
            : error.message,
        };
      result = { ok: true as const };
    }
    revalidatePath("/dashboard", "layout");
    revalidatePath("/i/" + slug);
    return result;
  } catch {
    return {
      ok: false,
      error:
        "Your response could not be saved. Check your connection and try again.",
    };
  }
}
