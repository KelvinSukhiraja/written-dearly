import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageReveal } from "@/components/motion/page-reveal";
import { InvitationTemplate } from "@/components/templates";
import { coupleNames } from "@/lib/invitations/display";
import { createClient } from "@/lib/supabase/server";
import type { Invitation, GuestContext } from "@/lib/supabase/types";
import { loadInvitationWishes } from "@/lib/invitations/wishes";

export const dynamic = "force-dynamic";

async function loadInvitation(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const invitation = data as Invitation;
  const { data: template } = await supabase
    .from("templates")
    .select("component_key")
    .eq("id", invitation.template_id)
    .maybeSingle();

  return {
    invitation,
    componentKey: (template?.component_key as string | undefined) ?? "classic",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadInvitation(slug);
  if (!loaded) {
    return { title: "Invitation" };
  }
  const names = coupleNames(loaded.invitation);
  return {
    title: names ? `${names} · Written Dearly` : "Invitation · Written Dearly",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
    description: names
      ? `You are invited to the wedding of ${names}.`
      : "A wedding invitation.",
  };
}

export default async function PublicInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string }>;
}) {
  const { slug } = await params;
  const loaded = await loadInvitation(slug);

  if (!loaded) {
    notFound();
  }
  const { guest: token } = await searchParams;
  let guest: GuestContext | null = null;
  if (token) {
    if (!/^[a-f0-9]{64}$/.test(token)) notFound();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("guest_context", {
      p_slug: slug,
      p_token: token,
    });
    if (error)
      throw new Error("Personal invitations are temporarily unavailable.");
    if (!data) notFound();
    guest = data as GuestContext;
  }

  return (
    <main>
      <PageReveal>
        <InvitationTemplate
          invitation={loaded.invitation}
          componentKey={loaded.componentKey}
          guest={guest}
          token={token}
          publicWishes={await loadInvitationWishes(
            await createClient(),
            slug,
            token,
          )}
        />
      </PageReveal>
    </main>
  );
}
