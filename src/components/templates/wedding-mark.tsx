import "./wedding-mark.css";

/** Decorative artwork; the surrounding heading/link supplies the accessible name. */
export function WeddingMark({
  variant = "crest",
  className = "",
}: {
  variant?: "crest" | "monogram";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`wd-wedding-mark wd-wedding-mark-${variant} ${className}`}
    />
  );
}
