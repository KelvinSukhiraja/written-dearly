"use client";
import { useState } from "react";
import type { Guest, RsvpStatus } from "@/lib/supabase/types";
import type { InvitationEvent } from "@/lib/invitations/theme";
import { normalizeGuestPhone, PHONE_ERROR } from "@/lib/guests/contact";
import {
  eventResponseMap,
  permittedEvents,
} from "@/lib/invitations/event-rsvp";

export function GuestForm({
  guest,
  events,
  eventRsvp = false,
  pending,
  error,
  onSave,
  onCancel,
}: {
  guest: Guest | null;
  events: InvitationEvent[];
  eventRsvp?: boolean;
  pending: boolean;
  error: string;
  onSave: (form: FormData, prepare: boolean) => void;
  onCancel: () => void;
}) {
  const [extra, setExtra] = useState(String((guest?.invited_count ?? 1) - 1));
  const [status, setStatus] = useState<RsvpStatus>(
    guest?.rsvp_status ?? "pending",
  );
  const [country, setCountry] = useState(guest?.phone ? "" : "+62");
  const [number, setNumber] = useState(guest?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const total = extra === "" ? 0 : Number(extra) + 1;
  const rawPhone = country ? country + number.replace(/^0/, "") : number;
  const phone = normalizeGuestPhone(rawPhone);
  const [count, setCount] = useState(String(guest?.rsvp_attending_count || 1));
  const [access, setAccess] = useState(guest?.event_ids ?? []);
  const [choices, setChoices] = useState(() =>
    events
      .filter(
        (e) => eventResponseMap(guest?.event_responses)[e.id] === "attending",
      )
      .map((e) => e.id),
  );
  const [replyEdited, setReplyEdited] = useState(false);
  return (
    <form
      className="space-y-5"
      onInvalidCapture={(event) => {
        const details = (event.target as HTMLElement).closest("details");
        if (details) details.open = true;
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (!phone) {
          setPhoneError(PHONE_ERROR);
          return;
        }
        const form = new FormData(event.currentTarget);
        form.set("phone", phone);
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        onSave(form, submitter?.value === "prepare");
      }}
    >
      <p className="text-sm text-muted">
        One invitation covers this guest and their companions.{" "}
        <span className="whitespace-nowrap">* Required</span>
      </p>
      <fieldset disabled={pending} className="space-y-5">
        <input type="hidden" name="version" value={guest?.version ?? 0} />
        {eventRsvp && (
          <input
            type="hidden"
            name="event_reply_edited"
            value={replyEdited ? "on" : "off"}
          />
        )}
        <div className="form-grid">
          <label className="field">
            Guest or family name *
            <input
              className="input"
              name="name"
              required
              maxLength={200}
              autoComplete="off"
              defaultValue={guest?.name ?? ""}
              placeholder="e.g. Alex Tan or Tan Family"
            />
          </label>
          <label className="field">
            Invited by *
            <select
              className="input"
              name="side"
              required
              defaultValue={guest?.side ?? ""}
            >
              <option value="" disabled>
                Choose a side
              </option>
              <option value="bride">Bride</option>
              <option value="groom">Groom</option>
            </select>
          </label>
        </div>
        <div className="space-y-2">
          <div className="form-grid">
            <label className="field">
              Country code
              <select
                className="input"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setPhoneError("");
                }}
              >
                <option value="+62">Indonesia (+62)</option>
                <option value="+60">Malaysia (+60)</option>
                <option value="+65">Singapore (+65)</option>
                <option value="+61">Australia (+61)</option>
                <option value="+44">United Kingdom (+44)</option>
                <option value="+1">US / Canada (+1)</option>
                <option value="">Other / full international number</option>
              </select>
            </label>
            <label className="field">
              WhatsApp number *
              <input
                className="input"
                type="tel"
                inputMode="tel"
                required
                maxLength={32}
                value={number}
                placeholder={country ? "812 3456 7890" : "+62 812 3456 7890"}
                aria-invalid={!!phoneError}
                aria-describedby="guest-phone-help"
                onBlur={() =>
                  setPhoneError(number && !phone ? PHONE_ERROR : "")
                }
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^0-9+() .-]/g, "")
                    .replace(/(?!^)\+/g, "");
                  if (value.startsWith("+") || value.startsWith("00"))
                    setCountry("");
                  setNumber(value);
                  setPhoneError("");
                }}
              />
            </label>
          </div>
          <p
            id="guest-phone-help"
            className={
              phoneError ? "text-sm text-red-700" : "text-xs text-muted"
            }
          >
            {phoneError ||
              (phone
                ? "Invitation will be addressed to " + phone
                : "Choose the country code, then enter the number. You can also paste a full international number.")}
          </p>
        </div>
        <label className="field">
          Extra guests allowed *
          <input
            className="input"
            type="number"
            min={0}
            max={99}
            step={1}
            required
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
          <input type="hidden" name="invited_count" value={total || ""} />
          <span className="text-xs">
            {total > 0
              ? total === 1
                ? "Invitee only. No companions."
                : `Invitee + ${total - 1} ${total === 2 ? "companion" : "companions"} = ${total} people maximum.`
              : "Enter 0 if the invitee is coming alone."}
          </span>
        </label>
        <details className="guest-form-details">
          <summary>Additional details</summary>
          <div className="form-grid mt-4">
            {(
              [
                ["email", "Email address", "email"],
                ["group", "Family / group", "text"],
                ["table_name", "Table assignment", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <label className="field" key={key}>
                {label}
                <input
                  className="input"
                  name={key}
                  type={type}
                  maxLength={key === "email" ? 254 : 100}
                  defaultValue={guest?.[key] ?? ""}
                />
              </label>
            ))}
            <label className="field">
              Private notes
              <textarea
                className="input"
                name="notes"
                maxLength={1000}
                defaultValue={guest?.notes ?? ""}
              />
            </label>
          </div>
          {guest && events.length > 0 && (
            <fieldset className="mt-4 space-y-2">
              <legend className="text-sm mb-2">
                Event access — leave all unchecked for all events
              </legend>
              {events.map((item) => (
                <label key={item.id} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="event_ids"
                    value={item.id}
                    checked={access.includes(item.id)}
                    onChange={(e) =>
                      setAccess((current) =>
                        e.target.checked
                          ? [...current, item.id]
                          : current.filter((id) => id !== item.id),
                      )
                    }
                  />
                  {item.title}
                </label>
              ))}
            </fieldset>
          )}
        </details>
        {guest && (
          <section className="guest-form-details">
            <h3 className="text-sm font-semibold">RSVP response</h3>
            <p className="text-xs text-muted mt-1 mb-4">
              Replies update automatically. Change this only when recording a
              reply on the guest’s behalf.
            </p>
            <div className="form-grid">
              <label className="field">
                Response
                <select
                  className="input"
                  name="rsvp_status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RsvpStatus)}
                >
                  <option value="pending">Awaiting reply</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Can’t attend</option>
                </select>
              </label>
              {status === "attending" && (
                <label className="field">
                  People attending *
                  <input
                    className="input"
                    name="rsvp_attending_count"
                    type="number"
                    min={1}
                    max={total || 1}
                    step={1}
                    required
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  />
                  <span className="text-xs">
                    Includes the main invitee. Maximum {total || 1}.
                  </span>
                </label>
              )}
              <label className="field">
                Dietary requirements
                <textarea
                  className="input"
                  name="dietary"
                  maxLength={500}
                  defaultValue={guest.dietary ?? ""}
                />
              </label>
            </div>
            {eventRsvp && (
              <fieldset className="mt-4 space-y-2">
                <legend className="text-sm font-semibold">
                  Event attendance
                </legend>
                <p className="text-xs text-muted">
                  Event access above controls who is invited. These choices
                  record the guest’s reply. Changing only contact details leaves
                  pending event replies unchanged.
                </p>
                {status === "attending" ? (
                  permittedEvents(events, access).map((e) => (
                    <label className="flex gap-2 text-sm" key={e.id}>
                      <input
                        type="checkbox"
                        name="selected_events"
                        value={e.id}
                        checked={choices.includes(e.id)}
                        onChange={(change) => {
                          setReplyEdited(true);
                          setChoices((current) =>
                            change.target.checked
                              ? [...current, e.id]
                              : current.filter((id) => id !== e.id),
                          );
                        }}
                      />
                      {e.title}
                      {!replyEdited &&
                      !eventResponseMap(guest.event_responses)[e.id]
                        ? " — awaiting event choice"
                        : ""}
                    </label>
                  ))
                ) : (
                  <p className="text-sm">
                    {status === "pending"
                      ? "Awaiting a reply; no events are confirmed."
                      : "Not attending any invited event."}
                  </p>
                )}
                {status === "attending" && (
                  <p className="text-xs text-muted">
                    One people count applies to every selected event. Submitting
                    new event choices marks unchecked events as not attending.
                  </p>
                )}
              </fieldset>
            )}
            {guest.rsvp_message && (
              <p className="notice mt-3">
                Guest’s message: {guest.rsvp_message}
              </p>
            )}
          </section>
        )}
        {error && (
          <p role="alert" className="notice notice-error">
            {error}
          </p>
        )}
        <div className="guest-form-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="btn btn-secondary" type="submit" value="save">
            {pending ? "Saving…" : "Save guest"}
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            value="prepare"
            disabled={pending}
          >
            Save & prepare invitation
          </button>
        </div>
      </fieldset>
    </form>
  );
}
