"use client";
import { useEffect, useState, useTransition } from "react";
import { prepareWhatsAppApi, sendWhatsAppInvitation } from "@/app/dashboard/whatsapp-actions";
import { TEMPLATE_BODY } from "@/lib/whatsapp/template";

type Preview = Awaited<ReturnType<typeof prepareWhatsAppApi>>;
const labels = { sending: "Send reserved — awaiting confirmation", unknown: "Outcome unknown — do not resend", accepted: "Accepted by WhatsApp", sent: "Sent by WhatsApp", delivered: "Delivered", read: "Read", failed: "Failed" };
export function WhatsAppApi({ guestId, onBusyChange }: { guestId: string; onBusyChange: (busy: boolean) => void }) {
  const [data, setData] = useState<Preview | null>(null);
  const [consent, setConsent] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pending, start] = useTransition();
  useEffect(() => { onBusyChange(pending); return () => onBusyChange(false); }, [pending, onBusyChange]);
  useEffect(() => {
    let active = true;
    prepareWhatsAppApi(guestId).then(value => { if (active) setData(value); })
      .catch(() => { if (active) setFeedback("Could not load Business API setup. Refresh to try again."); });
    return () => { active = false; };
  }, [guestId]);
  function refresh() {
    start(async () => {
      try { setData(await prepareWhatsAppApi(guestId)); setConsent(false); setFeedback(""); }
      catch { setFeedback("Could not refresh delivery status. Do not resend an uncertain attempt."); }
    });
  }
  return <section className="guest-form-details space-y-3" aria-label="WhatsApp Business API">
    <h3 className="font-semibold">Send with WhatsApp Business</h3>
    <p className="text-sm text-muted">Send the approved invitation template directly from your business number.</p>
    {!data && !feedback && <p role="status">Loading delivery setup…</p>}
    {data?.issue && <p className="notice" role="status">{data.issue}</p>}
    {data?.preview ? <>
      <p className="text-sm">To: {data.recipient} · Template: {data.template}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{data.preview}</p>
    </> : data && <p className="text-sm text-muted">Proposed template: {TEMPLATE_BODY}</p>}
    {data?.delivery ? <>
      <p role="status" className="notice">{labels[data.delivery.status]}</p>
      <p className="text-xs text-muted">One API attempt is allowed per guest. Check Meta before any further send. Manual sent markers are separate.</p>
    </> : data && !data.issue && <>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} disabled={pending} onChange={e => setConsent(e.target.checked)} />This recipient agreed to receive this wedding invitation on WhatsApp.</label>
      <button type="button" className="btn btn-primary" disabled={pending || !consent} onClick={() => start(async () => {
        try {
          const result = await sendWhatsAppInvitation(guestId, data.version, data.preview, consent);
          setFeedback(result.message);
          // Remove the send control before refreshing; an unavailable status must not invite a duplicate.
          setData(null); setConsent(false);
          setData(await prepareWhatsAppApi(guestId));
        } catch { setData(null); setConsent(false); setFeedback("Sending could not be confirmed. Refresh status before continuing; do not resend."); }
      })}>{pending ? "Sending…" : "Send invitation via Business API"}</button>
    </>}
    <button type="button" className="btn btn-secondary" disabled={pending} onClick={refresh}>{pending ? "Please wait…" : "Refresh API status"}</button>
    {feedback && <p role="status" className="notice">{feedback}</p>}
  </section>;
}
