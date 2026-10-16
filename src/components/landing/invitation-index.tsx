"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import atlas from "../../../public/landing-index/gallery-atlas.png";
import styles from "@/app/landing.module.css";

// The selected invitation starts in the centre, with four editorial images on each side.
const images = [
  { cell: 4, name: "Botanical invitation for Alex and Jamie" },
  { cell: 5, name: "White cosmos flowers" },
  { cell: 6, name: "A quiet Italian lakeside" },
  { cell: 7, name: "Delicate embossed flowers on cotton paper" },
  { cell: 8, name: "An intimate wedding table" },
  { cell: 0, name: "White flowers in a glass vase" },
  { cell: 1, name: "A lakeside villa and cypress trees" },
  { cell: 3, name: "Botanical impressions on handmade paper" },
  { cell: 2, name: "A couple beginning their next chapter" },
];
const distance = (index: number, selected: number) => ((index - selected + 13) % 9) - 4;

export function InvitationIndex() {
  const [{ current, previous }, setSelection] = useState({ current: 0, previous: 0 });
  const touch = useRef<{ x: number; y: number } | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (index: number, focus = false) => {
    const next = (index + images.length) % images.length;
    setSelection((value) => ({ current: next, previous: value.current }));
    if (focus) buttons.current[next]?.focus({ preventScroll: true });
  };
  return (
    <section className={styles.index} aria-label="Invitation inspiration gallery" aria-roledescription="carousel"
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        select(event.key === "Home" ? 0 : event.key === "End" ? 8 : current + (event.key === "ArrowRight" ? 1 : -1), true);
      }}>
      <div className={styles.gallery}
        onTouchStart={(event) => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
        onTouchEnd={(event) => {
          const start = touch.current; touch.current = null;
          if (!start) return;
          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) select(current + (dx < 0 ? 1 : -1));
        }} onTouchCancel={() => { touch.current = null; }}>
        {images.map((item, i) => {
          const offset = distance(i, current);
          const jumped = Math.abs(offset - distance(i, previous)) > 4;
          return <button key={item.cell} ref={(el) => { buttons.current[i] = el; }} type="button"
            className={styles.galleryItem} data-selected={i === current} data-jump={jumped}
            style={{ "--offset": offset, "--side": Math.sign(offset) } as CSSProperties}
            aria-label={`Show image ${i + 1}: ${item.name}`} aria-pressed={i === current}
            tabIndex={i === current ? 0 : -1} onClick={() => select(i)}>
            <span className={styles.imageCrop}>
              <span className={styles.imageCell}>
                <Image src={atlas} alt="" sizes="1200px" preload={i === 0}
                  style={{ left: `${-(item.cell % 3) * 100}%`, top: `${-Math.floor(item.cell / 3) * 100}%` }} />
              </span>
            </span>
          </button>;
        })}
      </div>
      <div className={styles.galleryControls}>
        <button type="button" aria-label="Previous gallery image" onClick={() => select(current - 1)}><span aria-hidden="true" /></button>
        <span className={styles.counter} aria-live="polite" aria-atomic="true"><span className={styles.srOnly}>Image </span>{String(current + 1).padStart(2, "0")} / 09<span className={styles.srOnly}>: {images[current].name}</span></span>
        <button type="button" aria-label="Next gallery image" onClick={() => select(current + 1)}><span aria-hidden="true" /></button>
      </div>
    </section>
  );
}
