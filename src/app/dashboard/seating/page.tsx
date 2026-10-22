import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { getGuests, requireInvitation } from "@/lib/dashboard/session";
import { PageHeader } from "@/components/page-header";
export default async function SeatingPage() {
  const { invitation } = await requireInvitation();
  const guests = await getGuests(invitation.id);
  const groups = new Map<string, typeof guests>();
  for (const g of guests) {
    const table = g.table_name || "Unassigned";
    groups.set(table, [...(groups.get(table) || []), g]);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="A place for everyone"
        description="Plan by party and see the people expected at each table. Edit table assignments in Guests & RSVP."
      />
      <Link className="btn btn-secondary" href="/dashboard/guests">
        Manage assignments <ArrowIcon />
      </Link>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[...groups].map(([table, parties]) => (
          <section className="card section-card" key={table}>
            <p className="eyebrow-label">
              {table === "Unassigned" ? "Awaiting a place" : "Table"}
            </p>
            <h2>{table}</h2>
            <p>
              {parties.reduce(
                (n, g) =>
                  n +
                  (g.rsvp_status === "attending"
                    ? (g.rsvp_attending_count ?? g.invited_count)
                    : 0),
                0,
              )}{" "}
              confirmed people ·{" "}
              {parties.reduce((n, g) => n + g.invited_count, 0)} reserved seats
            </p>
            <ul className="divide-y divide-border">
              {parties.map((g) => (
                <li key={g.id} className="py-3 text-sm">
                  <span>{g.name}</span>
                  <span className="float-right">
                    {g.rsvp_attending_count ?? "—"}
                  </span>
                  {g.dietary && (
                    <p className="text-xs text-muted mt-2">{g.dietary}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {!guests.length && (
        <p className="empty-state card">
          Your seating plan begins with your guest list.
        </p>
      )}
    </div>
  );
}
