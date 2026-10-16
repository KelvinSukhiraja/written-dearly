"use client";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MediaUpload({
  label,
  value,
  onChange,
  userId,
  invitationId,
  audio = false,
  onBusy,
  preview = "original",
  allowRemove = true,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  userId: string;
  invitationId: string;
  audio?: boolean;
  onBusy?: (busy: boolean) => void;
  preview?: "original" | "portrait" | "story" | "none";
  allowRemove?: boolean;
}) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setError(false);
    setMessage("");
    const allowed = audio
      ? ["audio/mpeg", "audio/mp4", "audio/ogg"]
      : ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 6 * 1024 * 1024) {
      setError(true);
      setMessage(
        audio
          ? "Choose an MP3, M4A or OGG file under 6 MB."
          : "Choose a JPG, PNG or WebP image under 6 MB.",
      );
      return;
    }
    setBusy(true);
    onBusy?.(true);
    try {
      let blob: Blob = file;
      let type = file.type;
      if (!audio) {
        const bitmap = await createImageBitmap(file);
        if (bitmap.width < 300 || bitmap.height < 300) {
          bitmap.close();
          throw new Error("Choose an image at least 300 × 300 pixels.");
        }
        const ratio = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * ratio);
        canvas.height = Math.round(bitmap.height * ratio);
        canvas
          .getContext("2d")!
          .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (b) =>
              b
                ? resolve(b)
                : reject(new Error("Could not prepare this image.")),
            "image/webp",
            0.86,
          ),
        );
        type = "image/webp";
      }
      const ext =
        type === "image/webp"
          ? "webp"
          : type === "audio/mpeg"
            ? "mp3"
            : type === "audio/mp4"
              ? "m4a"
              : "ogg";
      const path = `${userId}/${invitationId}/${crypto.randomUUID()}.${ext}`;
      const client = createClient();
      const { error } = await client.storage
        .from("invitation-media")
        .upload(path, blob, {
          contentType: type,
          cacheControl: "31536000",
          upsert: false,
        });
      if (error)
        throw new Error(
          error.message.includes("Bucket")
            ? "Media storage is not configured yet. Please contact your administrator."
            : `Upload failed: ${error.message}`,
        );
      onChange(
        client.storage.from("invitation-media").getPublicUrl(path).data
          .publicUrl,
      );
      setMessage("Uploaded. Save your invitation to publish this change.");
    } catch (e) {
      setError(true);
      setMessage(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  }
  return (
    <div className="space-y-3">
      <label className="field" htmlFor={id}>
        {label}
      </label>
      {value &&
        (audio ? (
          <audio src={value} controls preload="none" className="w-full" />
        ) : preview !== "none" ? (
          <img
            src={value}
            alt={`${label} preview`}
            className={`upload-preview media-preview media-preview-${preview}`}
          />
        ) : null)}
      <input
        id={id}
        type="file"
        disabled={busy}
        accept={
          audio
            ? "audio/mpeg,audio/mp4,audio/ogg"
            : "image/jpeg,image/png,image/webp"
        }
        className="input text-sm"
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="flex justify-between gap-3 text-xs text-muted">
        <span>
          {busy
            ? "Preparing and uploading…"
            : audio
              ? "MP3, M4A or OGG · up to 6 MB"
              : "JPG, PNG or WebP · up to 6 MB"}
        </span>
        {value && allowRemove && (
          <button
            type="button"
            disabled={busy}
            className="underline"
            onClick={() => {
              onChange("");
              setMessage("Removed from the invitation. Save to confirm.");
            }}
          >
            Remove {audio ? "music" : "image"}
          </button>
        )}
      </div>
      {message && (
        <p
          role={error ? "alert" : "status"}
          className={error ? "notice notice-error" : "notice"}
        >
          {message}
        </p>
      )}
    </div>
  );
}
