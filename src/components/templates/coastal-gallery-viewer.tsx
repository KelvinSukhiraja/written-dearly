"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap-client";
import type { InvitationGalleryItem } from "@/lib/invitations/theme";

function ViewerPhoto({ item }: { item: InvitationGalleryItem }) {
  const frame = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  useGSAP(
    () => {
      if (status !== "ready") return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(frame.current?.querySelector("img") ?? [], {
          opacity: 0,
          scale: 1.015,
          duration: 0.45,
          ease: "power2.out",
          clearProps: "opacity,transform",
        });
      });
      return () => media.revert();
    },
    { scope: frame, dependencies: [status], revertOnUpdate: true },
  );
  return (
    <div
      ref={frame}
      className="coastal-viewer-photo"
      aria-busy={status === "loading"}
    >
      {status !== "ready" && (
        <p className="coastal-viewer-status" role="status">
          {status === "error"
            ? "This photograph couldn’t load. Try another photo or reopen the gallery."
            : "Loading photograph…"}
        </p>
      )}
      <Image
        src={item.src}
        alt={item.alt || "Wedding photograph"}
        fill
        sizes="(max-width: 700px) 100vw, 85vw"
        className={status === "ready" ? "is-ready" : ""}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
        priority
      />
    </div>
  );
}

function Arrow({ next = false }: { next?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={next ? "M5 12h14m-6-6 6 6-6 6" : "M19 12H5m6-6-6 6 6 6"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CoastalGalleryViewer({
  items,
  initialIndex,
  onClose,
}: {
  items: InvitationGalleryItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(initialIndex);
  const move = (direction: number) =>
    setIndex((current) => (current + direction + items.length) % items.length);
  useEffect(() => {
    const node = dialog.current;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="coastal-viewer"
      aria-label="Wedding photo gallery"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="coastal-viewer-shell">
        <header className="coastal-viewer-header">
          <div>
            <p>OUR MEMORIES</p>
            <h2>A moment, forever.</h2>
          </div>
          <button
            type="button"
            className="coastal-viewer-close"
            aria-label="Close photo gallery"
            onClick={onClose}
            autoFocus
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div
          className="coastal-viewer-stage"
          onTouchStart={(event) => {
            touch.current =
              event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
                : null;
          }}
          onTouchCancel={() => {
            touch.current = null;
          }}
          onTouchEnd={(event) => {
            const start = touch.current;
            touch.current = null;
            if (!start || !event.changedTouches.length) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5)
              move(dx < 0 ? 1 : -1);
          }}
        >
          <ViewerPhoto key={index} item={items[index]} />
        </div>
        <footer className="coastal-viewer-footer">
          <p className="coastal-viewer-caption">
            {items[index].alt || "Together, always."}
          </p>
          <div className="coastal-viewer-controls">
            <button
              type="button"
              aria-label="Previous photograph"
              onClick={() => move(-1)}
              disabled={items.length < 2}
            >
              <Arrow />
            </button>
            <p aria-live="polite" aria-atomic="true">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span aria-hidden="true"> / </span>
              {String(items.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              aria-label="Next photograph"
              onClick={() => move(1)}
              disabled={items.length < 2}
            >
              <Arrow next />
            </button>
          </div>
          <p className="coastal-viewer-hint">Swipe or use arrow keys</p>
        </footer>
      </div>
    </dialog>
  );
}
