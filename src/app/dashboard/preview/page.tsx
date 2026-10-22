import { ArrowIcon } from "@/components/arrow-icon";
import { requireInvitation } from "@/lib/dashboard/session";
import { InvitationPreview } from "@/components/dashboard/invitation-preview";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
export default async function PreviewPage() {
  const { invitation } = await requireInvitation();
  return (
    <div className="space-y-6">
      <Link href="/dashboard/invitation" className="preview-back"><ArrowIcon direction="left" /> Back to invitation</Link>
      <PageHeader
        title="Preview invitation"
        description="See your invitation as guests will see it, using your latest saved details."
      />
      <InvitationPreview invitation={invitation} />
    </div>
  );
}
