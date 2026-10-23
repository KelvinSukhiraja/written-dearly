"use client";
import { useState, useTransition } from "react";
import { setWishHidden } from "@/app/dashboard/wish-actions";
export type OwnerWish = {
  id: string;
  name: string;
  message: string;
  hidden: boolean;
};
export function WishesManager({
  items,
  ready,
  previewOnly = false,
}: {
  items: OwnerWish[];
  ready: boolean;
  previewOnly?: boolean;
}) {
  const [wishes, setWishes] = useState(items);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return (
    <section className="card section-card space-y-5" aria-label="Manage wishes">
      <h2>Guest wishes</h2>
      {previewOnly && (
        <p className="notice">
          Fictional preview. Visibility changes are not saved.
        </p>
      )}
      <p className="text-sm text-muted">
        New wishes appear automatically. Hide a wish to remove it from the
        invitation. Private RSVP messages are never listed here.
      </p>
      {!ready ? (
        <p role="status">
          Public wishes are being prepared. Existing private messages stay
          private.
        </p>
      ) : !wishes.length ? (
        <p>No wishes yet. Wishes will appear here after guests submit them.</p>
      ) : (
        wishes.map((wish) => (
          <article
            key={wish.id}
            className="space-y-3 border-b border-border pb-5"
          >
            <p className="whitespace-pre-wrap break-words">{wish.message}</p>
            <p className="text-sm text-muted">
              From {wish.name} · {wish.hidden ? "Hidden" : "Visible"}
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pending}
              onClick={() => {
                setError("");
                startTransition(async () => {
                  try {
                    const result = previewOnly
                      ? { ok: true as const }
                      : await setWishHidden(wish.id, !wish.hidden);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setWishes((current) =>
                      current.map((w) =>
                        w.id === wish.id ? { ...w, hidden: !wish.hidden } : w,
                      ),
                    );
                  } catch {
                    setError(
                      "Your change could not be confirmed. Please try again.",
                    );
                  }
                });
              }}
            >
              {pending ? "Saving…" : wish.hidden ? "Show wish" : "Hide wish"}
            </button>
          </article>
        ))
      )}
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
