type ArrowDirection = "right" | "left" | "up" | "down" | "up-right";

const paths: Record<ArrowDirection, string> = {
  right: "M4 12h16m-7-7 7 7-7 7",
  left: "M20 12H4m7-7-7 7 7 7",
  up: "M12 20V4m-7 7 7-7 7 7",
  down: "M12 4v16m-7-7 7 7 7-7",
  "up-right": "M5 19 19 5M5 5h14v14",
};

/** Decorative, font-independent arrow for links and buttons. */
export function ArrowIcon({ direction = "right" }: { direction?: ArrowDirection }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
