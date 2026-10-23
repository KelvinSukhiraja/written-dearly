import { ArrowIcon } from "@/components/arrow-icon";
import { PageHeader } from "@/components/page-header";
import { InvitationEditor } from "@/components/dashboard/invitation-editor";
import { requireInvitation } from "@/lib/dashboard/session";
import Link from "next/link";
import { eventRsvpReady } from "@/lib/invitations/event-rsvp-setup";
import { WishesManager } from "@/components/dashboard/wishes-manager";

export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { invitation, user, supabase } = await requireInvitation();
  const eventSetupReady = await eventRsvpReady(supabase, invitation.id);
  const wishes = await supabase
    .from("invitation_wish_messages")
    .select("id,name,message,hidden")
    .eq("invitation_id", invitation.id)
    .neq("message", "")
    .order("created_at", { ascending: false });
  const wishesReady = !wishes.error;
  if (wishes.error && !["42P01", "PGRST205"].includes(wishes.error.code))
    throw new Error("Your wishes could not be loaded. Please try again.");
  const { section } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitation"
        description="Choose a design, add your wedding details, then preview and publish."
      />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="text-base font-semibold">Invitation design</h2>
          <p className="mt-1 text-sm text-muted">
            Your content and guest list stay with your invitation.
          </p>
        </div>
        <Link
          className="btn btn-secondary"
          href="/dashboard/invitation/designs"
        >
          Choose design <ArrowIcon />
        </Link>
      </div>
      <InvitationEditor
        key={section ?? "essentials"}
        invitation={invitation}
        userId={user.id}
        eventSetupReady={eventSetupReady}
        initialTab={section === "publish" ? 6 : 0}
      />
      <WishesManager items={wishes.data ?? []} ready={wishesReady} />
    </div>
  );
}
