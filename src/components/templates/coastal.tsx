"use client";
/* Figma SVG exports keep their intrinsic dimensions; photographs use next/image. */
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { CoastalAmpersand } from "./coastal-ampersand";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  animateCoastalMenu,
  closeCoastalMenu,
  useCoastalMotion,
} from "./coastal-motion";
import type { GuestContext, Invitation } from "@/lib/supabase/types";
import { parseInvitationTheme } from "@/lib/invitations/theme";
import { formatInviteDate } from "@/lib/invitations/display";
import { ClassicCountdown } from "./classic-countdown";
import { ClassicRsvp } from "./classic-rsvp";
import { ReceptionPass } from "./reception-pass";
import { YouTubeMusic } from "./youtube-music";
import { CoastalGalleryViewer } from "./coastal-gallery-viewer";
import { CoastalWishes } from "./coastal-wishes";
import { coastalPalettes } from "@/lib/invitations/coastal-options";
import { noWishes, type InvitationWishes } from "@/lib/invitations/wishes";
import "./coastal.css";

const art = (name: string) => `/invitation-art/coastal/${name}`;
export type CoastalReference = {
  openingPhoto: string;
  groomFullName: string;
  brideFullName: string;
  gift: { account: string; number: string; bank?: string };
  wishes: { name: string; message: string }[];
};
const gallerySlots = [
  [0, 0, 147, 200],
  [153, 0, 147, 148],
  [153, 153, 147, 100],
  [0, 206, 147, 147],
  [0, 359, 147, 100],
  [153, 259, 147, 200],
  [0, 465, 300, 200],
  [0, 671, 147, 147],
  [153, 671, 147, 263],
  [0, 824, 147, 110],
];
const referenceCrops = [
  { width: "100.68%", height: "110.99%", top: "-5.24%", left: 0 },
  { width: "100.24%", height: "149.32%", top: "-48.99%", left: "-.12%" },
  { width: "102.04%", height: "100.01%", top: "-.01%", left: "-.34%" },
  { width: "149.98%", height: "100%", top: 0, left: "-29.07%" },
  { width: "100.2%", height: "221%", top: "-100%", left: "-.1%" },
  { width: "100%", height: "110.24%", top: "-8.12%", left: 0 },
  {},
  { width: "100%", height: "149.98%", top: "-6.96%", left: 0 },
  { width: "119.29%", height: "100%", top: "-.19%", left: "-6.92%" },
  { width: "112.27%", height: "100%", top: 0, left: "-6.14%" },
];
function Photo({
  src,
  alt,
  style,
  priority = false,
}: {
  src: string;
  alt: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={1800}
      sizes="(max-width: 402px) 100vw, 402px"
      priority={priority}
      style={style}
    />
  );
}

/** Reference form is local-only: it never calls an action or persists responses. */
function ReferenceRsvp({ name, events }: { name: string; events: string[] }) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [sent, setSent] = useState(false);
  return (
    <form
      className="coastal-reference-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label>
        Full name
        <input value={name} readOnly />
      </label>
      <fieldset>
        <legend>Confirmation of attendance</legend>
        <div className="coastal-response">
          <button
            type="button"
            aria-pressed={attending === true}
            onClick={() => {
              setAttending(true);
              setSent(false);
            }}
          >
            yes, I’ll be there
          </button>
          <button
            type="button"
            aria-pressed={attending === false}
            onClick={() => {
              setAttending(false);
              setSent(false);
            }}
          >
            no, I can’t come
          </button>
        </div>
      </fieldset>
      {attending !== false && (
        <>
          <fieldset>
            <legend>Event attendance</legend>
            <div className="coastal-event-choices">
              {events.map((e) => (
                <label key={e}>
                  <input type="checkbox" />
                  {e}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            No of pax
            <select defaultValue="1">
              {[1, 2, 3].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label>
        Your wishes
        <textarea placeholder="Type your wishes" rows={1} />
      </label>
      <button type="submit" disabled={attending === null}>
        submit
      </button>
      {sent && <p role="status">Preview only — no response was sent.</p>}
    </form>
  );
}

export function CoastalInvitation({
  invitation,
  guest,
  token,
  preview = false,
  reference,
  publicWishes = noWishes,
}: {
  invitation: Invitation;
  guest?: GuestContext | null;
  token?: string;
  preview?: boolean;
  reference?: CoastalReference;
  publicWishes?: InvitationWishes;
}) {
  const theme = parseInvitationTheme(invitation.theme);
  const [opened, setOpened] = useState(false);
  const [openingVisible, setOpeningVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissOpening = useCallback(() => setOpeningVisible(false), []);
  useCoastalMotion(rootRef, opened, dismissOpening);
  const [menu, setMenu] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [failedVendorLogo, setFailedVendorLogo] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const closingMenu = useRef(false);
  const menuExit = useRef<ReturnType<typeof closeCoastalMenu>>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);
  const vendorLogoRef = useRef<HTMLImageElement>(null);
  const homeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // An image can fail before hydration attaches its error handler.
    const logo = vendorLogoRef.current;
    if (logo?.complete && !logo.naturalWidth)
      setFailedVendorLogo(theme.footer.logo_url);
  }, [theme.footer.logo_url]);
  const date = formatInviteDate(invitation.wedding_date)?.toUpperCase() ?? "";
  const groom = invitation.groom_name || "The groom",
    bride = invitation.bride_name || "The bride";
  const cover = invitation.cover_photo_url;
  const events = theme.events.filter(
    (e) => !guest?.event_ids?.length || guest.event_ids.includes(e.id),
  );
  const gift =
    reference?.gift ||
    (theme.gift.enabled &&
    theme.gift.bank &&
    theme.gift.account_holder &&
    theme.gift.account_number
      ? {
          account: theme.gift.account_holder,
          number: theme.gift.account_number,
          bank: theme.gift.bank,
        }
      : null);
  const wishes =
    reference?.wishes ??
    (theme.public_wishes_visible ? publicWishes.items : []);
  useEffect(() => {
    if (!menu) return;
    const dialog = menuRef.current;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog?.showModal();
    closingMenu.current = false;
    const revertMotion = dialog ? animateCoastalMenu(dialog) : undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      menuExit.current?.kill();
      revertMotion?.();
      dialog?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [menu]);
  function closeMenu(after?: () => void) {
    if (closingMenu.current) return;
    closingMenu.current = true;
    const complete = () => {
      setMenu(false);
      if (after) requestAnimationFrame(after);
    };
    if (menuRef.current)
      menuExit.current = closeCoastalMenu(menuRef.current, complete);
    else complete();
  }
  async function openInvitation() {
    setOpened(true);
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    }
    requestAnimationFrame(() =>
      homeRef.current?.focus({ preventScroll: true }),
    );
  }
  function go(id: string) {
    closeMenu(() => {
      setOpeningVisible(false);
      setOpened(true);
      requestAnimationFrame(() => {
        const el = rootRef.current?.querySelector<HTMLElement>(`#${id}`);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      });
    });
  }
  const nav = [
    ["coastal-home", "Home"],
    ["coastal-details", "Wedding details"],
    ["coastal-rsvp", "RSVP"],
    ...(theme.gallery.length ? [["coastal-gallery", "Gallery"]] : []),
    ...(wishes.length ? [["coastal-wishes", "Wishes"]] : []),
    ...(gift ? [["coastal-gift", "Send gift"]] : []),
  ];
  return (
    <div className="coastal-page">
      <div
        ref={rootRef}
        className={`coastal-invitation ${reference ? "coastal-reference" : ""}`}
      >
        <header
          className={`coastal-header ${!opened ? "coastal-header-light" : ""}`}
        >
          <img
            src={art(opened ? "logo-dark.png" : "logo-light.png")}
            width="41"
            height="50"
            alt="C/M wedding monogram"
          />
          <button
            type="button"
            className="coastal-menu-button"
            onClick={() => setMenu(true)}
            aria-label="Open invitation menu"
            aria-expanded={menu}
          >
            <img
              src={art(opened ? "menu-dark.svg" : "menu-light.svg")}
              alt=""
            />
          </button>
        </header>
        {openingVisible && (
          <section
            className={`coastal-opening ${opened ? "coastal-opening-leaving" : ""}`}
            inert={opened}
            aria-hidden={opened}
            aria-label="Open your invitation"
          >
            {cover && (
              <div className="coastal-cover-photo">
                <Photo
                  src={cover}
                  alt=""
                  priority
                  style={
                    reference
                      ? undefined
                      : { objectPosition: `center ${theme.cover_position}%` }
                  }
                />
              </div>
            )}
            <div className="coastal-shade" />
            <div className="coastal-opening-card">
              <img
                className="coastal-opening-frame"
                src={art("opening-frame.svg")}
                alt=""
              />
              <div className="coastal-opening-content">
                <p>DEAR,</p>
                <h1>{guest?.name || "OUR DEAR GUEST"}</h1>
                {(reference?.openingPhoto ||
                  theme.story_photo_url ||
                  cover) && (
                  <div className="coastal-opening-photo">
                    <Photo
                      src={
                        reference?.openingPhoto ||
                        theme.story_photo_url ||
                        cover!
                      }
                      alt={`${groom} and ${bride}`}
                      style={
                        reference
                          ? {
                              width: "150.04%",
                              height: "100%",
                              left: "-44.07%",
                            }
                          : undefined
                      }
                    />
                  </div>
                )}
                <p className="coastal-opening-message">
                  You are invited
                  <br />
                  to the wedding of
                  <br />
                  {groom} &amp; {bride}
                </p>
                <button
                  onClick={openInvitation}
                  type="button"
                  disabled={opened}
                >
                  open invitation
                </button>
              </div>
            </div>
          </section>
        )}
        <div className="coastal-content" hidden={!opened}>
          <section
            className="coastal-home"
            id="coastal-home"
            ref={homeRef}
            tabIndex={-1}
          >
            {cover && (
              <div className="coastal-cover-photo">
                <Photo
                  src={cover}
                  alt={`${groom} and ${bride}`}
                  priority
                  style={
                    reference
                      ? undefined
                      : { objectPosition: `center ${theme.cover_position}%` }
                  }
                />
              </div>
            )}
            <div className="coastal-home-title">
              <p>THE WEDDING OF</p>
              <h1>
                <span>{groom}</span>
                <em aria-label="and">
                  <CoastalAmpersand />
                </em>
                <span>{bride}</span>
              </h1>
            </div>
            <p className="coastal-date">{date}</p>
          </section>
          <section className="coastal-couple" aria-label="The groom and bride">
            {[
              {
                role: "GROOM",
                name: reference?.groomFullName || groom,
                photo: theme.groom_photo,
                description: theme.groom_description,
              },
              {
                role: "BRIDE",
                name: reference?.brideFullName || bride,
                photo: theme.bride_photo,
                description: theme.bride_description,
              },
            ].map((p, i) => (
              <article key={p.role}>
                <h2>
                  <em>the</em>
                  {p.role}
                </h2>
                {p.photo && (
                  <div className="coastal-person-photo">
                    <Photo
                      src={p.photo}
                      alt={p.name}
                      style={
                        reference
                          ? i
                            ? {
                                width: "128.8%",
                                height: "147.72%",
                                left: "-6.19%",
                                top: "-41.31%",
                              }
                            : {
                                width: "100%",
                                height: "114.69%",
                                top: "-14.6%",
                              }
                          : undefined
                      }
                    />
                  </div>
                )}
                <h3>{p.name}</h3>
                <p>{p.description}</p>
              </article>
            ))}
          </section>
          {invitation.wedding_date && (
            <section className="coastal-countdown">
              <p>COUNTDOWN</p>
              <ClassicCountdown weddingDate={invitation.wedding_date} />
            </section>
          )}
          <section
            className="coastal-details"
            id="coastal-details"
            tabIndex={-1}
          >
            <img
              className="coastal-leaves"
              src={art("19-166-imgGroup.svg")}
              alt=""
            />
            <h2>
              <em>the</em>DETAILS
            </h2>
            <div className="coastal-event">
              <p>DATE</p>
              <h3>{date || "Date to be announced"}</h3>
            </div>
            {events.map((e) => (
              <article className="coastal-event" key={e.id}>
                <p>{e.title.toUpperCase()}</p>
                <h3>
                  {e.date &&
                    e.date !== invitation.wedding_date?.slice(0, 10) && (
                      <>
                        {formatInviteDate(e.date)}
                        <br />
                      </>
                    )}
                  {e.time}
                  <br />
                  {e.venue_name}
                  <br />
                  {e.venue_address}
                </h3>
                {e.map_url && (
                  <a
                    className="coastal-pill"
                    href={e.map_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open maps
                  </a>
                )}
                {e.description && <p>{e.description}</p>}
                {e.instructions && <p>{e.instructions}</p>}
                {!reference && !theme.dress_code.enabled && e.dress_code && (
                  <p>Dress code: {e.dress_code}</p>
                )}
              </article>
            ))}
            {!events.length && (
              <div className="coastal-event">
                <h3>{invitation.venue_name || "Venue to be announced"}</h3>
                <p>{invitation.venue_address}</p>
              </div>
            )}
            {(reference || theme.dress_code.enabled) && (
              <div className="coastal-dress">
                <p>DRESSCODE</p>
                <h3>
                  {reference
                    ? "STRICTLY NO BATIK"
                    : theme.dress_code.title.toUpperCase()}
                </h3>
                <div>
                  {(reference
                    ? coastalPalettes[0].colors
                    : theme.dress_code.colors
                  ).map((c, i) => {
                    const original = coastalPalettes[0].colors.findIndex(
                      (v) => v.color === c.color,
                    );
                    return original >= 0 ? (
                      <img
                        key={i}
                        src={art(`19-166-imgEllipse${original + 2}.svg`)}
                        alt={c.name}
                        title={`${c.name} (${c.color})`}
                      />
                    ) : (
                      <span
                        key={i}
                        className="coastal-dress-swatch"
                        role="img"
                        aria-label={`${c.name} (${c.color})`}
                        title={`${c.name} (${c.color})`}
                        style={{ backgroundColor: c.color }}
                      />
                    );
                  })}
                </div>
                <p style={{ whiteSpace: "pre-line" }}>
                  {reference
                    ? "OR BLACK SUIT FOR MEN\n\nWe invite you to incorporate our\nwedding colors into your attire"
                    : theme.dress_code.note}
                </p>
              </div>
            )}
          </section>
          <section className="coastal-rsvp" id="coastal-rsvp" tabIndex={-1}>
            <h2>RSVP</h2>
            <p>
              We’d love to know if you can
              <br />
              join us on our special day
            </p>
            {reference ? (
              <ReferenceRsvp
                name={guest?.name || "Our dear guest"}
                events={events.map((e) => e.title)}
              />
            ) : (
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
                variant="coastal"
                publicWishes={publicWishes.ready}
                ownWish={publicWishes.ownMessage}
              />
            )}
          </section>
          {theme.gallery.length > 0 && (
            <section
              className="coastal-gallery"
              id="coastal-gallery"
              tabIndex={-1}
              aria-label="Photo gallery"
            >
              <img
                className="coastal-gallery-paper"
                src={art("23-481-imgRectangle5.svg")}
                alt=""
              />
              {Array.from(
                { length: Math.ceil(theme.gallery.length / 10) },
                (_, batch) => {
                  const count = Math.min(10, theme.gallery.length - batch * 10);
                  const boardHeight = Math.max(
                    ...gallerySlots.slice(0, count).map(([, y, , h]) => y + h),
                  );
                  return (
                    <div
                      className="coastal-gallery-board"
                      key={batch}
                      style={{ aspectRatio: `300 / ${boardHeight}` }}
                    >
                      {theme.gallery
                        .slice(batch * 10, batch * 10 + 10)
                        .map((p, i) => {
                          const [x, y, w, h] = gallerySlots[i];
                          return (
                            <button
                              key={p.src + i}
                              type="button"
                              aria-label={`View ${p.alt || `photograph ${batch * 10 + i + 1}`}`}
                              style={{
                                left: `${x / 3}%`,
                                top: `${(y / boardHeight) * 100}%`,
                                width: `${w / 3}%`,
                                height: `${(h / boardHeight) * 100}%`,
                              }}
                              onClick={() => setPhoto(batch * 10 + i)}
                            >
                              <Photo
                                src={p.src}
                                alt={p.alt}
                                style={
                                  reference ? referenceCrops[i] : undefined
                                }
                              />
                            </button>
                          );
                        })}
                    </div>
                  );
                },
              )}
            </section>
          )}
          {gift && (
            <section className="coastal-gift" id="coastal-gift" tabIndex={-1}>
              <div className="coastal-gift-card">
                <img
                  className="coastal-gift-frame"
                  src={art("23-520-imgVector.svg")}
                  alt=""
                />
                <div className="coastal-gift-content">
                  <h2>SEND GIFT</h2>
                  <p>
                    Gifts can be sent directly
                    <br />
                    to the couple’s account
                  </p>
                  <h3>
                    {gift.bank ? `${gift.bank} - ` : ""}
                    {gift.account}
                    <br />
                    {gift.number}
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(gift.number);
                        setCopyStatus("Copied");
                      } catch {
                        setCopyStatus(
                          "Please select and copy the number above.",
                        );
                      }
                    }}
                  >
                    copy number
                  </button>
                  <div className="coastal-gift-logo" aria-hidden="true">
                    {["imgGroup", "imgGroup1", "imgGroup2", "imgGroup3"].map(
                      (n, i) => (
                        <img
                          className={`coastal-logo-layer-${i}`}
                          key={n}
                          src={art(`23-520-${n}.svg`)}
                          alt=""
                        />
                      ),
                    )}
                  </div>
                  <p>
                    THANK YOU FOR
                    <br />
                    YOUR GIFT!
                  </p>
                  <span role="status">{copyStatus}</span>
                </div>
              </div>
            </section>
          )}
          {wishes.length > 0 && (
            <section
              className="coastal-wishes"
              id="coastal-wishes"
              tabIndex={-1}
            >
              <img
                className="coastal-wishes-paper"
                src={art("24-669-imgRectangle5.svg")}
                alt=""
              />
              <h2>WISHES</h2>
              <p>Thank you for all the wishes!</p>
              <CoastalWishes wishes={wishes} />
            </section>
          )}
          {theme.details.map((d, i) => (
            <section className="coastal-extra" key={i}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="coastal-pill"
                >
                  Learn more
                </a>
              )}
            </section>
          ))}
          {theme.music_source === "youtube" && (
            <section className="coastal-extra">
              <YouTubeMusic url={theme.youtube_url} title={theme.music_title} />
            </section>
          )}
          {guest?.rsvp_status === "attending" && guest.checkin_token && (
            <section
              className="coastal-pass-section"
              id="reception-pass"
              aria-label="Your reception pass"
              tabIndex={-1}
            >
              <ReceptionPass
                token={guest.checkin_token}
                name={guest.name}
                table={guest.table_name}
              />
            </section>
          )}
          <footer className="coastal-footer">
            {reference ? (
              <p className="coastal-footer-vendor">LOGO VENDOR</p>
            ) : (
              theme.footer.enabled &&
              (theme.footer.logo_url &&
              failedVendorLogo !== theme.footer.logo_url ? (
                <img
                  ref={vendorLogoRef}
                  className="coastal-footer-logo"
                  src={theme.footer.logo_url}
                  alt={theme.footer.vendor_name || "Vendor logo"}
                  onError={() => setFailedVendorLogo(theme.footer.logo_url)}
                />
              ) : (
                theme.footer.vendor_name && (
                  <p className="coastal-footer-vendor">
                    {theme.footer.vendor_name}
                  </p>
                )
              ))
            )}
            <p>Copyright © {new Date().getFullYear()}. All rights reserved.</p>
            {reference ? (
              <div className="coastal-footer-socials" aria-hidden="true">
                <span>WA</span>
                <span>IG</span>
              </div>
            ) : (
              theme.footer.enabled &&
              (theme.footer.whatsapp_url || theme.footer.instagram_url) && (
                <nav
                  className="coastal-footer-socials"
                  aria-label="Vendor social links"
                >
                  {theme.footer.whatsapp_url && (
                    <a
                      href={theme.footer.whatsapp_url}
                      aria-label="Vendor WhatsApp"
                      target="_blank"
                      rel="noreferrer"
                    >
                      WA
                    </a>
                  )}
                  {theme.footer.instagram_url && (
                    <a
                      href={theme.footer.instagram_url}
                      aria-label="Vendor Instagram"
                      target="_blank"
                      rel="noreferrer"
                    >
                      IG
                    </a>
                  )}
                </nav>
              )
            )}
          </footer>
        </div>
        {theme.music_source === "upload" && theme.music_url && (
          <>
            <audio ref={audioRef} src={theme.music_url} preload="none" loop />
            {opened && (
              <button
                className="coastal-music"
                type="button"
                aria-label={musicPlaying ? "Pause music" : "Play music"}
                title={musicPlaying ? "Pause music" : "Play music"}
                onClick={async () => {
                  if (!audioRef.current) return;
                  if (musicPlaying) {
                    audioRef.current.pause();
                    setMusicPlaying(false);
                  } else {
                    try {
                      await audioRef.current.play();
                      setMusicPlaying(true);
                    } catch {
                      setMusicPlaying(false);
                    }
                  }
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  {musicPlaying ? (
                    <path d="M7 5h4v14H7zM14 5h4v14h-4z" />
                  ) : (
                    <path d="M8 5v14l11-7z" />
                  )}
                </svg>
              </button>
            )}
          </>
        )}
        {menu && (
          <dialog
            ref={menuRef}
            className="coastal-menu"
            aria-label="Invitation navigation"
            onCancel={(e) => {
              e.preventDefault();
              closeMenu();
            }}
          >
            <button
              className="coastal-menu-close"
              type="button"
              aria-label="Close invitation menu"
              onClick={() => closeMenu()}
            >
              <img src={art("24-713-imgX.svg")} alt="" />
            </button>
            <nav>
              {nav.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(id);
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </dialog>
        )}
        {photo !== null && (
          <CoastalGalleryViewer
            items={theme.gallery}
            initialIndex={photo}
            onClose={() => setPhoto(null)}
          />
        )}
      </div>
    </div>
  );
}
