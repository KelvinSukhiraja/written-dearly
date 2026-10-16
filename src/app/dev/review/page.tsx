import { notFound } from "next/navigation";
import { sampleInvitation, sampleGuests } from "@/lib/testing/fixture";
import { ClassicInvitation } from "@/components/templates/classic";
import { InvitationEditor } from "@/components/dashboard/invitation-editor";
import { GuestsTable } from "@/components/dashboard/guests-table";
import { CheckInView } from "@/components/dashboard/check-in";
import { Sidebar } from "@/components/dashboard/sidebar";
import { parseInvitationTheme } from "@/lib/invitations/theme";
import { DashboardHome } from "@/components/dashboard/home";
import { DesignPicker } from "@/components/dashboard/design-picker";
import "@/components/dashboard/workspace.css";
import WorkspaceLoading from "@/app/dashboard/loading";
export const dynamic = "force-dynamic";
export default async function Review({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { view } = await searchParams;
  if (view === "youtube")
    return <ClassicInvitation invitation={{ ...sampleInvitation, theme: { ...sampleInvitation.theme, music_source: "youtube", youtube_url: "https://www.youtube.com/watch?v=M7lc1UVf-VE", music_title: "YouTube player preview" } }} preview />;
  if (view === "cm-logo")
    return (
      <ClassicInvitation
        invitation={{
          ...sampleInvitation,
          bride_name: "C",
          groom_name: "M",
          slug: "cm-logo-preview",
          theme: { ...sampleInvitation.theme, wedding_mark: "cm" },
        }}
        preview
      />
    );
  if (view === "invitation")
    return <ClassicInvitation invitation={sampleInvitation} preview />;
  return (
    <div className="workspace">
      <Sidebar coupleName="Amelia & James" />
      <main id="workspace-content" tabIndex={-1} className="lg:pl-60">
        <div className="p-5 sm:p-10 max-w-6xl mx-auto">
          <p className="notice mb-5">
            Local design fixture · Sample data only · Saving requires
            authentication
          </p>
          {view !== "home" && view !== "empty" && (
            <h1 className="studio-heading mb-7">
              {view?.startsWith("guests")
                ? "Guests"
                : view === "reception"
                  ? "Check-in"
                  : "Your invitation"}
            </h1>
          )}
          {view === "loading" ? <WorkspaceLoading /> : view === "home" ? (
            <DashboardHome
              invitation={sampleInvitation}
              guests={sampleGuests}
            />
          ) : view === "empty" ? (
            <DashboardHome
              invitation={{
                ...sampleInvitation,
                bride_name: null,
                groom_name: null,
                wedding_date: null,
              }}
              guests={[]}
            />
          ) : view === "designs" ? (
            <DesignPicker
              slug={sampleInvitation.slug}
              designs={[
                { id: sampleInvitation.template_id, component_key: "classic" },
              ]}
              selected={sampleInvitation.template_id}
            />
          ) : view?.startsWith("guests") ? (
            <GuestsTable
              setupIssue={view === "guests-error" ? "Guest setup is temporarily unavailable. Please try again later." : ""}
              guests={view === "guests-many" ? Array.from({ length: 125 }, (_, i) => ({
                ...sampleGuests[i % sampleGuests.length],
                id: `fixture-${i}`,
                name: `Guest ${String(i + 1).padStart(3, "0")}`,
                phone: "+447700900123",
                invitation_sent_at: i % 2 === 0 ? "2026-10-09T00:00:00Z" : null,
              })) : view === "guests-empty" ? [] : sampleGuests}
              slug={sampleInvitation.slug}
              published
              coupleName="Amelia & James"
              events={parseInvitationTheme(sampleInvitation.theme).events}
            />
          ) : view === "reception" ? (
            <CheckInView guests={sampleGuests} />
          ) : (
            <InvitationEditor
              invitation={sampleInvitation}
              userId={sampleInvitation.user_id}
            />
          )}
        </div>
      </main>
    </div>
  );
}
