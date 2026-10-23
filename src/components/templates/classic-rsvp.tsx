"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useActionState, useState, useEffect } from "react";
import { submitRsvp, type RsvpResult } from "@/app/i/[slug]/actions";
import type { GuestContext } from "@/lib/supabase/types";
import type { InvitationEvent } from "@/lib/invitations/theme";
import {
  eventResponseMap,
  permittedEvents,
} from "@/lib/invitations/event-rsvp";

export function ClassicRsvp({
  slug,
  published,
  guest,
  token = "",
  preview = false,
  closed = false,
  deadline = "",
  wishes = true,
  events = [],
  eventRsvp = false,
  variant = "classic",
}: {
  slug: string;
  published: boolean;
  guest?: GuestContext | null;
  token?: string;
  preview?: boolean;
  closed?: boolean;
  deadline?: string;
  wishes?: boolean;
  events?: InvitationEvent[];
  eventRsvp?: boolean;
  variant?: "classic" | "coastal";
}) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const update = () =>
      setExpired(!!deadline && Date.now() > Date.parse(deadline));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [deadline]);
  const person: GuestContext | null | undefined =
    guest ||
    (preview
      ? {
          name: "Sample guest & family",
          invited_count: 3,
          rsvp_status: "pending",
          rsvp_attending_count: null,
          rsvp_message: null,
          dietary: null,
          table_name: null,
          checkin_token: "",
          event_ids: [],
          version: 0,
          event_rsvp_available: true,
        }
      : null);
  const available = permittedEvents(events, person?.event_ids);
  const [attending, setAttending] = useState(
    person?.rsvp_status === "declined"
      ? "no"
      : person?.rsvp_status === "attending"
        ? "yes"
        : "",
  );
  const [count, setCount] = useState(String(person?.rsvp_attending_count || 1));
  const [selected, setSelected] = useState(() =>
    available
      .filter(
        (e) => eventResponseMap(person?.event_responses)[e.id] === "attending",
      )
      .map((e) => e.id),
  );
  const [message, setMessage] = useState(person?.rsvp_message ?? "");
  const [dietary, setDietary] = useState(person?.dietary ?? "");
  const [edited, setEdited] = useState(false);
  const [savedVersion, setSavedVersion] = useState(person?.version);
  const [state, action, pending] = useActionState<RsvpResult | null, FormData>(
    async (previous, form) => {
      if (!attending)
        return { ok: false, error: "Please choose whether you can attend." };
      if (eventRsvp && attending === "yes" && !selected.length)
        return {
          ok: false,
          error: "Choose at least one event, or select that you cannot attend.",
        };
      if (
        attending === "yes" &&
        (!Number.isInteger(Number(count)) ||
          Number(count) < 1 ||
          Number(count) > (person?.invited_count ?? 0))
      )
        return { ok: false, error: "Please stay within your allocated seats." };
      const result: RsvpResult = preview
        ? { ok: true, preview: true }
        : await submitRsvp(previous, form);
      if (result.ok) {
        setEdited(false);
        if (result.version !== undefined) setSavedVersion(result.version);
      }
      return result;
    },
    null,
  );
  if ((!published || closed || expired) && !preview)
    return (
      <p className="rsvp-note">
        {closed || expired
          ? "RSVP is now closed. Please contact the couple if your plans change."
          : "RSVP will open soon."}
      </p>
    );
  if (!person)
    return (
      <p className="rsvp-note">
        Please open the personal invitation link sent to you to reply. If you
        need a new link, contact the couple.
      </p>
    );
  const unavailable =
    eventRsvp &&
    ((!preview && !person.event_rsvp_available) || !available.length);
  const coastal = variant === "coastal";
  return (
    <form
      className={
        coastal ? "coastal-reference-form coastal-live-form" : "event-rsvp-form"
      }
      action={action}
      onChange={() => setEdited(true)}
      onReset={(e) => e.preventDefault()}
    >
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="token" value={token} />
      {eventRsvp && (
        <>
          <input type="hidden" name="event_mode" value="on" />
          <input
            type="hidden"
            name="event_ids"
            value={JSON.stringify(available.map((e) => e.id))}
          />
          <input type="hidden" name="version" value={savedVersion ?? ""} />
        </>
      )}
      {preview ? (
        <p className="rsvp-note" role="note">
          Sample RSVP · Try the form. No response is saved or sent.
        </p>
      ) : (
        <p className="rsvp-note">
          We have reserved {person.invited_count}{" "}
          {person.invited_count === 1 ? "seat" : "seats"} for you.
          {person.rsvp_status !== "pending"
            ? " Your earlier reply is saved; you can update it below."
            : ""}
        </p>
      )}
      {state?.ok && !edited && (
        <div role="status" className="confirmation">
          <p>
            {state.preview
              ? "Preview only — no response was saved or sent."
              : "Thank you. Your reply has been saved."}
          </p>
          {eventRsvp && (
            <p>
              {attending === "no"
                ? "Not attending any invited event."
                : `${count} ${count === "1" ? "person" : "people"} attending: ${available
                    .filter((e) => selected.includes(e.id))
                    .map((e) => e.title)
                    .join(", ")}.`}
            </p>
          )}
        </div>
      )}
      {unavailable && (
        <p role="alert" className="rsvp-error">
          {available.length
            ? "Event RSVP is being prepared. Please contact the couple before replying."
            : "There are no available events on this invitation. Please contact the couple."}
        </p>
      )}
      <fieldset disabled={pending || unavailable} className="rsvp-fields">
        <label>
          Full name
          <input value={person.name} readOnly />
        </label>
        {coastal ? (
          <fieldset>
            <legend>Confirmation of attendance</legend>
            <input type="hidden" name="attending" value={attending} />
            <div className="coastal-response">
              <button
                type="button"
                aria-pressed={attending === "yes"}
                onClick={() => {
                  setAttending("yes");
                  setEdited(true);
                }}
              >
                yes, I’ll be there
              </button>
              <button
                type="button"
                aria-pressed={attending === "no"}
                onClick={() => {
                  setAttending("no");
                  setEdited(true);
                }}
              >
                no, I can’t come
              </button>
            </div>
          </fieldset>
        ) : (
          <label>
            Will you join us?
            <select
              name="attending"
              value={attending}
              required
              onChange={(e) => setAttending(e.target.value)}
            >
              <option value="" disabled>
                Choose your response
              </option>
              <option value="yes">Yes, I’ll attend</option>
              <option value="no">Sorry, I can’t attend</option>
            </select>
          </label>
        )}
        {eventRsvp && attending !== "no" && (
          <fieldset>
            <legend>Event attendance</legend>
            <p className="rsvp-note">
              Select the events your group will attend. When you submit,
              unchecked events are saved as not attending.
            </p>
            <div className="coastal-event-choices">
              {available.map((e) => (
                <label key={e.id}>
                  <input
                    type="checkbox"
                    name="selected_events"
                    value={e.id}
                    checked={selected.includes(e.id)}
                    onChange={(change) =>
                      setSelected((current) =>
                        change.target.checked
                          ? [...current, e.id]
                          : current.filter((id) => id !== e.id),
                      )
                    }
                  />
                  {e.title}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {attending !== "no" && (
          <>
            <label>
              Number of guests, including you
              <select
                name="attending_count"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              >
                {Array.from({ length: person.invited_count }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} {i === 0 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </label>
            {eventRsvp && (
              <p className="rsvp-note">
                This same guest count applies to every selected event.
              </p>
            )}
            <label>
              Dietary requirements (optional)
              <textarea
                name="dietary"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                maxLength={500}
                rows={2}
              />
            </label>
          </>
        )}
        {wishes && (
          <label>
            Your wishes (private message)
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your wishes"
              maxLength={1000}
              rows={coastal ? 2 : 4}
            />
          </label>
        )}
      </fieldset>
      {state?.ok === false && (
        <p role="alert" className="rsvp-error">
          {state.error}
        </p>
      )}
      <button className="submit-button" disabled={pending || unavailable}>
        {pending
          ? "Saving your reply…"
          : person.rsvp_status === "pending"
            ? "Send your RSVP"
            : "Update your RSVP"}
        {!pending && !coastal && (
          <>
            {" "}
            <ArrowIcon />
          </>
        )}
      </button>
    </form>
  );
}
