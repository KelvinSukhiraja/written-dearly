import { notFound } from "next/navigation";
import { CoastalInvitation } from "@/components/templates/coastal";
import {
  coastalFixture,
  coastalReference,
} from "@/lib/testing/coastal-fixture";
export default async function CoastalReview({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { mode } = await searchParams;
  const invitation =
    mode === "empty"
      ? {
          ...coastalFixture,
          groom_name: null,
          bride_name: null,
          wedding_date: null,
          cover_photo_url: null,
          theme: { music_source: "none" },
        }
      : mode === "preview"
        ? {
            ...coastalFixture,
            theme: {
              ...coastalFixture.theme,
              gallery: coastalFixture.theme.gallery.slice(0, 3),
            },
          }
        : coastalFixture;
  return (
    <CoastalInvitation
      invitation={invitation}
      reference={
        mode === "preview" || mode === "empty" ? undefined : coastalReference
      }
      preview
    />
  );
}
