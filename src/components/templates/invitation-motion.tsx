"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export function InvitationMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const match = gsap.matchMedia();
      match.add("(prefers-reduced-motion: no-preference)", () => {
        ref.current
          ?.querySelectorAll(
            ".section-heading, .story-copy, .event-card, .couple-card, .milestone",
          )
          .forEach((el) =>
            gsap.from(el, {
              y: 24,
              opacity: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }),
          );
      });
      match.add(
        "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
        () => {
          ref.current
            ?.querySelectorAll(".story-image img")
            .forEach((el) =>
              gsap.fromTo(
                el,
                { scale: 1.12, yPercent: -4 },
                {
                  yPercent: 4,
                  ease: "none",
                  scrollTrigger: {
                    trigger: el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                  },
                },
              ),
            );
        },
      );
      return () => match.revert();
    },
    { scope: ref },
  );
  return <div ref={ref}>{children}</div>;
}
