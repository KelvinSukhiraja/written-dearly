import { ArrowIcon } from "@/components/arrow-icon";
import "./classic.css";
import { ClassicCountdown } from "@/components/templates/classic-countdown";
import { ClassicRsvp } from "@/components/templates/classic-rsvp";
import { InvitationOpening } from "@/components/templates/invitation-opening";
import {
  coupleInitials,
  coupleNames,
  formatInviteDate,
} from "@/lib/invitations/display";
import { parseInvitationTheme } from "@/lib/invitations/theme";
import type { Invitation } from "@/lib/supabase/types";
import type { GuestContext } from "@/lib/supabase/types";
import { ReceptionPass } from "./reception-pass";
import { Gallery } from "./gallery";
import { InvitationMotion } from "./invitation-motion";
import { YouTubeMusic } from "./youtube-music";

// Keep the invitation's first paint self-contained. Couples can replace these
// with their own saved media, but a draft should never depend on a third-party
// image host or expose guest browsing to one.
const FALLBACK_HERO = "/invitation-art/botanical-linen.webp";
const FALLBACK_STORY = "/invitation-art/botanical-linen.webp";

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function ClassicInvitation({
  invitation,
  guest,
  token = "",
  preview = false,
}: {
  invitation: Invitation;
  guest?: GuestContext | null;
  token?: string;
  preview?: boolean;
}) {
  const bride = invitation.bride_name?.trim() || "Bride";
  const groom = invitation.groom_name?.trim() || "Groom";
  const names = coupleNames(invitation) || `${bride} & ${groom}`;
  const initials = coupleInitials(invitation);
  const dateLabel = formatInviteDate(invitation.wedding_date);
  const theme = parseInvitationTheme(invitation.theme);
  const heroImage = invitation.cover_photo_url || FALLBACK_HERO;
  const storyImage =
    theme.story_photo_url || invitation.cover_photo_url || FALLBACK_STORY;
  const events = (
    theme.events.length > 0
      ? theme.events
      : invitation.venue_name || invitation.venue_address
        ? [
            {
              id: "main",
              date: "",
              end_time: "",
              description: "",
              dress_code: "",
              map_url: "",
              instructions: "",
              title: "The ceremony",
              time: null,
              venue_name: invitation.venue_name,
              venue_address: invitation.venue_address,
            },
          ]
        : []
  ).filter(
    (event) => !guest?.event_ids?.length || guest.event_ids.includes(event.id),
  );

  return (
    <InvitationOpening
      firstName={bride}
      secondName={groom}
      date={dateLabel ?? ""}
      invitationId={invitation.slug}
      musicUrl={theme.music_source === "upload" ? theme.music_url : undefined}
      musicTitle={theme.music_title}
      greeting={guest ? `Dear ${guest.name}` : undefined}
    >
      <InvitationMotion>
        <div className="invite-classic">
          {!invitation.published ? (
            <p className="invite-draft">
              Draft — publish from the studio before sharing this link.
            </p>
          ) : null}

          <section
            className="hero"
            aria-labelledby="wedding-title"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: `50% ${theme.cover_position}%`,
            }}
          >
            <div className="hero-overlay" />
            <nav className="nav" aria-label="Invitation">
              <a href="#top" className="monogram" aria-label="Back to top">
                {initials.bride} <i>&</i> {initials.groom}
              </a>
              <div className="nav-links">
                <a href="#story">Our story</a>
                <a href="#details">Details</a>
                <a href="#rsvp">RSVP</a>
              </div>
            </nav>
            <div className="hero-content" id="top">
              <p className="eyebrow light">{theme.opening_message}</p>
              {guest && (
                <p className="guest-greeting">
                  Dear {guest.name}, this moment is yours to share.
                </p>
              )}
              <h1 id="wedding-title">
                <span>{bride}</span>
                <em>&</em>
                <span>{groom}</span>
              </h1>
              <div className="hero-rule" />
              {dateLabel ? <p className="hero-date">{dateLabel}</p> : null}
              {invitation.wedding_date ? (
                <ClassicCountdown weddingDate={invitation.wedding_date} />
              ) : null}
            </div>
            <a
              href="#story"
              className="scroll-cue"
              aria-label="Scroll to our story"
            >
              <span>Scroll to explore</span>
              <i />
            </a>
          </section>
          {theme.music_source === "youtube" && theme.youtube_url && (
            <section className="section" aria-label="Our soundtrack">
              <SectionHeading
                eyebrow="Our soundtrack"
                title={theme.music_title}
              />
              <YouTubeMusic url={theme.youtube_url} title={theme.music_title} />
            </section>
          )}

          {(theme.bride_description ||
            theme.groom_description ||
            theme.bride_photo ||
            theme.groom_photo) && (
            <section className="section couple-section" id="couple">
              <SectionHeading
                eyebrow="Two lives, one story"
                title="A little about us"
              />
              <div className="couple-grid">
                {[
                  {
                    name: bride,
                    photo: theme.bride_photo,
                    description: theme.bride_description,
                  },
                  {
                    name: groom,
                    photo: theme.groom_photo,
                    description: theme.groom_description,
                  },
                ].map((person) => (
                  <article key={person.name} className="couple-card">
                    {person.photo && (
                      <img
                        src={person.photo}
                        alt={person.name}
                        loading="lazy"
                      />
                    )}
                    <h3>{person.name}</h3>
                    <p>{person.description}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="story section" id="story">
            <div className="story-copy">
              <SectionHeading
                eyebrow="Chapter one"
                title={theme.story_heading ?? "Our story"}
              />
              <p>
                {invitation.story?.trim() ||
                  "The couple’s story will appear here once they write it in the studio."}
              </p>
              <span className="signature">
                {initials.bride} <i>&</i> {initials.groom}
              </span>
            </div>
            <div className="story-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={storyImage} alt="" loading="lazy" decoding="async" />
            </div>
          </section>

          {theme.milestones.length > 0 && (
            <section className="section milestones">
              <SectionHeading
                eyebrow="The chapters before forever"
                title="How we got here"
              />
              {theme.milestones.map((m, i) => (
                <article className="milestone" key={i}>
                  <span>{m.date}</span>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                </article>
              ))}
            </section>
          )}

          {events.length > 0 ? (
            <section className="details section" id="details">
              <SectionHeading eyebrow="Join us" title="The details" />
              <div
                className={`event-grid${events.length === 1 ? " single" : ""}`}
              >
                {events.map((event) => {
                  const address = event.venue_address;
                  return (
                    <article
                      className="event-card"
                      key={`${event.title}-${event.venue_name}`}
                    >
                      <span className="event-label">{event.title}</span>
                      {event.date && <p>{formatInviteDate(event.date)}</p>}
                      <h3>{event.venue_name || event.title}</h3>
                      {event.time ? (
                        <p className="event-time">{event.time}</p>
                      ) : null}
                      {event.end_time && <p>Until {event.end_time}</p>}
                      {event.description && <p>{event.description}</p>}
                      {event.dress_code && (
                        <p>Dress code · {event.dress_code}</p>
                      )}
                      {event.instructions && <p>{event.instructions}</p>}
                      {address ? <p>{address}</p> : null}
                      {address ? (
                        <a
                          href={event.map_url || mapsUrl(address)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on map <ArrowIcon direction="up-right" />
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="details section" id="details">
              <SectionHeading eyebrow="Join us" title="The details" />
              <p className="details-empty">Venue details will appear here.</p>
            </section>
          )}

          {theme.gallery.length > 0 ? (
            <section
              className="gallery section"
              aria-labelledby="gallery-title"
            >
              <SectionHeading
                eyebrow="A few favorite moments"
                title="Our gallery"
              />
              <Gallery photos={theme.gallery} />
            </section>
          ) : null}

          {theme.details.length > 0 && (
            <section className="section useful-details">
              <SectionHeading
                eyebrow="A few thoughtful details"
                title="Before you arrive"
              />
              <div className="useful-grid">
                {theme.details.map((detail, i) => (
                  <article key={i}>
                    <h3>{detail.title}</h3>
                    <p>{detail.body}</p>
                    {detail.url && (
                      <a href={detail.url} target="_blank" rel="noreferrer">
                        More information <ArrowIcon direction="up-right" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="rsvp section" id="rsvp">
            <div className="rsvp-inner">
              <SectionHeading
                eyebrow="We hope you can join us"
                title="Kindly RSVP"
              />
              <ClassicRsvp
                slug={invitation.slug}
                published={invitation.published}
                guest={guest}
                token={token}
                preview={preview}
                closed={theme.rsvp_closed}
                deadline={theme.rsvp_deadline}
                wishes={theme.wishes_enabled}
                events={events}
                eventRsvp={theme.rsvp_events_enabled}
              />
            </div>
          </section>
          {guest &&
            guest.rsvp_status === "attending" &&
            guest.checkin_token && (
              <section className="section pass-section" id="reception-pass">
                <ReceptionPass
                  token={guest.checkin_token}
                  name={guest.name}
                  table={guest.table_name}
                />
              </section>
            )}

          <footer>
            <p>With love and gratitude</p>
            <div>
              {bride} <i>&</i> {groom}
            </div>
            <span>
              {[dateLabel, invitation.venue_name].filter(Boolean).join(" · ") ||
                names}
            </span>
          </footer>
        </div>
      </InvitationMotion>
    </InvitationOpening>
  );
}
