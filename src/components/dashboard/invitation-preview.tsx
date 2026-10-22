"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useState, useRef, useEffect } from "react";
import type { Invitation } from "@/lib/supabase/types";
export function InvitationPreview({ invitation }: { invitation: Invitation }) {
  const [width, setWidth] = useState(0),
    [revision, setRevision] = useState(0),
    [available, setAvailable] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) =>
      setAvailable(entries[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const scale = available && width ? Math.min(1, available / width) : 1;
  return (
    <div className="invitation-preview space-y-4">
      <div className="preview-toolbar">
        <div className="tab-bar" role="group" aria-label="Preview screen size">
          {[
            [0, "Fit screen"],
            [390, "Phone"],
            [768, "Tablet"],
            [1280, "Desktop"],
          ].map(([size, label]) => (
            <button
              key={size}
              aria-pressed={width === size}
              onClick={() => setWidth(Number(size))}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="preview-toolbar-actions"><a className="btn btn-secondary" href={`/preview/${invitation.slug}`} target="_blank" rel="noopener noreferrer">Open full page <ArrowIcon direction="up-right" /></a><button
          className="btn btn-secondary"
          onClick={() => setRevision((v) => v + 1)}
        >
          Refresh
        </button></div>
      </div>
      <div className="preview-stage">
        <div ref={stage}>
          <div className={width ? "preview-viewport preview-viewport-simulated" : "preview-viewport"}
            style={{
              height: width ? Math.round(800 * scale) : undefined,
              position: "relative",
              width: "100%",
            }}
          >
            <iframe
              key={revision}
              title={width ? `Invitation preview at ${width} pixels` : "Invitation preview"}
              src={`/preview/${invitation.slug}`}
              style={{
                width: width || "100%",
                height: width ? 800 : "100%",
                maxWidth: "none",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                position: "absolute",
                left: width ? "50%" : 0,
                marginLeft: width ? (-width * scale) / 2 : 0,
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted text-center">
        {width ? `${width}px preview${scale < 1 ? ` · Scaled to ${Math.round(scale * 100)}%` : ""} · ` : ""}Scroll inside the invitation to explore. RSVP is disabled in preview.
      </p>
    </div>
  );
}
