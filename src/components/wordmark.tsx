import Link from "next/link";

export function Wordmark({
  href,
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  const mark = (
    <span
      className={`inline-flex items-center gap-2.5 text-xl leading-none tracking-tight ${className}`.trim()}
      style={{fontFamily:'var(--font-geist-sans)', fontWeight:600}}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-accent text-base text-white" aria-hidden>w</span>
      Written Dearly
    </span>
  );

  if (!href) return mark;
  return <Link href={href} className="inline-flex min-h-11 items-center shrink-0" aria-label="Written Dearly home">{mark}</Link>;
}
