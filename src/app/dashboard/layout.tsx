import { Sidebar } from "@/components/dashboard/sidebar";
import { requireInvitation } from "@/lib/dashboard/session";
import "@/components/dashboard/workspace.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, supabase, invitation } = await requireInvitation();
  const { error: setupError } = await supabase
    .from("guests")
    .select("public_token")
    .limit(0);
  const couple =
    [invitation.bride_name, invitation.groom_name]
      .filter(Boolean)
      .join(" & ") || profile.name;
  return (
    <div className="workspace min-h-dvh bg-background text-foreground">
      <Sidebar coupleName={couple} />
      <div className="workspace-main lg:pl-60">
        <main
          id="workspace-content"
          tabIndex={-1}
          className="workspace-content mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
        >
          {setupError && (
            <p className="notice notice-error mb-6" role="status">
              Guest invitations and check-in are not ready yet. Please contact
              your administrator before sharing links.
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
