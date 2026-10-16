import { PageHeader } from "@/components/page-header";
import { CheckInView } from "@/components/dashboard/check-in";
import { getGuests, requireInvitation } from "@/lib/dashboard/session";

export default async function CheckInPage() {
  const { invitation } = await requireInvitation();
  const guests = await getGuests(invitation.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-in"
        description="Scan a QR pass or search by name, then confirm how many people have arrived."
      />
      <CheckInView guests={guests} />
    </div>
  );
}
