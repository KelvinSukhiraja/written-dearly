"use client";

import { useEffect } from "react";

export function GlassLight() {
  useEffect(() => {
    function onMove(event: PointerEvent) {
      const node = (event.target as HTMLElement | null)?.closest(
        ".glass, .glass-strong",
      );
      if (!(node instanceof HTMLElement)) return;

      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty("--glass-x", `${x}%`);
      node.style.setProperty("--glass-y", `${y}%`);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
