"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";

function hoverTarget(event: Event) {
  const node = event.target;
  if (!(node instanceof Element)) return null;
  if (node.closest(".workspace")) return null;
  return node.closest<HTMLElement>("[data-hover], .btn");
}

function isEntering(event: PointerEvent, target: HTMLElement) {
  const related = event.relatedTarget;
  return !(related instanceof Node && target.contains(related));
}

export function HoverRoot({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const el = root.current;
      if (!el || !contextSafe || !window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;

      const onOver = contextSafe((event: Event) => {
        const pointer = event as PointerEvent;
        const target = hoverTarget(pointer);
        if (!target || !isEntering(pointer, target)) return;

        const kind = target.dataset.hover ?? "lift";
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reduced) {
          if (kind === "card") gsap.set(target, { borderColor: "#111" });
          return;
        }

        if (kind === "card") {
          gsap.to(target, {
            y: -3,
            borderColor: "#111",
            duration: 0.28,
            overwrite: "auto",
          });
          return;
        }

        if (kind === "nav") {
          gsap.to(target, { x: 4, duration: 0.22, overwrite: "auto" });
          return;
        }

        if (kind === "lift") {
          gsap.to(target, {
            y: -2,
            borderColor: target.classList.contains("btn-secondary")
              ? "#111"
              : undefined,
            duration: 0.22,
            overwrite: "auto",
          });
          return;
        }

        gsap.to(target, { y: -2, duration: 0.22, overwrite: "auto" });
      });

      const onOut = contextSafe((event: Event) => {
        const pointer = event as PointerEvent;
        const target = hoverTarget(pointer);
        if (!target || !isEntering(pointer, target)) return;
        const leavingTo = pointer.relatedTarget;
        if (leavingTo instanceof Node && target.contains(leavingTo)) return;

        const kind = target.dataset.hover ?? "lift";
        gsap.to(target, {
          x: 0,
          y: 0,
          borderColor:
            kind === "card" || target.classList.contains("btn-secondary")
              ? "#d4d4d4"
              : undefined,
          duration: 0.28,
          overwrite: "auto",
        });
      });

      el.addEventListener("pointerover", onOver);
      el.addEventListener("pointerout", onOut);
      return () => {
        el.removeEventListener("pointerover", onOver);
        el.removeEventListener("pointerout", onOut);
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-full flex-1 flex-col">
      {children}
    </div>
  );
}
