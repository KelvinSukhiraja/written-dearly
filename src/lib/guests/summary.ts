import type { Guest } from "../supabase/types";

export function confirmedCount(guest: Guest) {
  return guest.rsvp_status === "attending"
    ? (guest.rsvp_attending_count ?? guest.invited_count)
    : 0;
}

export function arrivedCount(guest: Guest) {
  return (
    guest.checked_in_count ?? (guest.checked_in ? confirmedCount(guest) : 0)
  );
}

export function guestSummary(guests: Guest[]) {
  return guests.reduce(
    (total, guest) => {
      const confirmed = confirmedCount(guest);
      const arrived = arrivedCount(guest);
      return {
        reserved: total.reserved + guest.invited_count,
        confirmed: total.confirmed + confirmed,
        arrived: total.arrived + arrived,
        remaining: total.remaining + Math.max(0, confirmed - arrived),
        pending: total.pending + Number(guest.rsvp_status === "pending"),
      };
    },
    { reserved: 0, confirmed: 0, arrived: 0, remaining: 0, pending: 0 },
  );
}
