"use client";
import { ArrowIcon } from "@/components/arrow-icon";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addGuest, deleteGuest, importGuests, type ActionResult } from "@/app/dashboard/actions";
import { saveGuest } from "@/app/dashboard/guest-actions";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";
import { GuestForm } from "./guest-form";
import { parseGuestCsv } from "@/lib/guests/csv";
import { WhatsAppShare } from "./whatsapp-share";
import { guestSummary, arrivedCount } from "@/lib/guests/summary";
import type { Guest } from "@/lib/supabase/types";
import type { InvitationEvent } from "@/lib/invitations/theme";

type ImportRows = ReturnType<typeof parseGuestCsv>;
export function GuestsTable({ guests, slug = "", events = [], published = false, coupleName = "Our wedding", setupIssue = "" }: {
  guests: Guest[]; slug?: string; events?: InvitationEvent[]; published?: boolean; coupleName?: string; setupIssue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [delivery, setDelivery] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [editing, setEditing] = useState<Guest | "new" | null>(null);
  const [sharing, setSharing] = useState<Guest | null>(null);
  const [removing, setRemoving] = useState<Guest | null>(null);
  const [importing, setImporting] = useState<ImportRows | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const filtered = useMemo(() => guests.filter((g) => {
    const term = query.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    return (status === "all" || g.rsvp_status === status)
      && (delivery === "all" || (delivery === "sent" ? !!g.invitation_sent_at : !g.invitation_sent_at))
      && ([g.name, g.group, g.phone, g.email, g.table_name].some((v) => v?.toLowerCase().includes(term))
        || (!!digits && !/[a-z]/i.test(term) && !!g.phone?.replace(/\D/g, "").includes(digits)));
  }).sort((a, b) => sort === "name-desc" ? b.name.localeCompare(a.name) : sort === "size" ? b.invited_count - a.invited_count : a.name.localeCompare(b.name)), [guests, query, status, delivery, sort]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const totals = guestSummary(guests);
  const edit = editing && editing !== "new" ? editing : null;
  function openEditor(guest: Guest | "new") { setError(""); setMessage(""); setEditing(guest); }
  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setError("");
    start(async () => {
      try {
        const result = await action();
        if (!result.ok) { setError(result.error ?? "Please try again."); return; }
        setMessage(success); setRemoving(null); setImporting(null); router.refresh();
      } catch { setError("Your change could not be confirmed. Refresh before trying again."); }
    });
  }
  function save(form: FormData, prepare: boolean) {
    setError("");
    start(async () => {
      try {
        const result = (edit ? await saveGuest(edit.id, form) : await addGuest(null, form)) as ActionResult;
        if (!result.ok) { setError(result.error); return; }
        setEditing(null); setMessage(edit ? "Guest updated." : "Guest added."); router.refresh();
        if (prepare && result.guest) setSharing(result.guest);
      } catch { setError("Your save could not be confirmed. Keep these details and refresh before trying again."); }
    });
  }
  const actions = (g: Guest) => <div className="guest-actions">
    <button className="btn btn-secondary" disabled={!!setupIssue} onClick={() => openEditor(g)} aria-label={`Edit ${g.name}`}>Edit</button>
    <button className="btn btn-primary" disabled={!!setupIssue} onClick={() => { setError(""); setSharing(g); }} aria-label={`Prepare invitation for ${g.name}`}>Invite</button>
  </div>;
  return <div className="space-y-5">
    <dl className="workspace-metrics grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[[ "People invited", totals.reserved ], [ "People attending", totals.confirmed ], [ "Invitations awaiting reply", totals.pending ], [ "People checked in", totals.arrived ]].map(([label, value]) =>
        <div className="card p-4" key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-2 text-2xl font-semibold">{value}</dd></div>)}
    </dl>
    {setupIssue && <p className="notice notice-error" role="alert">{setupIssue}</p>}
    {!published && <div className="notice">Your invitation is a draft. You can prepare your guest list now. <a className="underline" href="/dashboard/invitation">Review and publish your invitation <ArrowIcon /></a></div>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold">Guest list</h2><p className="text-sm text-muted">{guests.length} invitations · One row per guest or family</p></div>
      <div className="flex gap-2">
        <label className="btn btn-secondary" aria-disabled={pending || !!setupIssue}>Import CSV
          <input className="sr-only" type="file" accept=".csv" disabled={pending || !!setupIssue} onChange={async (event) => {
            const input = event.currentTarget;
            const file = input.files?.[0]; if (!file) return;
            setError(""); setMessage("");
            try {
              if (file.size > 1024 * 1024) throw new Error("Please keep CSV files under 1 MB.");
              const rows = parseGuestCsv(await file.text());
              if (!rows.length || rows.length > 500) throw new Error("Import between 1 and 500 invitations at a time.");
              setImporting(rows);
            } catch (e) { setError(e instanceof Error ? e.message : "Could not read that file."); }
            input.value = "";
          }} />
        </label>
        <button className="btn btn-primary" disabled={pending || !!setupIssue} onClick={() => openEditor("new")}>+ Add guest</button>
      </div>
    </div>
    <div className="guest-toolbar">
      <label className="field">Search<input className="input" type="search" placeholder="Name, WhatsApp number or group" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} /></label>
      <label className="field">RSVP<select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
        <option value="all">All responses</option><option value="pending">Awaiting reply</option><option value="attending">Attending</option><option value="declined">Can’t attend</option>
      </select></label>
      <label className="field">Invitation<select className="input" value={delivery} onChange={(e) => { setDelivery(e.target.value); setPage(0); }}>
        <option value="all">All invitations</option><option value="unsent">Not marked sent</option><option value="sent">Marked sent</option>
      </select></label>
      <label className="field">Sort<select className="input" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}>
        <option value="name">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="size">Largest groups first</option>
      </select></label>
    </div>
    {message && <p className="notice" role="status">{message}</p>}
    {error && !editing && !removing && !importing && <p className="notice notice-error" role="alert">{error}</p>}
    {visible.length ? <>
      <div className="guest-table-wrap">
        <table className="guest-table">
          <caption className="sr-only">Guest invitations, RSVP responses and attendance</caption>
          <thead><tr>{["Guest / family", "WhatsApp", "Invitation", "RSVP", "Invited", "Attending", "Actions"].map((title) => <th scope="col" key={title}>{title}</th>)}</tr></thead>
          <tbody>{visible.map((g) => <tr key={g.id}>
            <th scope="row"><span className="guest-name">{g.name}</span><span className="guest-subline">{[g.side === "bride" ? "Bride" : "Groom", g.group, g.table_name && `Table ${g.table_name}`].filter(Boolean).join(" · ")}</span></th>
            <td className="whitespace-nowrap">{g.phone || <span className="text-muted">Missing number</span>}</td>
            <td><span className={g.invitation_sent_at ? "text-emerald-800" : "text-muted"}>{g.invitation_sent_at ? "Marked sent" : "Not marked sent"}</span></td>
            <td><StatusBadge status={g.rsvp_status} /></td>
            <td className="guest-count">{g.invited_count}</td><td className="guest-count">{g.rsvp_attending_count ?? "—"}</td>
            <td>{actions(g)}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="guest-mobile-list">{visible.map((g) => <article className="card p-4 space-y-3" key={g.id}>
        <div className="flex justify-between gap-3"><h3 className="font-semibold break-words">{g.name}</h3><StatusBadge status={g.rsvp_status} /></div>
        <p className="text-sm text-muted">{g.phone || "Missing WhatsApp number"}</p>
        <p className="text-xs text-muted">{g.invited_count} invited · {g.rsvp_attending_count ?? "—"} attending · {arrivedCount(g)} checked in</p>
        <div className="flex justify-between items-center gap-2"><span className="text-xs">{g.invitation_sent_at ? "Marked sent" : "Not marked sent"}</span>{actions(g)}</div>
      </article>)}</div>
    </> : <div className="card empty-state"><h2>{guests.length ? "No matching guests" : "Add your first guest"}</h2><p>{guests.length ? "Try another search or filter." : "Start with their name, WhatsApp number and companion allowance."}</p></div>}
    <div className="guest-pagination">
      <label className="flex items-center gap-2 text-sm">Rows per page<select className="input !w-auto" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>{[25, 50, 100].map(n => <option key={n}>{n}</option>)}</select></label>
      <span className="text-sm text-muted">{filtered.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}</span>
      <div className="flex gap-2"><button className="btn btn-secondary" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous</button><button className="btn btn-secondary" disabled={(currentPage + 1) * pageSize >= filtered.length} onClick={() => setPage(currentPage + 1)}>Next</button></div>
    </div>
    <details className="text-xs text-muted"><summary className="cursor-pointer">CSV import guide</summary><p className="mt-2">Required columns: name, side (bride/groom), phone (with country code). Other columns: email, group, invited_count. invited_count is the total including the main guest: 3 means invitee +2. Review the preview before importing. Up to 500 invitations per file.</p></details>
    {editing && <Dialog title={edit ? "Edit guest" : "Add guest"} onClose={() => { if (!pending) setEditing(null); }}>
      <GuestForm key={edit?.id ?? "new"} guest={edit} events={events} pending={pending} error={error} onSave={save} onCancel={() => setEditing(null)} />
      {edit && <div className="border-t border-border mt-5 pt-4"><button className="text-sm text-red-700 underline" disabled={pending} onClick={() => { setEditing(null); setRemoving(edit); setError(""); }}>Remove guest</button></div>}
    </Dialog>}
    {sharing && <WhatsAppShare key={sharing.id} guest={sharing} slug={slug} published={published} coupleName={coupleName} onClose={() => setSharing(null)} onEdit={() => { openEditor(sharing); setSharing(null); }} onUpdated={(g) => { setSharing(g); router.refresh(); }} />}
    {removing && <Dialog title="Remove guest?" onClose={() => { if (!pending) setRemoving(null); }}>
      <p className="mb-5">Remove {removing.name}, their RSVP and reception pass? This cannot be undone.</p>
      {error && <p role="alert" className="notice notice-error mb-4">{error}</p>}
      <div className="flex gap-3"><button className="btn btn-secondary" disabled={pending} onClick={() => setRemoving(null)}>Cancel</button><button className="btn btn-primary" disabled={pending} onClick={() => run(() => deleteGuest(removing.id), "Guest removed.")}>{pending ? "Removing…" : "Remove guest"}</button></div>
    </Dialog>}
    {importing && <Dialog title="Review CSV import" onClose={() => { if (!pending) setImporting(null); }}>
      <p className="text-sm mb-4">{importing.length} invitations · {importing.reduce((n, g) => n + g.invited_count, 0)} people invited. Importing adds new records; it does not update existing guests.</p>
      <div className="max-h-64 overflow-auto border border-border rounded-lg mb-4">{importing.map((row, index) => <div key={index} className="p-3 border-b border-border text-sm"><strong>{row.name}</strong> · {row.phone} · {row.invited_count} invited</div>)}</div>
      <p className="text-sm text-muted mb-4">Check for duplicates before continuing.</p>
      {error && <p role="alert" className="notice notice-error mb-4">{error}</p>}
      <div className="flex gap-3"><button className="btn btn-secondary" disabled={pending} onClick={() => setImporting(null)}>Cancel</button><button className="btn btn-primary" disabled={pending} onClick={() => run(() => importGuests(importing), `Imported ${importing.length} invitations.`)}>{pending ? "Importing…" : "Import invitations"}</button></div>
    </Dialog>}
  </div>;
}

