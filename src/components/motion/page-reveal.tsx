"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";

export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll("[data-reveal]");
      if (!items?.length) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.from(items, {
        autoAlpha: 0,
        y: reduced ? 0 : 12,
        duration: reduced ? 0 : 0.65,
        stagger: reduced ? 0 : 0.07,
        ease: "power2.out",
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
