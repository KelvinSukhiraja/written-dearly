type SupabaseError = { message?: string; code?: string } | null | undefined;

/** Returns true when the connected database has not received the guest upgrade yet. */
export function isMissingGuestUpgrade(error: SupabaseError) {
  return error?.code === "42703" || /Could not find the '(email|phone|table_name|dietary|notes|staff_notes|public_token|checkin_token|event_ids|checked_in_count|extra_seats|version|invitation_sent_at)' column of 'guests' in the schema cache/i.test(
    error?.message ?? "",
  );
}

export const GUEST_UPGRADE_MESSAGE =
  "Guest setup needs an update before contacts can be saved or invitations shared. Your existing guests are safe. Please contact the site administrator.";

export function guestDatabaseError(error: SupabaseError) {
  return isMissingGuestUpgrade(error)
    ? GUEST_UPGRADE_MESSAGE
    : error?.message ?? "Please try again.";
}
