import type { InvitationEvent } from "./theme";
import type { EventResponses, Guest } from "@/lib/supabase/types";

export function permittedEvents(
  events: InvitationEvent[],
  access: string[] = [],
) {
  return events.filter((event) => !access.length || access.includes(event.id));
}

export function eventResponseMap(value: unknown): EventResponses {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, status]) =>
        key.length > 0 &&
        key.length <= 80 &&
        (status === "attending" || status === "declined"),
    ),
  ) as EventResponses;
}

export function eventTotals(guests: Guest[], events: InvitationEvent[]) {
  return events.map((event) => {
    let attending = 0,
      declined = 0,
      pending = 0;
    for (const guest of guests) {
      if (guest.event_ids?.length && !guest.event_ids.includes(event.id))
        continue;
      const status = eventResponseMap(guest.event_responses)[event.id];
      if (guest.rsvp_status === "attending" && status === "attending")
        attending += guest.rsvp_attending_count ?? 0;
      else if (status === "declined") declined++;
      else pending++;
    }
    return { event, attending, declined, pending };
  });
}

export function eventChoices(
  ids: string[],
  selected: string[],
  attending: boolean,
): EventResponses {
  return Object.fromEntries(
    ids.map((id) => [
      id,
      attending && selected.includes(id) ? "attending" : "declined",
    ]),
  );
}
