import { notFound } from "next/navigation";
import { requireInvitation } from "@/lib/dashboard/session";
import { InvitationTemplate } from "@/components/templates";
import { supportedDesign } from "@/lib/invitations/designs";
export const dynamic = "force-dynamic";
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ design?: string }>;
}) {
  const { slug } = await params;
  const { invitation, supabase } = await requireInvitation();
  if (slug !== invitation.slug) notFound();
  const { design } = await searchParams;
  if (design && !supportedDesign(design)) notFound();
  const { data: template, error } = await supabase
    .from("templates")
    .select("component_key")
    .eq("id", invitation.template_id)
    .maybeSingle();
  if (error)
    throw new Error(
      "Your invitation design could not be loaded. Please try again.",
    );
  return (
    <InvitationTemplate
      invitation={invitation}
      componentKey={design || template?.component_key || "classic"}
      preview
    />
  );
}
