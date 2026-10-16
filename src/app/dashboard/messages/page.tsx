import { getGuests, requireInvitation } from "@/lib/dashboard/session";
import { PageHeader } from "@/components/page-header";
import { formatDateTime } from "@/lib/invitations/display";
export default async function Messages() {
  const { invitation } = await requireInvitation();
  const guests = (await getGuests(invitation.id))
    .filter((g) => g.rsvp_message)
    .sort((a, b) => (b.responded_at || "").localeCompare(a.responded_at || ""));
  return (
    <div className="space-y-6">
      <PageHeader
        title="Words to keep"
        description="Private wishes and messages shared with your guests’ RSVPs. These are visible only in your studio."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        {guests.map((g) => (
          <article className="card section-card" key={g.id}>
            <p className="font-serif text-xl italic leading-8 whitespace-pre-line">
              “{g.rsvp_message}”
            </p>
            <p className="mt-6 text-sm">{g.name}</p>
            <p className="text-xs text-muted mt-1">
              {formatDateTime(g.responded_at)}
            </p>
          </article>
        ))}
      </div>
      {!guests.length && (
        <div className="card empty-state">
          <h2>The kindest words are still to come.</h2>
          <p>Messages appear here when guests leave a wish with their reply.</p>
        </div>
      )}
    </div>
  );
}
