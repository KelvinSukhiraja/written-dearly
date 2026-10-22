"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useState, useTransition } from "react";
import { markInvitationSent } from "@/app/dashboard/guest-actions";
import type { Guest } from "@/lib/supabase/types";
import { Dialog } from "@/components/ui/dialog";
import { ReceptionPass } from "@/components/templates/reception-pass";
import { WhatsAppApi } from "./whatsapp-api";
import {
  invitationLink,
  publicShareOrigin,
  whatsappUrl,
} from "@/lib/guests/whatsapp";

export function WhatsAppShare({
  guest,
  slug,
  coupleName,
  published,
  onClose,
  onEdit,
  onUpdated,
}: {
  guest: Guest;
  slug: string;
  coupleName: string;
  published: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onUpdated?: (guest: Guest) => void;
}) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const [mode, setMode] = useState<"invitation" | "pass">("invitation");
  const [feedback, setFeedback] = useState("");
  const [apiRequested, setApiRequested] = useState(false);
  const [apiPending, setApiPending] = useState(false);
  const [pending, start] = useTransition();
  const canPass =
    guest.rsvp_status === "attending" &&
    !!guest.checkin_token &&
    (guest.rsvp_attending_count ?? 0) > 0;
  const link =
    origin && guest.public_token
      ? invitationLink(origin, slug, guest.public_token, mode === "pass")
      : "";
  const text =
    mode === "invitation"
      ? `Hi ${guest.name}, we'd love you to celebrate our wedding with us!\n\n${coupleName}\nWe've reserved ${guest.invited_count} ${guest.invited_count === 1 ? "place" : "places"} for your invitation. Please open your personal link for the details and RSVP:\n${link}\n\nWe hope to see you there!`
      : `Hi ${guest.name}, we're looking forward to seeing you at our wedding!\n\n${coupleName}\nYour RSVP is for ${guest.rsvp_attending_count} ${guest.rsvp_attending_count === 1 ? "person" : "people"}. Open your QR pass below and show it when you arrive. If your plans have changed, you can update your RSVP using the same invitation.\n${link}`;
  const [edited, setEdited] = useState<string | null>(null);
  const message = edited ?? text;
  const href = whatsappUrl(guest.phone ?? "", message);
  const publicOrigin = !!origin && publicShareOrigin(origin);
  const issue = !published
    ? "Publish your invitation before sharing it."
    : !guest.public_token
      ? "A personal link is not available for this guest yet."
      : !publicOrigin
        ? "This is a local preview. Share invitations from your published HTTPS website so guests can open them."
        : !href
          ? "Add a WhatsApp number with its country code in guest details, for example +62 812 3456 7890."
          : "";
  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Message copied. It has not been sent.");
    } catch {
      setFeedback("Could not copy. Select and copy the message below.");
    }
  }
  return (
    <Dialog title={`Prepare invitation · ${guest.name}`} onClose={() => { if (!pending && !apiPending) onClose(); }}>
      <div className="space-y-5">
        <div className="tab-bar" aria-label="Message type">
          <button
            type="button"
            aria-pressed={mode === "invitation"}
            disabled={apiPending}
            onClick={() => {
              setMode("invitation");
              setEdited(null);
              setFeedback("");
            }}
          >
            Invitation
          </button>
          <button
            type="button"
            aria-pressed={mode === "pass"}
            disabled={!canPass || apiPending}
            onClick={() => {
              setMode("pass");
              setEdited(null);
              setFeedback("");
            }}
          >
            Wedding-day QR
          </button>
        </div>
        {!canPass && (
          <p className="text-sm text-muted">
            The wedding-day message becomes available after this guest confirms
            attendance and has a QR pass.
          </p>
        )}
        <p className="text-sm text-muted">
          To: {guest.phone || "No phone number saved"}. Review the message, then
          send it in WhatsApp.
        </p>
        <h3 className="font-semibold">Share manually</h3>
        <label className="field">
          Message
          <textarea
            rows={9}
            className="input"
            value={message}
            onChange={(e) => setEdited(e.target.value)}
          />
        </label>
        {issue && (
          <p className="notice" role="status">
            {issue}
          </p>
        )}
        {issue && <div className="flex gap-3">
          {!published && <a className="btn btn-secondary" href="/dashboard/invitation">Review & publish invitation</a>}
          {!href && onEdit && <button type="button" className="btn btn-secondary" onClick={onEdit}>Fix WhatsApp number</button>}
        </div>}
        {mode === "pass" && (
          <div className="border-t border-border pt-5">
            <p className="text-sm text-muted mb-4">
              Download the QR image below and attach it to the WhatsApp message.
              The message also includes a link to the pass.
            </p>
            <ReceptionPass
              token={guest.checkin_token}
              name={guest.name}
              table={guest.table_name}
            />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {!issue && href && message.trim() && !apiPending ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() =>
                setFeedback(
                  "Continue in WhatsApp to send. Delivery is not tracked here.",
                )
              }
            >
              Open WhatsApp <ArrowIcon direction="up-right" />
            </a>
          ) : (
            <button className="btn btn-primary" disabled>
              Open WhatsApp
            </button>
          )}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => void copy()}
            disabled={!!issue || !message.trim()}
          >
            Copy message
          </button>
        </div>
        <p className="text-xs text-muted">
          Opening WhatsApp does not send a message automatically.
        </p>
        {mode === "invitation" && onUpdated && <div className="guest-form-details space-y-3">
          <p className="text-sm">{guest.invitation_sent_at ? "You marked this invitation as sent. Delivery is not verified." : "After sending in WhatsApp, mark this invitation as sent to keep track of your list."}</p>
          <button type="button" className="btn btn-secondary" disabled={pending || apiPending || (!guest.invitation_sent_at && !!issue)} onClick={() => start(async () => {
            try {
              const result = await markInvitationSent(guest.id, guest.version, !guest.invitation_sent_at);
              if (!result.ok || !result.guest) { setFeedback(result.error ?? "Could not save status."); return; }
              onUpdated(result.guest);
              setFeedback(result.guest.invitation_sent_at ? "Marked as sent by you. Delivery is not tracked." : "Sent marker removed.");
            } catch { setFeedback("Status could not be confirmed. Refresh before trying again."); }
          })}>{pending ? "Saving…" : guest.invitation_sent_at ? "Undo sent marker" : "I sent it — mark as sent"}</button>
        </div>}
        {feedback && (
          <p role="status" className="notice">
            {feedback}
          </p>
        )}
        {mode === "invitation" && (apiRequested ? <WhatsAppApi guestId={guest.id} onBusyChange={setApiPending} /> :
          <button type="button" className="btn btn-secondary" onClick={() => setApiRequested(true)}>Use WhatsApp Business API</button>)}
      </div>
    </Dialog>
  );
}
