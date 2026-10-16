"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  confirmArrival,
  findReceptionGuest,
} from "@/app/dashboard/guest-actions";
import { QrScanner } from "./qr-scanner";
import { Dialog } from "@/components/ui/dialog";
import type { Guest } from "@/lib/supabase/types";
import {
  guestSummary,
  arrivedCount,
  confirmedCount,
} from "@/lib/guests/summary";
export function CheckInView({ guests }: { guests: Guest[] }) {
  const router = useRouter();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [scanning, setScanning] = useState(false),
    [selected, setSelected] = useState<Guest | null>(null),
    [count, setCount] = useState(0),
    [extra, setExtra] = useState(0),
    [note, setNote] = useState(""),
    [message, setMessage] = useState(""),
    [online, setOnline] = useState(true),
    [pending, start] = useTransition();
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const timer = setInterval(() => {
      if (navigator.onLine && !document.hidden) router.refresh();
    }, 15000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [router]);
  function choose(g: Guest) {
    setSelected(g);
    setCount(arrivedCount(g) > 0 ? arrivedCount(g) : confirmedCount(g));
    setExtra(g.extra_seats || 0);
    setNote(g.staff_notes || "");
    setMessage("");
  }
  function scan(value: string) {
    setScanning(false);
    start(async () => {
      try {
        const result = await findReceptionGuest(value);
        if (result.ok && result.guest) choose(result.guest);
        else setMessage(result.error ?? "Code not recognised.");
      } catch {
        setMessage(
          "Could not look up this code. Check your connection or search by name.",
        );
      }
    });
  }
  const totals = guestSummary(guests);
  const matches = guests
    .filter(
      (g) =>
        (filter === "all" ||
          (filter === "arrived" && arrivedCount(g) > 0) ||
          (filter === "expected" && confirmedCount(g) > arrivedCount(g))) &&
        [g.name, g.group, g.table_name, g.phone].some((v) =>
          v?.toLowerCase().includes(query.toLowerCase()),
        ),
    )
    .slice(0, 40);
  function save(value = count) {
    if (!selected || !online || pending) return;
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      !Number.isInteger(extra) ||
      extra < 0 ||
      value > selected.invited_count + extra
    ) {
      setMessage(
        "Enter a whole number within this invitation's reserved places.",
      );
      return;
    }
    start(async () => {
      try {
        const result = await confirmArrival(
          selected.id,
          selected.version,
          value,
          extra,
          note,
        );
        if (!result.ok) setMessage(result.error ?? "Could not save.");
        else {
          setMessage(
            value === 0
              ? "Arrival undone."
              : `${value} people checked in for ${selected.name}.`,
          );
          setSelected(null);
          router.refresh();
        }
      } catch {
        setMessage(
          "Connection interrupted. Arrival is not confirmed. Refresh before retrying.",
        );
      }
    });
  }
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="studio-hero flex flex-wrap gap-5 justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Wedding-day arrivals</h2>
          <p className="mt-2 text-sm text-muted">
            Find the invitation, confirm the group, then check them in.
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!online || pending}
          onClick={() => setScanning((v) => !v)}
        >
          ▣ Scan QR code
        </button>
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["RSVP confirmed", totals.confirmed],
          ["Checked in", totals.arrived],
          ["Still expected", totals.remaining],
        ].map(([label, value]) => (
          <div className="card p-4" key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="stat-number mt-2">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted">
        Totals count people, including companions. Still expected means
        confirmed guests who have not checked in. Departures are not tracked.
      </p>
      {!online && (
        <p className="notice notice-error" role="alert">
          You’re offline. The loaded guest list is available for lookup, but
          arrivals cannot be confirmed until the connection returns. Keep a
          written record if needed; refresh before updating.
        </p>
      )}
      {scanning && (
        <QrScanner onScan={scan} onClose={() => setScanning(false)} />
      )}
      <label className="field">
        Find a guest or party
        <input
          className="input text-lg py-4"
          type="search"
          placeholder="Name, family, table or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </label>
      <div className="flex flex-wrap gap-2" aria-label="Arrival filters">
        {[
          ["all", "All guests"],
          ["expected", "Still expected"],
          ["arrived", "Checked in"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`btn ${filter === value ? "btn-primary" : "btn-secondary"}`}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
        <button
          className="btn btn-secondary"
          disabled={!online || pending}
          onClick={() => router.refresh()}
        >
          Refresh
        </button>
      </div>
      <details className="text-sm text-muted">
        <summary>Enter a reception code manually</summary>
        <form
          className="flex gap-2 mt-3"
          action={(form) => scan(String(form.get("code")))}
        >
          <input
            name="code"
            className="input"
            placeholder="Paste reception code"
            aria-label="Reception code"
          />
          <button className="btn btn-secondary" disabled={!online || pending}>
            Find
          </button>
        </form>
      </details>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <div className="guest-list">
        {matches.map((g) => (
          <button
            key={g.id}
            className="card guest-row text-left w-full"
            onClick={() => choose(g)}
          >
            <div>
              <h3>{g.name}</h3>
              <p>
                {g.invited_count} places reserved ·{" "}
                {g.rsvp_attending_count ?? "—"} attending
                {g.table_name ? ` · Table ${g.table_name}` : ""}
              </p>
            </div>
            <span
              className={
                g.checked_in
                  ? "rounded-full bg-blue-50 px-4 py-2 text-sm"
                  : "rounded-full bg-surface px-4 py-2 text-sm"
              }
            >
              {g.checked_in
                ? `${arrivedCount(g)} checked in ✓`
                : g.rsvp_status === "attending"
                  ? "Awaiting arrival →"
                  : g.rsvp_status === "declined"
                    ? "Not attending"
                    : "RSVP pending"}
            </span>
          </button>
        ))}
      </div>
      {!matches.length && (
        <div className="empty-state card">
          <h2>No matching party</h2>
          <p>
            Try their family name or phone number. New parties can be added in
            Guests & RSVP.
          </p>
        </div>
      )}
      {matches.length === 40 && (
        <p className="text-sm text-muted">
          Showing 40 matches. Search to narrow the list.
        </p>
      )}
      {selected && (
        <Dialog title={selected.name} onClose={() => setSelected(null)}>
          <div className="space-y-5">
            {selected.checked_in && (
              <p className="notice">
                Already checked in: {selected.checked_in_count} people
                {selected.checked_in_at
                  ? " · " +
                    new Date(selected.checked_in_at).toLocaleTimeString()
                  : ""}
                . Confirm the total, including earlier arrivals.
              </p>
            )}
            {selected.rsvp_status !== "attending" && (
              <p className="notice">
                This guest{" "}
                {selected.rsvp_status === "declined"
                  ? "declined the invitation"
                  : "has not replied"}
                . Confirm their attendance in person before entering an arrival
                count.
              </p>
            )}
            <div className="form-grid">
              <p>
                Reserved: <strong>{selected.invited_count}</strong>
              </p>
              <p>
                RSVP:{" "}
                <strong>
                  {selected.rsvp_attending_count ?? "No response"}
                </strong>
              </p>
              <p>
                Table: <strong>{selected.table_name || "Unassigned"}</strong>
              </p>
              <p>Status: {selected.rsvp_status}</p>
            </div>
            {selected.dietary && (
              <p className="notice">Dietary: {selected.dietary}</p>
            )}
            {selected.notes && (
              <p className="text-sm">Notes: {selected.notes}</p>
            )}
            <label className="field">
              Total people arrived (including previous arrivals)
              <input
                className="input text-xl"
                type="number"
                min={0}
                max={selected.invited_count + extra}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <details>
              <summary className="text-sm cursor-pointer">
                Additional guests / staff notes
              </summary>
              <div className="space-y-4 mt-4">
                <label className="field">
                  Additional seats approved at reception
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    value={extra}
                    onChange={(e) => setExtra(Number(e.target.value))}
                  />
                </label>
                <label className="field">
                  Staff note (required for additional seats)
                  <textarea
                    className="input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={1000}
                  />
                </label>
              </div>
            </details>
            {message && (
              <p role="alert" className="notice notice-error">
                {message}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                className="btn btn-primary"
                disabled={
                  pending ||
                  !online ||
                  (count === arrivedCount(selected) &&
                    extra === (selected.extra_seats || 0) &&
                    note === (selected.staff_notes || ""))
                }
                onClick={() => save()}
              >
                {pending
                  ? "Confirming…"
                  : count > arrivedCount(selected)
                    ? `Check in ${count - arrivedCount(selected)} more`
                    : "Update arrival total"}
              </button>
              {selected.checked_in && (
                <button
                  className="btn btn-secondary"
                  disabled={pending || !online}
                  onClick={() => save(0)}
                >
                  Undo all arrivals
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelected(null);
                  router.refresh();
                }}
              >
                Refresh list
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
