import { requireInvitation, getGuests } from "@/lib/dashboard/session";
import { emailConfigured } from "@/lib/email/provider";
import { EmailStudio } from "@/components/dashboard/email-studio";
import { PageHeader } from "@/components/page-header";
export default async function EmailPage() {
  const { supabase, invitation, profile } = await requireInvitation();
  const guests = await getGuests(invitation.id);
  const { data, error } = await supabase
    .from("email_deliveries")
    .select("guest_id,status,error,updated_at")
    .eq("invitation_id", invitation.id);
  return (
    <div className="space-y-6">
      <PageHeader
        title="An invitation, personally sent"
        description="Send each party their own private link. Review the email before sending, and follow its progress here."
      />
      <EmailStudio
        guests={guests}
        invitation={invitation}
        deliveries={data ?? []}
        configured={emailConfigured() && !error}
        accountEmail={profile.email}
      />
    </div>
  );
}
