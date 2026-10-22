import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { requireInvitation } from "@/lib/dashboard/session";
import { PageHeader } from "@/components/page-header";
import { DesignPicker } from "@/components/dashboard/design-picker";
import { supportedDesign } from "@/lib/invitations/designs";

export default async function DesignsPage() {
  const { supabase, invitation } = await requireInvitation();
  const { data, error } = await supabase
    .from("templates")
    .select("id, component_key")
    .eq("is_active", true);
  const designs = (data ?? []).filter((d) => supportedDesign(d.component_key));
  return (
    <div className="space-y-6">
      <Link
        className="text-sm text-muted underline"
        href="/dashboard/invitation"
      >
        <ArrowIcon direction="left" /> Invitation
      </Link>
      <PageHeader
        title="Choose your invitation"
        description="Choose a design, then make it yours with your names, photos and wedding details."
      />
      {error ? (
        <p className="notice notice-error" role="alert">
          Designs could not be loaded. Refresh to try again. Your current
          invitation is unchanged.
        </p>
      ) : !designs.length ? (
        <p className="notice">
          No designs are available right now. Please try again later.
        </p>
      ) : (
        <DesignPicker
          designs={designs}
          selected={invitation.template_id}
          slug={invitation.slug}
        />
      )}
    </div>
  );
}
