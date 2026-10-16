"use client";

import { useEffect, useRef } from "react";

export function LandingMotion({ children, className }: { children: React.ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const story = element.querySelector<HTMLElement>("[data-index-story]");
    let frame = 0;
    const update = () => {
      frame = 0;
      element.dataset.motion = reduced.matches ? "static" : "ready";
      if (story) {
        const rect = story.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
        story.style.setProperty("--drift", reduced.matches ? "0px" : `${(progress - .5) * 44}px`);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.seen = "true";
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });
    element.querySelectorAll("[data-index-reveal]").forEach(el => observer.observe(el));
    const revealOnFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const section = event.target.closest<HTMLElement>("[data-index-reveal]");
        if (section) section.dataset.seen = "true";
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    element.addEventListener("focusin", revealOnFocus);
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      element.removeEventListener("focusin", revealOnFocus);
    };
  }, []);
  return <div ref={root} className={className}>{children}</div>;
}
