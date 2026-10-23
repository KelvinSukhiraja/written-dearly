"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Choreographed reveals layered over native scrolling. */
export function useCoastalMotion(
  root: RefObject<HTMLDivElement | null>,
  opened: boolean,
  dismissOpening: () => void,
) {
  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const select = gsap.utils.selector(element);
      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            if (opened) dismissOpening();
            return;
          }
          if (!opened) {
            gsap.from(select(".coastal-opening-card"), {
              opacity: 0,
              y: 16,
              duration: 1.15,
              ease: "power2.out",
              clearProps: "opacity,transform",
            });
            gsap.from(select(".coastal-opening .coastal-cover-photo"), {
              scale: 1.035,
              duration: 2.4,
              ease: "sine.out",
              clearProps: "transform",
            });
            gsap.from(select(".coastal-opening-content > *"), {
              opacity: 0,
              y: 18,
              stagger: 0.11,
              delay: 0.25,
              duration: 1,
              ease: "power3.out",
              clearProps: "opacity,transform",
            });
            return;
          }

          const opening = select(".coastal-opening");
          if (opening.length) {
            const card = element.querySelector<HTMLElement>(
              ".coastal-opening-card",
            )!;
            const cardBox = card.getBoundingClientRect();
            const openingBox = opening[0].getBoundingClientRect();
            const fillScale =
              Math.max(
                openingBox.width / cardBox.width,
                openingBox.height / cardBox.height,
              ) * 1.5;
            gsap
              .timeline({ onComplete: dismissOpening })
              .to(select(".coastal-opening-content > *"), {
                opacity: 0,
                y: -26,
                stagger: 0.055,
                duration: 0.45,
                ease: "power2.in",
              })
              .to(
                select(".coastal-opening-card"),
                {
                  scale: fillScale,
                  y:
                    openingBox.top +
                    openingBox.height / 2 -
                    (cardBox.top + cardBox.height / 2),
                  duration: 1.1,
                  ease: "power3.inOut",
                },
                0.2,
              )
              .to(
                opening,
                {
                  opacity: 0,
                  duration: 0.65,
                  ease: "sine.inOut",
                },
                1.3,
              );
          }
          // Keep the clipping frame stationary; only its image gets parallax.
          // Scaling the frame lets the cover bleed across the next section.
          gsap.from(
            select(
              ".coastal-home-title > p, .coastal-home-title h1 > span, .coastal-date",
            ),
            {
              opacity: 0,
              y: 32,
              stagger: 0.16,
              delay: opening.length ? 1.3 : 0,
              duration: 1.35,
              ease: "power2.out",
              clearProps: "opacity,transform",
            },
          );
          element
            .querySelectorAll<SVGPathElement>(".coastal-ampersand-ink")
            .forEach((pen) => {
              const length = pen.getTotalLength();
              const ink = pen
                .closest("svg")
                ?.querySelector<SVGGElement>("[data-ink-mask]");
              if (!ink) return;
              gsap.set(ink, { attr: { mask: `url(#${ink.dataset.inkMask})` } });
              gsap
                .timeline({
                  delay: opening.length ? 0.95 : 0,
                  onComplete: () => {
                    ink.removeAttribute("mask");
                  },
                })
                .fromTo(
                  pen,
                  {
                    strokeDasharray: `${length} ${length}`,
                    strokeDashoffset: length,
                  },
                  {
                    strokeDashoffset: 0,
                    duration: 2.4,
                    ease: "sine.inOut",
                  },
                )
                .to(pen, {
                  strokeWidth: 160,
                  duration: 0.25,
                  ease: "sine.inOut",
                });
            });

          // Animate the image inside its clipped frame, not the layout box.
          // Overscan keeps photo edges covered throughout the full travel.
          select(".coastal-home .coastal-cover-photo img").forEach(
            (image: HTMLElement) => {
              gsap.fromTo(
                image,
                { scale: 1.2, yPercent: -6 },
                {
                  yPercent: 6,
                  ease: "none",
                  scrollTrigger: {
                    trigger: element.querySelector(".coastal-home"),
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.2,
                  },
                },
              );
            },
          );
          gsap.to(select(".coastal-home-title"), {
            y: -70,
            ease: "none",
            scrollTrigger: {
              trigger: element.querySelector(".coastal-home"),
              start: "top top",
              end: "bottom top",
              scrub: 1.4,
            },
          });
          select(
            ".coastal-person-photo, .coastal-gallery-board button",
          ).forEach((frame: HTMLElement) => {
            const image = frame.querySelector("img");
            if (!image) return;
            gsap.fromTo(
              image,
              { scale: 1.16, yPercent: -5 },
              {
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.1,
                },
              },
            );
          });
          gsap.fromTo(
            select(".coastal-leaves"),
            { y: -45, rotation: -5 },
            {
              y: 45,
              rotation: 5,
              ease: "none",
              transformOrigin: "50% 50%",
              scrollTrigger: {
                trigger: element.querySelector(".coastal-details"),
                start: "top bottom",
                end: "bottom top",
                scrub: 1.6,
              },
            },
          );
          select(".coastal-countdown").forEach((countdown: HTMLElement) =>
            gsap.from(countdown.querySelectorAll("p, .countdown-item"), {
              opacity: 0,
              y: 14,
              stagger: 0.13,
              duration: 0.85,
              clearProps: "opacity,transform",
              scrollTrigger: {
                trigger: countdown,
                start: "top 92%",
                once: true,
              },
            }),
          );
          select(".coastal-dress > div").forEach((palette: HTMLElement) => {
            gsap.from(palette.children, {
              scale: 0.65,
              rotation: -12,
              opacity: 0,
              stagger: 0.09,
              duration: 0.8,
              ease: "back.out(1.3)",
              clearProps: "opacity,transform",
              scrollTrigger: { trigger: palette, start: "top 90%", once: true },
            });
          });

          const reveals: { element: HTMLElement; tween: gsap.core.Tween }[] =
            [];
          const groups = select(
            ".coastal-couple article > *, .coastal-details > h2, .coastal-event > *, .coastal-dress > *, .coastal-rsvp > *, .coastal-gallery-board button, .coastal-gift-content > *, .coastal-wishes > h2, .coastal-wishes > p, .coastal-wishes-scroll, .coastal-extra > *, .coastal-footer > *",
          );
          groups.forEach((target: HTMLElement) => {
            const tween = gsap.from(target, {
              opacity: 0,
              y: target.matches(".coastal-gallery-board button") ? 42 : 24,
              scale: target.matches(".coastal-gallery-board button") ? 0.94 : 1,
              clipPath: target.matches("h2, h3")
                ? "inset(0 0 100% 0)"
                : "inset(0)",
              duration: 1.15,
              ease: "power3.out",
              clearProps: "opacity,transform,clipPath",
              scrollTrigger: { trigger: target, start: "top 95%", once: true },
            });
            reveals.push({ element: target, tween });
          });
          // Portraits already enter with their article. Keep their overflow
          // mask static while the inner image moves to avoid competing clips.
          // Keyboard navigation must never land on an invisible control.
          const revealFocused = (event: FocusEvent) => {
            reveals.forEach(({ element: target, tween }) => {
              if (
                event.target instanceof Node &&
                (target.contains(event.target) || event.target.contains(target))
              )
                tween.progress(1);
            });
          };
          element.addEventListener("focusin", revealFocused);
          return () => {
            element.removeEventListener("focusin", revealFocused);
          };
        },
      );

      // Restrict hover flourishes to a real pointer; touch retains native taps.
      media.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cleanups: (() => void)[] = [];
          select(
            ".coastal-pill, .coastal-opening-content button, .coastal-gift-content button, .coastal-gallery-board button",
          ).forEach((button: HTMLElement) => {
            const hover = gsap.to(button, {
              boxShadow: "0 5px 18px rgba(64,37,24,0.18)",
              duration: 0.35,
              ease: "sine.out",
              paused: true,
            });
            const enter = () => hover.play();
            const leave = () => hover.reverse();
            button.addEventListener("pointerenter", enter);
            button.addEventListener("pointerleave", leave);
            cleanups.push(() => {
              button.removeEventListener("pointerenter", enter);
              button.removeEventListener("pointerleave", leave);
            });
          });
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );

      let active = true;
      let frame = 0;
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (active) ScrollTrigger.refresh();
        });
      };
      const observer = new ResizeObserver(refresh);
      if (opened) observer.observe(element);
      document.fonts.ready.then(() => {
        if (active && opened) refresh();
      });
      return () => {
        active = false;
        cancelAnimationFrame(frame);
        observer.disconnect();
        media.revert();
      };
    },
    {
      scope: root,
      dependencies: [opened, dismissOpening],
      revertOnUpdate: true,
    },
  );
}

export function animateCoastalMenu(dialog: HTMLDialogElement) {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(dialog, {
      clipPath: "inset(0 0 100% 0 round 0 0 35% 35%)",
      duration: 0.75,
      ease: "power3.inOut",
      clearProps: "clipPath",
    });
    gsap.from(dialog.querySelectorAll("nav a"), {
      opacity: 0,
      y: 28,
      delay: 0.25,
      duration: 0.7,
      stagger: 0.065,
      ease: "power2.out",
      clearProps: "opacity,transform",
    });
  });
  return () => media.revert();
}

export function closeCoastalMenu(
  dialog: HTMLDialogElement,
  complete: () => void,
) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    complete();
    return;
  }
  // Kill entry motion before reversing, including a rapid open/close gesture.
  gsap.killTweensOf([dialog, ...dialog.querySelectorAll("nav a")]);
  return gsap.to(dialog, {
    clipPath: "inset(0 0 100% 0 round 0 0 35% 35%)",
    duration: 0.65,
    ease: "power3.inOut",
    onComplete: complete,
  });
}
