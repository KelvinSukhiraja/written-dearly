"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap-client";

export function DashboardReveal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
        y: reduced ? 0 : 10,
        duration: reduced ? 0 : 0.5,
        stagger: reduced ? 0 : 0.05,
        ease: "power2.out",
      });
    },
    { scope: root, dependencies: [pathname], revertOnUpdate: true },
  );

  return <div ref={root}>{children}</div>;
}
