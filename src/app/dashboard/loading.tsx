export default function Loading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading your workspace"
    >
      <div className="h-12 w-60 rounded-xl bg-surface" />
      <p className="text-muted">Loading your workspace…</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-32" />
        ))}
      </div>
    </div>
  );
}
