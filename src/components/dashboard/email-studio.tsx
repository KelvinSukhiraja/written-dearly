"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendInvitationEmail } from "@/app/dashboard/email-actions";
import { invitationEmail } from "@/lib/email/template";
import { coupleNames, formatInviteDate } from "@/lib/invitations/display";
import { Dialog } from "@/components/ui/dialog";
import type { Guest, Invitation } from "@/lib/supabase/types";
type Delivery = {
  guest_id: string;
  status: string;
  error: string | null;
  updated_at: string;
};
export function EmailStudio({
  guests,
  invitation,
  deliveries,
  configured,
  accountEmail,
}: {
  guests: Guest[];
  invitation: Invitation;
  deliveries: Delivery[];
  configured: boolean;
  accountEmail: string;
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [query, setQuery] = useState(""),
    [preview, setPreview] = useState<Guest | null>(null),
    [confirm, setConfirm] = useState(false),
    [messages, setMessages] = useState<string[]>([]),
    [pending, start] = useTransition();
  const router = useRouter();
  const status = (id: string) => deliveries.find((d) => d.guest_id === id);
  const eligible = (g: Guest) =>
    !!g.email && (!status(g.id) || status(g.id)?.status === "failed");
  const visible = guests.filter(
    (g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.email?.includes(query),
  );
  function send(test = false, id?: string) {
    setConfirm(false);
    start(async () => {
      setMessages([]);
      for (const guestId of id ? [id] : selected) {
        try {
          const result = await sendInvitationEmail(guestId, test);
          setMessages((v) => [
            ...v,
            `${guests.find((g) => g.id === guestId)?.name}: ${result.ok ? result.message : result.error}`,
          ]);
          if (!result.ok) break;
        } catch {
          setMessages((v) => [
            ...v,
            "Connection interrupted. Refresh status before sending again.",
          ]);
          break;
        }
      }
      setSelected([]);
      router.refresh();
    });
  }
  return (
    <div className="space-y-5">
      {!configured && (
        <p className="notice">
          Email sending is not connected yet. Your administrator needs to
          configure a verified sender and email tracking. You can preview the
          email below.
        </p>
      )}
      <p className="text-sm text-muted">
        “Accepted” means the provider took the email, not that it reached an
        inbox. Delivery and bounce confirmation require your provider’s event
        integration. Unknown outcomes are held to prevent duplicate sends.
      </p>
      <div className="flex flex-wrap gap-3">
        <input
          className="input flex-1"
          aria-label="Search email recipients"
          placeholder="Search recipients"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="btn btn-secondary"
          onClick={() =>
            setSelected(
              visible
                .filter(eligible)
                .slice(0, 20)
                .map((g) => g.id),
            )
          }
        >
          Select up to 20 unsent
        </button>
        <button
          className="btn btn-primary"
          disabled={!configured || pending || !selected.length}
          onClick={() => setConfirm(true)}
        >
          {pending ? "Sending…" : `Send ${selected.length || ""} invitations`}
        </button>
      </div>
      <div className="guest-list">
        {visible.map((g) => (
          <div className="card guest-row" key={g.id}>
            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selected.includes(g.id)}
                disabled={!eligible(g) || pending}
                onChange={(e) =>
                  setSelected((v) =>
                    e.target.checked
                      ? [...v, g.id].slice(0, 20)
                      : v.filter((id) => id !== g.id),
                  )
                }
              />
              <span>
                {g.name}
                <span className="block text-xs text-muted mt-1">
                  {g.email || "No email address"}
                </span>
              </span>
            </label>
            <div className="row-meta">
              <span className="text-sm">
                {status(g.id)?.status || "Not sent"}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPreview(g)}
              >
                Preview email
              </button>
              {status(g.id)?.error && (
                <p className="text-xs max-w-xs">{status(g.id)?.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {!guests.length && (
        <div className="card empty-state">
          <h2>Start with your guest list</h2>
          <p>Add parties and email addresses in Guests & RSVP.</p>
        </div>
      )}
      <div aria-live="polite">
        {messages.map((m, i) => (
          <p className="notice mt-2" key={i}>
            {m}
          </p>
        ))}
      </div>
      {preview && (
        <Dialog title="Email preview" onClose={() => setPreview(null)}>
          <iframe
            title="Personal invitation email"
            sandbox=""
            srcDoc={
              invitationEmail({
                name: preview.name,
                couple: coupleNames(invitation),
                date: formatInviteDate(invitation.wedding_date) ?? "",
                url: "https://example.invalid/invitation-preview",
              }).html
            }
            className="w-full h-[55dvh] border-0"
          />
          <p className="text-xs text-muted my-4">
            Test emails go only to {accountEmail}. They do not update the
            guest’s send status.
          </p>
          <button
            className="btn btn-primary"
            disabled={!configured || pending}
            onClick={() => send(true, preview.id)}
          >
            Send test to me
          </button>
        </Dialog>
      )}
      {confirm && (
        <Dialog
          title="Send these invitations?"
          onClose={() => setConfirm(false)}
        >
          <p className="mb-6">
            Send a personalized email to {selected.length} selected parties.
            Sending stops on the first failure so you can review the result.
          </p>
          <button
            className="btn btn-primary"
            disabled={pending}
            onClick={() => send()}
          >
            Send invitations now
          </button>
        </Dialog>
      )}
    </div>
  );
}
