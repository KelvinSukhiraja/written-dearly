"use client";
import { useEffect, useRef, useState } from "react";
export function QrScanner({
  onScan,
  onClose,
}: {
  onScan: (text: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const callback = useRef(onScan);
  const [error, setError] = useState("");
  useEffect(() => {
    callback.current = onScan;
  }, [onScan]);
  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error(
            "Use a secure HTTPS connection and a browser with camera support.",
          );
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (cancelled) return;
        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          video.current!,
          (result) => {
            if (result && !cancelled) {
              cancelled = true;
              stop?.();
              callback.current(result.getText());
            }
          },
        );
        stop = () => controls.stop();
        if (cancelled) stop();
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error && e.name === "NotAllowedError"
              ? "Camera permission was denied. Allow camera access in browser settings, or search by name."
              : e instanceof Error
                ? e.message
                : "Camera unavailable. Search by name instead.",
          );
      }
    }
    void start();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
  return (
    <section className="card p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl">Scan reception pass</h2>
        <button className="btn btn-secondary" onClick={onClose}>
          Close camera
        </button>
      </div>
      <video
        ref={video}
        muted
        playsInline
        className="w-full max-h-80 rounded-xl bg-black"
      />
      {error ? (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      ) : (
        <p className="text-sm text-muted">
          Centre the QR code in the camera. Scanning finds the party; you
          confirm the arrival.
        </p>
      )}
    </section>
  );
}
