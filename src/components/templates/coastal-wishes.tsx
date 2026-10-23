"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicWish } from "@/lib/invitations/wishes";

export function CoastalWishes({ wishes }: { wishes: PublicWish[] }) {
  const scroll = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const measure = () => {
      const el = scroll.current;
      setOverflow(!!el && el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (scroll.current) observer.observe(scroll.current);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [wishes]);
  return (
    <>
      {overflow && (
        <p className="coastal-wishes-hint" id="coastal-wishes-hint">
          Scroll to read all wishes
        </p>
      )}
      <div
        ref={scroll}
        className="coastal-wishes-scroll"
        role="region"
        aria-label="Guest wishes"
        aria-describedby={overflow ? "coastal-wishes-hint" : undefined}
        tabIndex={overflow ? 0 : undefined}
      >
        <div ref={content}>
          {wishes.map((w, i) => (
            <blockquote key={i}>
              <p>“{w.message}”</p>
              <cite>from {w.name}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </>
  );
}
