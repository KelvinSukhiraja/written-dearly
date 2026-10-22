"use client";

import { ArrowIcon } from "@/components/arrow-icon";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap } from "@/lib/gsap-client";
import "./invitation-opening.css";

type Props = {
  children: ReactNode;
  firstName: string;
  secondName: string;
  date: string;
  /** Change this per invitation when embedding in Written Dearly. */
  invitationId?: string;
  /** Default: show on every visit, so templates can be previewed repeatedly. */
  oncePerSession?: boolean;
  artworkSrc?: string;
  bowSrc?: string;
  musicUrl?: string;
  musicTitle?: string;
  greeting?: string;
};

export function InvitationOpening({
  children,
  firstName,
  secondName,
  date,
  invitationId = "default",
  oncePerSession = false,
  artworkSrc = "/invitation-art/botanical-linen.webp",
  bowSrc = "/invitation-art/silk-bow.webp",
  musicUrl,
  musicTitle = "Our soundtrack",
  greeting,
}: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  function playMusic() {
    if (audio.current) {
      audio.current
        .play()
        .then(() => setAudioError(false))
        .catch(() => {
          setAudioError(true);
          setPlaying(false);
        });
    }
  }
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const running = useRef(false);
  const [active, setActive] = useState(true);
  const [opening, setOpening] = useState(false);
  const storageKey = `written-dearly:opened:${invitationId}`;

  const finish = useCallback(
    (focus = true) => {
      timeline.current?.kill();
      timeline.current = null;
      running.current = false;
      if (oncePerSession) {
        try {
          sessionStorage.setItem(storageKey, "yes");
        } catch {
          /* Storage is optional. */
        }
      }
      // Remove inert before moving focus, including on Skip during the animation.
      if (content.current) {
        content.current.inert = false;
        gsap.set(content.current, {
          clearProps: "transform,opacity,visibility",
        });
        const targets = content.current.querySelectorAll(
          ".hero-content > *, .nav, .scroll-cue",
        );
        gsap.set(targets, { clearProps: "transform,opacity,visibility" });
        if (focus) content.current.focus({ preventScroll: true });
      }
      setActive(false);
    },
    [oncePerSession, storageKey],
  );

  // The session check may immediately close the client-only intro on mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (oncePerSession) {
      try {
        if (sessionStorage.getItem(storageKey) === "yes") {
          finish(false);
          return;
        }
      } catch {
        /* Ignore. */
      }
    }
    openButton.current?.focus({ preventScroll: true });
  }, [finish, oncePerSession, storageKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (reducedMotion.matches && running.current) finish();
    };
    reducedMotion.addEventListener("change", onChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      reducedMotion.removeEventListener("change", onChange);
      timeline.current?.kill();
    };
  }, [active, finish]);

  const open = () => {
    if (running.current) return;
    playMusic();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    running.current = true;
    setOpening(true);
    const scope = gsap.utils.selector(root);
    const hero = content.current?.querySelectorAll(
      ".hero-content > *, .nav, .scroll-cue",
    );
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => finish(),
    });
    timeline.current = tl;
    if (hero?.length) gsap.set(hero, { autoAlpha: 0, y: 18 });
    tl.to(
      scope(".wd-lettering, .wd-open, .wd-imprint"),
      { opacity: 0, y: -8, duration: 0.45 },
      0,
    )
      .to(scope(".wd-bow"), { scale: 1.045, duration: 0.4 }, 0)
      .to(
        scope(".wd-bow-left"),
        {
          x: "-52vw",
          y: "-6vh",
          rotation: -16,
          opacity: 0,
          duration: 1.15,
          ease: "power3.in",
        },
        0.35,
      )
      .to(
        scope(".wd-bow-right"),
        {
          x: "52vw",
          y: "6vh",
          rotation: 20,
          opacity: 0,
          duration: 1.15,
          ease: "power3.in",
        },
        0.4,
      )
      .to(
        scope(".wd-band"),
        { scaleX: 0, duration: 1, ease: "power3.inOut" },
        0.55,
      )
      .to(scope(".wd-seam"), { opacity: 0, duration: 0.3 }, 1.15)
      .to(
        scope(".wd-door-left"),
        { rotationY: -100, xPercent: -12, duration: 2.2, ease: "power3.inOut" },
        1.2,
      )
      .to(
        scope(".wd-door-right"),
        { rotationY: 100, xPercent: 12, duration: 2.2, ease: "power3.inOut" },
        1.2,
      )
      .to(scope(".wd-door-shade"), { opacity: 0.38, duration: 1.4 }, 1.4)
      .to(scope(".wd-door"), { opacity: 0, duration: 0.6 }, 2.75)
      .to(scope(".wd-skip"), { opacity: 0, duration: 0.3 }, 3.05);
    if (hero?.length)
      tl.to(
        hero,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          stagger: 0.09,
          ease: "power2.out",
        },
        2.25,
      );
  };

  return (
    <div
      className="wd-experience"
      ref={root}
    >
      <noscript>
        <style>{`.wd-opening{display:none!important}`}</style>
      </noscript>
      <div
        ref={content}
        className="wd-page"
        tabIndex={-1}
        inert={active && hydrated}
      >
        {children}
      </div>
      {musicUrl && (
        <>
          <audio
            ref={audio}
            src={musicUrl}
            preload="none"
            loop
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setAudioError(true)}
          />
          {!active && (
            <div className="wd-music" role="group" aria-label={musicTitle}>
              <button
                type="button"
                onClick={() => (playing ? audio.current?.pause() : playMusic())}
                aria-label={playing ? "Pause music" : "Play music"}
              >
                {playing ? "Ⅱ" : "♪"}{" "}
                <span>{playing ? "Pause" : "Play music"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (audio.current) audio.current.muted = !muted;
                  setMuted(!muted);
                }}
                aria-label={muted ? "Unmute music" : "Mute music"}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              {audioError && (
                <span role="status">
                  Music unavailable. You can still enjoy the invitation.
                </span>
              )}
            </div>
          )}
        </>
      )}
      {active && (
        <div
          className="wd-opening"
          role="dialog"
          aria-modal="true"
          aria-label={`An invitation from ${firstName} and ${secondName}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              finish();
            }
            if (event.key === "Tab") {
              const buttons = Array.from(
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  "button:not(:disabled)",
                ),
              );
              const first = buttons[0],
                last = buttons[buttons.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <div className="wd-stage" aria-hidden="true">
            {(["left", "right"] as const).map((side) => (
              <div className={`wd-door wd-door-${side}`} key={side}>
                <img
                  className="wd-cover-art"
                  src={artworkSrc}
                  alt=""
                  fetchPriority="high"
                  draggable={false}
                />
                <div className="wd-door-shade" />
              </div>
            ))}
            <div className="wd-seam" />
            <div className="wd-band wd-band-left" />
            <div className="wd-band wd-band-right" />
            <div className="wd-bow wd-bow-left">
              <img src={bowSrc} alt="" fetchPriority="high" draggable={false} />
            </div>
            <div className="wd-bow wd-bow-right">
              <img src={bowSrc} alt="" fetchPriority="high" draggable={false} />
            </div>
          </div>
          <div className="wd-lettering">
            {greeting && <p className="wd-greeting">{greeting}</p>}
            <p className="wd-eyebrow">Together with our families</p>
            <h2>
              {firstName}
              <span>&</span>
              {secondName}
            </h2>
            <p className="wd-date">{date}</p>
          </div>
          <button
            className="wd-open"
            ref={openButton}
            onClick={open}
            aria-disabled={opening}
          >
            <span className="wd-open-icon" aria-hidden="true">
              <ArrowIcon direction="up-right" />
            </span>
            <span>Open your invitation</span>
            <small>A celebration of love, a lifetime in the making</small>
          </button>
          <span className="wd-imprint">Written Dearly</span>
          <button className="wd-skip" onClick={() => finish()}>
            Skip intro <ArrowIcon />
          </button>
          <span className="wd-sr-only" role="status">
            {opening ? "Opening your invitation" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
