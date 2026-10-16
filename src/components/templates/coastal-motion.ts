"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Layered photo parallax and soft reveals, with native scrolling. */
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
            return;
          }

          const opening = select(".coastal-opening");
          if (opening.length) {
            gsap
              .timeline({ onComplete: dismissOpening })
              .to(select(".coastal-opening-card"), {
                opacity: 0,
                y: -12,
                duration: 0.55,
                ease: "power1.inOut",
              })
              .to(
                opening,
                { opacity: 0, duration: 0.65, ease: "sine.inOut" },
                0.15,
              );
          }
          gsap.from(select(".coastal-home .coastal-cover-photo"), {
            scale: 1.04,
            duration: 2.3,
            ease: "sine.out",
            clearProps: "transform",
          });
          gsap.from(
            select(
              ".coastal-home-title > p, .coastal-home-title h1 > *, .coastal-date",
            ),
            {
              opacity: 0,
              y: 12,
              stagger: 0.12,
              delay: opening.length ? 0.4 : 0,
              duration: 1.1,
              ease: "power2.out",
              clearProps: "opacity,transform",
            },
          );

          // Animate the image inside its clipped frame, not the layout box.
          // Overscan keeps photo edges covered throughout the full travel.
          select(".coastal-home .coastal-cover-photo img").forEach(
            (image: HTMLElement) => {
              gsap.fromTo(
                image,
                { scale: 1.14, yPercent: -3 },
                {
                  yPercent: 3,
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
            y: -36,
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
              { scale: 1.12, yPercent: -3 },
              {
                yPercent: 3,
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
            { y: -24, rotation: -2 },
            {
              y: 24,
              rotation: 2,
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
            gsap.from(countdown, {
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

          const reveals: { element: HTMLElement; tween: gsap.core.Tween }[] =
            [];
          const groups = select(
            ".coastal-couple article, .coastal-details > h2, .coastal-event, .coastal-dress, .coastal-rsvp > h2, .coastal-rsvp > p, .coastal-gallery-board button, .coastal-gift-card, .coastal-wishes > h2, .coastal-wishes blockquote, .coastal-extra",
          );
          groups.forEach((target: HTMLElement) => {
            const tween = gsap.from(target, {
              opacity: 0,
              y: 18,
              duration: 0.95,
              ease: "power2.out",
              clearProps: "opacity,transform",
              scrollTrigger: { trigger: target, start: "top 94%", once: true },
            });
            reveals.push({ element: target, tween });
          });
          select(".coastal-person-photo").forEach((target: HTMLElement) => {
            gsap.from(target, {
              clipPath: "inset(0 0 8% 0)",
              duration: 1.35,
              ease: "power2.out",
              clearProps: "clipPath",
              scrollTrigger: { trigger: target, start: "top 94%", once: true },
            });
          });
          // Keyboard navigation must never land on an invisible control.
          const revealFocused = (event: FocusEvent) => {
            reveals.forEach(({ element: target, tween }) => {
              if (event.target instanceof Node && target.contains(event.target))
                tween.progress(1);
            });
          };
          element.addEventListener("focusin", revealFocused);
          return () => element.removeEventListener("focusin", revealFocused);
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
    gsap.from(dialog.querySelectorAll("nav a"), {
      opacity: 0,
      y: 10,
      duration: 0.55,
      stagger: 0.055,
      ease: "power2.out",
      clearProps: "opacity,transform",
    });
  });
  return () => media.revert();
}
