"use client";

import { useEffect, useMemo, useState } from "react";

function partsFrom(ms: number) {
  const remaining = Math.max(0, ms);
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1_000),
  };
}

export function ClassicCountdown({ weddingDate }: { weddingDate: string }) {
  const target = useMemo(() => new Date(weddingDate).getTime(), [weddingDate]);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (remaining === null || Number.isNaN(target) || remaining <= 0) {
    return null;
  }

  const parts = partsFrom(remaining);

  return (
    <div
      className="countdown"
      aria-label={`${parts.days} days until the wedding`}
    >
      {(
        [
          ["days", parts.days],
          ["hours", parts.hours],
          ["minutes", parts.minutes],
          ["seconds", parts.seconds],
        ] as const
      ).map(([label, value]) => (
        <div className="countdown-item" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
