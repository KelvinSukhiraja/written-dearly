export function RsvpChart({
  attending,
  declined,
  pending,
}: {
  attending: number;
  declined: number;
  pending: number;
}) {
  const total = attending + declined + pending;
  const safeTotal = total || 1;
  const attendingPct = (attending / safeTotal) * 100;
  const declinedPct = (declined / safeTotal) * 100;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="relative size-40 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(#000 0 ${attendingPct}%, #888 ${attendingPct}% ${attendingPct + declinedPct}%, #eaeaea ${attendingPct + declinedPct}% 100%)`,
        }}
        role="img"
        aria-label={`RSVP breakdown: ${attending} attending, ${declined} declined, ${pending} pending`}
      >
        <div className="absolute inset-5 rounded-full bg-background" />
        <p className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
            parties
          </span>
        </p>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-foreground" /> Attending ·{" "}
          {attending}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-subtle" /> Declined ·{" "}
          {declined}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-border" /> Pending ·{" "}
          {pending}
        </li>
      </ul>
    </div>
  );
}
