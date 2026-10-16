import { getGuests, requireInvitation } from "@/lib/dashboard/session";
import { DashboardHome } from "@/components/dashboard/home";

export default async function OverviewPage() {
  const { invitation } = await requireInvitation();
  const guests = await getGuests(invitation.id);
  return <DashboardHome invitation={invitation} guests={guests} />;
}
