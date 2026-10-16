import type { RsvpStatus } from "@/lib/supabase/types";

const STYLES: Record<RsvpStatus, string> = {
  pending: "bg-surface text-muted ring-border",
  attending: "bg-foreground text-background ring-foreground",
  declined: "bg-background text-muted ring-border",
};

export function StatusBadge({ status }: { status: RsvpStatus }) {
  return (
    <span
      className={`guest-status-badge inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wide uppercase ring-1 ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
