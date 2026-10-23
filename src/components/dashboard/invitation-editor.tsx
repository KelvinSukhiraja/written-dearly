"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import { updateInvitation, type ActionResult } from "@/app/dashboard/actions";
import { MediaUpload } from "./media-upload";
import { youtubeVideoId } from "@/lib/invitations/youtube";
import { YouTubeMusic } from "@/components/templates/youtube-music";
import {
  parseInvitationTheme,
  type InvitationTheme,
  type InvitationEvent,
} from "@/lib/invitations/theme";
import type { Invitation } from "@/lib/supabase/types";
const tabs = [
  "Couple & cover",
  "Events",
  "Our story",
  "Gallery",
  "Guest information",
  "Music",
  "Publishing",
  "Dress code & gifts",
];
function Field({
  label,
  value,
  onChange,
  area = false,
  type = "text",
  requiredToPublish = false,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  area?: boolean;
  type?: string;
  requiredToPublish?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}{requiredToPublish && <span aria-label="required to publish"> *</span>}</span>
      {area ? (
        <textarea
          className="input"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
export function InvitationEditor({
  invitation,
  userId,
  initialTab = 0,
  eventSetupReady = false,
}: {
  invitation: Invitation;
  userId: string;
  initialTab?: number;
  eventSetupReady?: boolean;
}) {
  const [draft, setDraft] = useState(invitation),
    [theme, setTheme] = useState(() => parseInvitationTheme(invitation.theme)),
    [tab, setTab] = useState(initialTab),
    [busy, setBusy] = useState(0),
    [dirty, setDirty] = useState(false);
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(async (p, f) => {
    try {
      const result = await updateInvitation(p, f);
      if (result.ok) setDirty(false);
      return result;
    } catch {
      return {
        ok: false,
        error:
          "Your save could not be confirmed. Your edits are still here; check your connection and try again.",
      };
    }
  }, null);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function update(key: keyof Invitation, value: string | boolean) {
    setDraft((v) => ({ ...v, [key]: value }));
    setDirty(true);
  }
  function setting<K extends keyof InvitationTheme>(
    key: K,
    value: InvitationTheme[K],
  ) {
    setTheme((v) => ({ ...v, [key]: value }));
    setDirty(true);
  }
  const media = (
    label: string,
    value: string,
    change: (url: string) => void,
    audio = false,
    preview: "original" | "portrait" | "story" | "none" = "original",
    allowRemove = true,
  ) => (
    <MediaUpload
      label={label}
      value={value}
      onChange={change}
      userId={userId}
      invitationId={invitation.id}
      audio={audio}
      preview={preview}
      allowRemove={allowRemove}
      onBusy={(v) => setBusy((n) => n + (v ? 1 : -1))}
    />
  );
  const eventField = (
    index: number,
    key: keyof InvitationEvent,
    value: string,
  ) =>
    setting(
      "events",
      theme.events.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  return (
    <form action={action} className="space-y-6" onReset={(e) => e.preventDefault()}>
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        {[
          "bride_name",
          "groom_name",
          "wedding_date",
          "venue_name",
          "venue_address",
          "story",
          "cover_photo_url",
        ].map((key) => (
          <input
            key={key}
            type="hidden"
            name={key}
            value={String(draft[key as keyof Invitation] ?? "")}
          />
        ))}
        <input type="hidden" name="theme" value={JSON.stringify(theme)} />
        {draft.published && <input type="hidden" name="published" value="on" />}
        <div className="tab-bar" aria-label="Invitation sections">
          {[
            [0, "The essentials"],
            [1, "Events"],
            [2, "Photos, story & music"],
            [7, "Dress code & gifts"],
            [6, "Publish"],
          ].map(([index, name]) => {
            const i = Number(index);
            return (
              <button
                type="button"
                key={name}
                aria-pressed={i === 2 ? tab >= 2 && tab <= 5 : tab === i}
                onClick={() => setTab(i)}
              >
                {name}
              </button>
            );
          })}
        </div>
        {tab >= 2 && tab <= 5 && (
          <div
            className="flex flex-wrap gap-2"
            aria-label="Optional invitation content"
          >
            {[2, 3, 5, 4].map((i) => (
              <button
                key={i}
                type="button"
                className={`btn ${tab === i ? "btn-primary" : "btn-secondary"}`}
                aria-pressed={tab === i}
                onClick={() => setTab(i)}
              >
                {tabs[i]}
              </button>
            ))}
            <p className="w-full text-sm text-muted mt-2">
              These sections are optional. Add only what you want to share.
            </p>
          </div>
        )}
        <section className="card section-card" aria-label={tabs[tab]}>
          {tab === 0 && (
            <div className="space-y-7">
              <h2>Names, date & cover</h2>
              <p className="text-muted">
                Start with the essentials. You can add photos and descriptions
                now or later.
                {" "}* Required before publishing. Other fields can be left blank.
              </p>
              <div className="form-grid">
                {(["bride", "groom"] as const).map((person) => (
                  <div key={person} className="space-y-5">
                    <Field
                      label={
                        person === "bride" ? "Bride’s name" : "Groom’s name"
                      }
                      requiredToPublish
                      value={draft[(person + "_name") as "bride_name"] ?? ""}
                      onChange={(v) =>
                        update((person + "_name") as "bride_name", v)
                      }
                    />
                    <Field
                      label="A few words about them"
                      value={
                        theme[(person + "_description") as "bride_description"]
                      }
                      area
                      onChange={(v) =>
                        setting(
                          (person + "_description") as "bride_description",
                          v,
                        )
                      }
                    />
                    {media(
                      "Portrait photo",
                      theme[(person + "_photo") as "bride_photo"],
                      (v) => setting((person + "_photo") as "bride_photo", v),
                      false,
                      "portrait",
                    )}
                  </div>
                ))}
              </div>
              <div className="form-grid">
                <Field
                  label="Wedding date"
                  requiredToPublish
                  type="date"
                  value={draft.wedding_date?.slice(0, 10) ?? ""}
                  onChange={(v) => update("wedding_date", v)}
                />
                <Field
                  label="Opening message"
                  value={theme.opening_message}
                  onChange={(v) => setting("opening_message", v)}
                />
              </div>
              {media("Cover photograph", draft.cover_photo_url ?? "", (v) =>
                update("cover_photo_url", v), false, "none",
              )}
              {draft.cover_photo_url && (
                <div className="cover-adjustment space-y-3">
                  <label className="field" htmlFor="cover-position">Adjust cover photo</label>
                  <p id="cover-position-help" className="text-sm text-muted">Move the slider to choose which part of the photo stays in view.</p>
                  <input
                    id="cover-position"
                    type="range"
                    className="w-full"
                    aria-describedby="cover-position-help"
                    aria-valuetext={theme.cover_position < 40 ? "Showing more of the top" : theme.cover_position > 60 ? "Showing more of the bottom" : "Centred"}
                    min={0}
                    max={100}
                    value={theme.cover_position}
                    onChange={(e) =>
                      setting("cover_position", Number(e.target.value))
                    }
                  />
                  <div className="flex justify-between text-xs text-muted"><span>Show more of the top</span><span>Show more of the bottom</span></div>
                  <button type="button" className="btn btn-secondary" disabled={theme.cover_position === 50} onClick={() => setting("cover_position", 50)}>Centre photo</button>
                  <img
                    className="upload-preview media-preview media-preview-cover"
                    src={draft.cover_photo_url}
                    alt="Portrait phone cover crop preview"
                    style={{ objectPosition: `50% ${theme.cover_position}%` }}
                  />
                  <p className="text-xs text-muted">Phone cover preview. The crop adjusts to each guest’s screen size.</p>
                </div>
              )}
            </div>
          )}
          {tab === 1 && (
            <div className="space-y-6">
              <h2>Wedding events</h2>
              <div className="rounded-lg border border-border p-4 space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={theme.rsvp_events_enabled}
                    disabled={!eventSetupReady && !theme.rsvp_events_enabled}
                    onChange={(e) =>
                      setting("rsvp_events_enabled", e.target.checked)
                    }
                  />
                  Ask guests which events they will attend
                </label>
                <p className="text-sm text-muted">
                  Guests choose from their invited events, then give one group
                  size for all selected events. Unchecked events are recorded as
                  not attending only when they submit.
                </p>
                {!eventSetupReady && (
                  <p className="notice">
                    Per-event RSVP needs a database update before it can be
                    enabled. Your existing RSVP continues to work.
                  </p>
                )}
                {theme.rsvp_events_enabled && (
                  <p className="text-sm text-muted">
                    Existing replies remain saved. Event choices stay pending
                    until guests update their RSVP. Manage each guest’s event
                    access under Guests.
                  </p>
                )}
              </div>
              <div className="form-grid">
                <Field
                  label="Main venue"
                  value={draft.venue_name ?? ""}
                  onChange={(v) => update("venue_name", v)}
                />
                <Field
                  label="Main address"
                  value={draft.venue_address ?? ""}
                  onChange={(v) => update("venue_address", v)}
                />
              </div>
              <p className="text-sm text-muted">
                Add your ceremony, reception or other celebrations with their times and locations.
              </p>
              {theme.events.map((event, i) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-border p-5 space-y-4"
                >
                  <div className="flex justify-between">
                    <h3 className="text-xl">Event {i + 1}</h3>
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() =>
                        setting(
                          "events",
                          theme.events.filter((_, n) => n !== i),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-grid">
                    {(
                      [
                        ["title", "Event name", "text"],
                        ["date", "Date", "date"],
                        ["time", "Start time", "time"],
                        ["end_time", "End time", "time"],
                        ["venue_name", "Venue", "text"],
                        ["venue_address", "Address", "text"],
                        ["dress_code", "Dress code", "text"],
                        ["map_url", "Map link", "url"],
                      ] as const
                    ).map(([key, label, type]) => (
                      <Field
                        key={key}
                        label={label}
                        type={type}
                        value={event[key] ?? ""}
                        onChange={(v) => eventField(i, key, v)}
                      />
                    ))}
                  </div>
                  <Field
                    label="Description"
                    area
                    value={event.description}
                    onChange={(v) => eventField(i, "description", v)}
                  />
                  <Field
                    label="Additional instructions"
                    area
                    value={event.instructions}
                    onChange={(v) => eventField(i, "instructions", v)}
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setting("events", [
                    ...theme.events,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      date: "",
                      time: "",
                      end_time: "",
                      venue_name: "",
                      venue_address: "",
                      description: "",
                      dress_code: "",
                      map_url: "",
                      instructions: "",
                    },
                  ])
                }
              >
                + Add an event
              </button>
            </div>
          )}
          {tab === 2 && (
            <div className="space-y-6">
              <h2>Your story</h2>
              <Field
                label="Section title"
                value={theme.story_heading ?? "Our story"}
                onChange={(v) => setting("story_heading", v)}
              />
              <Field
                label="Your story"
                area
                value={draft.story ?? ""}
                onChange={(v) => update("story", v)}
              />
              {media("Story photograph", theme.story_photo_url ?? "", (v) =>
                setting("story_photo_url", v), false, "story",
              )}
              {theme.milestones.map((m, i) => (
                <div className="form-grid border-t border-border pt-5" key={i}>
                  <Field
                    label="Date or occasion"
                    value={m.date}
                    onChange={(v) =>
                      setting(
                        "milestones",
                        theme.milestones.map((x, n) =>
                          n === i ? { ...x, date: v } : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Milestone title"
                    value={m.title}
                    onChange={(v) =>
                      setting(
                        "milestones",
                        theme.milestones.map((x, n) =>
                          n === i ? { ...x, title: v } : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Memory"
                    area
                    value={m.description}
                    onChange={(v) =>
                      setting(
                        "milestones",
                        theme.milestones.map((x, n) =>
                          n === i ? { ...x, description: v } : x,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setting(
                        "milestones",
                        theme.milestones.filter((_, n) => n !== i),
                      )
                    }
                  >
                    Remove milestone
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setting("milestones", [
                    ...theme.milestones,
                    { date: "", title: "", description: "" },
                  ])
                }
              >
                + Add a milestone
              </button>
            </div>
          )}
          {tab === 3 && (
            <div className="space-y-6">
              <h2>Photo gallery</h2>
              <p className="text-sm text-muted">
                Add up to 30 photographs. Images are resized before upload for a
                faster invitation. Thumbnails below show the full photographs.
                The invitation arranges them in a responsive grid; use Preview
                saved invitation to check the phone and desktop crops.
              </p>
              <div className="form-grid">
                {theme.gallery.map((photo, i) => (
                  <div className="space-y-3" key={i}>
                    {media(`Photograph ${i + 1}`, photo.src, (v) =>
                      setting(
                        "gallery",
                        theme.gallery.map((p, n) =>
                          n === i ? { ...p, src: v } : p,
                        ),
                      ), false, "original", false,
                    )}
                    <Field
                      label="Describe this photo for guests using screen readers"
                      value={photo.alt}
                      onChange={(v) =>
                        setting(
                          "gallery",
                          theme.gallery.map((p, n) =>
                            n === i ? { ...p, alt: v } : p,
                          ),
                        )
                      }
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={i === 0}
                        onClick={() => {
                          const gallery = [...theme.gallery];
                          [gallery[i - 1], gallery[i]] = [
                            gallery[i],
                            gallery[i - 1],
                          ];
                          setting("gallery", gallery);
                        }}
                      >
                        Move earlier
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        aria-label={`Remove photograph ${i + 1}`}
                        onClick={() =>
                          setting(
                            "gallery",
                            theme.gallery.filter((_, n) => n !== i),
                          )
                        }
                      >
                        Remove photograph
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={theme.gallery.length >= 30}
                onClick={() =>
                  setting("gallery", [...theme.gallery, { src: "", alt: "" }])
                }
              >
                + Add photograph
              </button>
            </div>
          )}
          {tab === 4 && (
            <div className="space-y-6">
              <h2>Useful information</h2>
              <p className="text-sm text-muted">
                Useful details for your guests: parking, transport,
                accommodation, gifts, contacts or anything else. Empty sections
                stay hidden.
              </p>
              {theme.details.map((d, i) => (
                <div key={i} className="space-y-4 border-b border-border pb-6">
                  <Field
                    label="Heading"
                    value={d.title}
                    onChange={(v) =>
                      setting(
                        "details",
                        theme.details.map((x, n) =>
                          n === i ? { ...x, title: v } : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Information"
                    area
                    value={d.body}
                    onChange={(v) =>
                      setting(
                        "details",
                        theme.details.map((x, n) =>
                          n === i ? { ...x, body: v } : x,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Website link"
                    value={d.url}
                    type="url"
                    onChange={(v) =>
                      setting(
                        "details",
                        theme.details.map((x, n) =>
                          n === i ? { ...x, url: v } : x,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setting(
                        "details",
                        theme.details.filter((_, n) => n !== i),
                      )
                    }
                  >
                    Remove detail
                  </button>
                </div>
              ))}
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() =>
                  setting("details", [
                    ...theme.details,
                    { title: "", body: "", url: "" },
                  ])
                }
              >
                + Add useful detail
              </button>
            </div>
          )}
          {tab === 5 && (
            <div className="space-y-6">
              <h2>Music</h2>
              <label className="field">
                Music source
                <select
                  className="input"
                  value={theme.music_source}
                  onChange={(e) =>
                    setting(
                      "music_source",
                      e.target.value as InvitationTheme["music_source"],
                    )
                  }
                >
                  <option value="none">No music</option>
                  <option value="upload">Upload a song</option>
                  <option value="youtube">YouTube video</option>
                </select>
              </label>
              {theme.music_source === "upload" && (
                <>
                  <p className="text-sm text-muted">
                    Music starts only when guests open their invitation. They
                    can pause or mute at any time. Upload music you have
                    permission to share.
                  </p>
                  {media(
                    "Invitation music",
                    theme.music_url,
                    (v) => setting("music_url", v),
                    true,
                  )}
                </>
              )}
              {theme.music_source === "youtube" && (
                <>
                  <p className="text-sm text-muted">
                    Paste a YouTube video link. Guests can play it in a visible
                    video player on the invitation. It does not play as
                    background music. Some videos may show ads or be unavailable
                    for embedding.
                  </p>
                  <Field
                    label="YouTube video link"
                    value={theme.youtube_url}
                    onChange={(v) => setting("youtube_url", v)}
                    type="url"
                  />
                  {theme.youtube_url && !youtubeVideoId(theme.youtube_url) && (
                    <p role="alert" className="notice notice-error">
                      Enter a valid YouTube video link, such as a
                      youtube.com/watch or youtu.be link.
                    </p>
                  )}
                  {youtubeVideoId(theme.youtube_url) && (
                    <YouTubeMusic
                      key={theme.youtube_url}
                      url={theme.youtube_url}
                      title={theme.music_title}
                    />
                  )}
                </>
              )}
              {theme.music_source !== "none" && (
                <Field
                  label="Song or video title"
                  value={theme.music_title}
                  onChange={(v) => setting("music_title", v)}
                />
              )}
            </div>
          )}
          {tab === 7 && (
            <div className="space-y-7">
              <h2>Dress code</h2>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={theme.dress_code.enabled}
                  onChange={(e) =>
                    setting("dress_code", {
                      ...theme.dress_code,
                      enabled: e.target.checked,
                    })
                  }
                />
                Show the Coastal dress-code section
              </label>
              <Field
                label="Dress-code heading"
                value={theme.dress_code.title}
                onChange={(title) =>
                  setting("dress_code", { ...theme.dress_code, title })
                }
              />
              <Field
                label="Dress-code note"
                area
                value={theme.dress_code.note}
                onChange={(note) =>
                  setting("dress_code", { ...theme.dress_code, note })
                }
              />
              <p className="text-sm text-muted">
                The Coastal design includes the beige, brown, taupe and black
                colour palette.
              </p>
              <h2>Send gift</h2>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={theme.gift.enabled}
                  onChange={(e) =>
                    setting("gift", {
                      ...theme.gift,
                      enabled: e.target.checked,
                    })
                  }
                />
                Show Send gift on the invitation
              </label>
              <p className="text-sm text-muted">
                Enter the couple’s bank details. The section appears once all
                three fields are filled and saved. These details will be visible
                to invitation visitors.
              </p>
              <Field
                label="Bank name"
                value={theme.gift.bank}
                onChange={(bank) => setting("gift", { ...theme.gift, bank })}
              />
              <Field
                label="Account holder"
                value={theme.gift.account_holder}
                onChange={(account_holder) =>
                  setting("gift", { ...theme.gift, account_holder })
                }
              />
              <Field
                label="Account number"
                value={theme.gift.account_number}
                onChange={(account_number) =>
                  setting("gift", { ...theme.gift, account_number })
                }
              />
            </div>
          )}
          {tab === 6 && (
            <div className="space-y-6">
              <h2>Publish & RSVP</h2>
              <p className="text-sm text-muted">
                Preview your saved invitation first. After publishing, open
                Guests to share each personal link through WhatsApp.
              </p>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => update("published", e.target.checked)}
                />{" "}
                Make invitation available to guests
              </label>
              <p className="text-sm text-muted">
                Published invitations can be viewed using your website link.
                Guests need their personal link to RSVP. This setting takes effect when you save.
              </p>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={theme.rsvp_closed}
                  onChange={(e) => setting("rsvp_closed", e.target.checked)}
                />{" "}
                Stop accepting RSVP replies
              </label>
              <Field
                label="Reply by"
                type="datetime-local"
                value={
                  theme.rsvp_deadline
                    ? new Date(
                        new Date(theme.rsvp_deadline).getTime() -
                          new Date(theme.rsvp_deadline).getTimezoneOffset() *
                            60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(v) =>
                  setting("rsvp_deadline", v ? new Date(v).toISOString() : "")
                }
              />
              <p className="text-sm text-muted">Uses your device’s time zone. Leave blank for no deadline. Turning off replies above closes RSVP immediately after saving.</p>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={theme.wishes_enabled}
                  onChange={(e) => setting("wishes_enabled", e.target.checked)}
                />{" "}
                Let guests leave wishes with their RSVP
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={theme.public_wishes_visible}
                  onChange={(e) =>
                    setting("public_wishes_visible", e.target.checked)
                  }
                />
                Show guest wishes on the invitation
              </label>
              <p className="text-sm text-muted">
                New wishes appear by default. You can hide individual wishes
                below. Earlier private messages stay private.
              </p>
            </div>
          )}
        </section>
      </fieldset>
      <div className="editor-savebar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" role="status">
            {pending
              ? "Saving…"
              : busy
                ? "Upload in progress…"
                : dirty
                  ? "You have unsaved changes"
                  : state?.ok
                    ? "All changes saved"
                    : "No unsaved changes"}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn btn-secondary"
              href="/dashboard/preview"
              target="_blank"
            >
              Preview saved invitation <ArrowIcon direction="up-right" />
            </Link>
            <button className="btn btn-primary" disabled={pending || busy > 0}>
              {pending
                ? "Saving…"
                : draft.published
                  ? "Save & publish changes"
                  : "Save draft"}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          {dirty && "Save your changes before opening the preview. "}
          {draft.published
            ? "Saving updates the invitation guests can see."
            : "Your draft stays private until you publish it."}
        </p>
        {state?.ok === false && (
          <p className="notice notice-error mt-3" role="alert">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
