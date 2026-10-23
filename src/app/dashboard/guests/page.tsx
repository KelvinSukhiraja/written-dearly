import { PageHeader } from "@/components/page-header";
import { GuestsTable } from "@/components/dashboard/guests-table";
import { getGuests, requireInvitation } from "@/lib/dashboard/session";
import { parseInvitationTheme } from "@/lib/invitations/theme";
import {
  isMissingGuestUpgrade,
  GUEST_UPGRADE_MESSAGE,
} from "@/lib/guests/errors";

export default async function GuestsPage() {
  const { invitation, supabase } = await requireInvitation();
  const guests = await getGuests(invitation.id);
  const { error } = await supabase
    .from("guests")
    .select(
      "phone,email,table_name,notes,dietary,event_ids,version,public_token,checkin_token,checked_in_count,extra_seats,invitation_sent_at",
    )
    .limit(0);
  if (error && !isMissingGuestUpgrade(error))
    throw new Error(
      "Could not check guest setup. Please refresh and try again.",
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guests"
        description="Add guests, set companion allowances, share through WhatsApp and track replies."
      />
      <GuestsTable
        setupIssue={error ? GUEST_UPGRADE_MESSAGE : ""}
        guests={guests}
        slug={invitation.slug}
        published={invitation.published}
        coupleName={
          [invitation.bride_name, invitation.groom_name]
            .filter(Boolean)
            .join(" & ") || "Our wedding"
        }
        events={parseInvitationTheme(invitation.theme).events}
        eventRsvp={parseInvitationTheme(invitation.theme).rsvp_events_enabled}
      />
    </div>
  );
}
