"use client";
import { useActionState, useState, useEffect } from "react";
import { submitRsvp, type RsvpResult } from "@/app/i/[slug]/actions";
import type { GuestContext } from "@/lib/supabase/types";
export function ClassicRsvp({
  slug,
  published,
  guest,
  token = "",
  preview = false,
  closed = false,
  deadline = "",
  wishes = true,
}: {
  slug: string;
  published: boolean;
  guest?: GuestContext | null;
  token?: string;
  preview?: boolean;
  closed?: boolean;
  deadline?: string;
  wishes?: boolean;
}) {
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const update = () =>
      setExpired(!!deadline && Date.now() > Date.parse(deadline));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [deadline]);
  const [state, action, pending] = useActionState<RsvpResult | null, FormData>(
    submitRsvp,
    null,
  );
  const [attending, setAttending] = useState(
    guest?.rsvp_status === "declined" ? "no" : "yes",
  );
  const [attendingCount, setAttendingCount] = useState(String(guest?.rsvp_attending_count || 1));
  if (preview)
    return (
      <div className="confirmation">
        <h3>A personal reply, just for you.</h3>
        <p>
          Guests will see their names, allocated seats and response here.
          Submissions are disabled in preview.
        </p>
      </div>
    );
  if (!published || closed || expired)
    return (
      <p className="rsvp-note">
        {closed || expired
          ? "RSVP is now closed. Please contact the couple if your plans change."
          : "RSVP will open soon."}
      </p>
    );
  if (!guest)
    return (
      <p className="rsvp-note">
        Please open the personal invitation link sent to you to reply. If you
        need a new link, contact the couple.
      </p>
    );
  return (
    <form action={action} onReset={(event) => event.preventDefault()}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="token" value={token} />
      <p className="rsvp-note">
        Dear {guest.name}, we have reserved {guest.invited_count}{" "}
        {guest.invited_count === 1 ? "seat" : "seats"} for you.
        {guest.rsvp_status !== "pending"
          ? " Your reply is saved; you can update it below."
          : ""}
      </p>
      {state?.ok && (
        <p role="status" className="confirmation">
          Thank you. Your reply has been saved.
        </p>
      )}
      <div className="form-row">
        <label>
          Will you join us?
          <select
            name="attending"
            value={attending}
            onChange={(e) => setAttending(e.target.value)}
          >
            <option value="yes">Yes, I’ll attend</option>
            <option value="no">Sorry, I can’t attend</option>
          </select>
        </label>
        {attending === "yes" && (
          <label>
            How many people are coming, including you?
            <select
              name="attending_count"
              value={attendingCount}
              onChange={(event) => setAttendingCount(event.target.value)}
            >
              {Array.from({ length: guest.invited_count }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i === 0 ? "Just me (1 person)" : `Me +${i} (${i + 1} people total)`}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {attending === "yes" && (
        <label>
          Dietary requirements (optional)
          <textarea
            name="dietary"
            defaultValue={guest.dietary ?? ""}
            maxLength={500}
            rows={2}
          />
        </label>
      )}
      {wishes && (
        <label>
          A wish or message for the couple (optional)
          <textarea
            name="message"
            defaultValue={guest.rsvp_message ?? ""}
            maxLength={1000}
            rows={4}
          />
        </label>
      )}
      {state?.ok === false && (
        <p role="alert" className="rsvp-error">
          {state.error}
        </p>
      )}
      <button className="submit-button" disabled={pending}>
        {pending
          ? "Saving your reply…"
          : guest.rsvp_status === "pending"
            ? "Send your RSVP →"
            : "Update your RSVP →"}
      </button>
    </form>
  );
}
