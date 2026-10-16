import { headers } from "next/headers";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { requireInvitation } from "@/lib/dashboard/session";

export default async function SettingsPage() {
  const { profile, invitation } = await requireInvitation();
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const publicUrl = host
    ? `${protocol}://${host}/i/${invitation.slug}`
    : `/i/${invitation.slug}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account details and the public URL for this invitation."
      />
      <SettingsForm
        profile={profile}
        invitation={invitation}
        publicUrl={publicUrl}
      />
    </div>
  );
}
