"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import type { InvitationGalleryItem } from "@/lib/invitations/theme";
export function Gallery({ photos }: { photos: InvitationGalleryItem[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <button
            type="button"
            className={`gallery-item gallery-${(i % 5) + 1}`}
            key={photo.src + i}
            onClick={() => setSelected(i)}
            aria-label={`View ${photo.alt || "photograph " + (i + 1)}`}
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
      {selected !== null && (
        <Dialog
          title={
            photos[selected].alt ||
            `Photograph ${selected + 1} of ${photos.length}`
          }
          onClose={() => setSelected(null)}
        >
          <img
            src={photos[selected].src}
            alt={photos[selected].alt}
            className="w-full max-h-[65dvh] object-contain"
          />
          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() =>
                setSelected((selected + photos.length - 1) % photos.length)
              }
            >
              <ArrowIcon direction="left" /> Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelected((selected + 1) % photos.length)}
            >
              Next <ArrowIcon />
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
