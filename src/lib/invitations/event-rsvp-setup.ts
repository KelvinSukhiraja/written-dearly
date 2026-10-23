import type { createClient } from "@/lib/supabase/server";

export async function eventRsvpReady(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invitationId: string,
) {
  const { error } = await supabase
    .from("guests")
    .select("event_responses")
    .eq("invitation_id", invitationId)
    .limit(0);
  if (!error) return true;
  if (["42703", "PGRST204"].includes(error.code)) return false;
  throw new Error(
    "Could not check event RSVP setup. Please refresh and try again.",
  );
}
