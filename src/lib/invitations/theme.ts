import { safeUrl } from "./validation";
import { youtubeUrl } from "./youtube";

export type InvitationEvent = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  end_time: string;
  venue_name: string | null;
  venue_address: string | null;
  description: string;
  dress_code: string;
  map_url: string;
  instructions: string;
};
export type InvitationGalleryItem = { src: string; alt: string };
export type InvitationTheme = {
  gallery: InvitationGalleryItem[];
  story_photo_url: string | null;
  story_heading: string | null;
  events: InvitationEvent[];
  opening_message: string;
  bride_description: string;
  groom_description: string;
  bride_photo: string;
  groom_photo: string;
  cover_position: number;
  music_url: string;
  music_source: "upload" | "youtube" | "none";
  youtube_url: string;
  music_title: string;
  rsvp_closed: boolean;
  rsvp_deadline: string;
  wishes_enabled: boolean;
  details: { title: string; body: string; url: string }[];
  milestones: { date: string; title: string; description: string }[];
};
const str = (value: unknown, max = 3000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const list = (value: unknown) =>
  Array.isArray(value) ? value.slice(0, 30) : [];
export function parseInvitationTheme(
  theme: Record<string, unknown> | null | undefined,
): InvitationTheme {
  const s = theme ?? {};
  return {
    gallery: list(s.gallery).flatMap((value) => {
      const v = obj(value);
      const src = safeUrl(
        typeof value === "string"
          ? value
          : Array.isArray(value)
            ? value[0]
            : v.src,
      );
      return src ? [{ src, alt: str(v.alt, 200) }] : [];
    }),
    story_photo_url: safeUrl(s.story_photo_url ?? s.storyImage),
    story_heading: str(s.story_heading, 100) || null,
    events: list(s.events)
      .map((value, index) => {
        const v = obj(value);
        return {
          id: str(v.id, 80) || `event-${index}`,
          title: str(v.title ?? v.label, 100),
          date: str(v.date, 10),
          time: str(v.time, 100) || null,
          end_time: str(v.end_time, 20),
          venue_name: str(v.venue_name ?? v.venue, 200) || null,
          venue_address: str(v.venue_address ?? v.address, 500) || null,
          description: str(v.description),
          dress_code: str(v.dress_code, 300),
          map_url: safeUrl(v.map_url) || "",
          instructions: str(v.instructions),
        };
      })
      .filter((v) => v.title),
    opening_message:
      str(s.opening_message, 300) || "Together with our families",
    bride_description: str(s.bride_description),
    groom_description: str(s.groom_description),
    bride_photo: safeUrl(s.bride_photo) || "",
    groom_photo: safeUrl(s.groom_photo) || "",
    cover_position:
      typeof s.cover_position === "number" && Number.isFinite(s.cover_position)
        ? Math.max(0, Math.min(100, s.cover_position))
        : 50,
    music_url: safeUrl(s.music_url) || "",
    music_source:
      s.music_source === "youtube" || s.music_source === "none"
        ? s.music_source
        : "upload",
    youtube_url: youtubeUrl(s.youtube_url),
    music_title: str(s.music_title, 100) || "Our soundtrack",
    rsvp_closed: s.rsvp_closed === true,
    rsvp_deadline:
      typeof s.rsvp_deadline === "string" &&
      !Number.isNaN(Date.parse(s.rsvp_deadline))
        ? new Date(s.rsvp_deadline).toISOString()
        : "",
    wishes_enabled: s.wishes_enabled !== false,
    details: list(s.details)
      .map((value) => {
        const v = obj(value);
        return {
          title: str(v.title, 100),
          body: str(v.body),
          url: safeUrl(v.url) || "",
        };
      })
      .filter((v) => v.title && v.body),
    milestones: list(s.milestones)
      .map((value) => {
        const v = obj(value);
        return {
          date: str(v.date, 100),
          title: str(v.title, 100),
          description: str(v.description),
        };
      })
      .filter((v) => v.title),
  };
}
