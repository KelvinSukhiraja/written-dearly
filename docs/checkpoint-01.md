# Checkpoint 01 — audit and local implementation draft

Status: paused for architectural approval, 17 September 2026. Not production-ready. No live database changes, no emails sent, no deployment.

## Reviewable local work

- Warm dashboard palette, serif hierarchy, larger controls and responsive navigation; removed homepage corner/grid decoration.
- Invitation editor organized into sections, actual saved-template preview at mobile/tablet/desktop widths, image validation/resizing and music controls.
- Expanded invitation sections, story milestones, gallery viewing and reduced-motion-aware animation.
- Draft guest editor, reception scanner, email area, seating summary and private wishes view.
- A development-only fixture at `/dev/review` for UI inspection without changing real data.
- Excluded the extracted reference project from lint/type checks. Removed hosted font build dependency.

## Architectural decision awaiting the user

The original `guests` table represents parties: one display name with multiple seats. The current draft migration extends that model with counts, separate personal-link/reception tokens, contact details, event access and email tracking. It does **not** model individual members, individual RSVP, dietary preferences or per-person seating/arrival.

Recommendation for the full brief: retain each existing row as an invitation party, add optional named members underneath, and store individual RSVP/arrival state for named members. Unnamed seats remain usable for households and plus-ones. Derive party totals from members plus unnamed seats rather than maintain competing counts. The private invitation link belongs to the party; the QR is a separate opaque reception credential. One invitation belongs to one wedding and one party, with event permissions attached to that invitation. Existing records can migrate without being deleted.

This is more work now but avoids reworking RSVP and check-in after couples start entering individual names. It needs approval before revising the schema or building additional dependent features.

## Database application is also blocked

Automatic approval review rejected the attempted live migration because of its RLS changes, privilege changes, token-authorized functions and storage infrastructure. `supabase/production_upgrade.sql` remains a **proposal**, not applied. Do not run it automatically or present its features as live. Revisit it after model approval; the full brief likely needs members in addition to party counts.

The existing live database still has no media bucket and still has permissive guest policies for published invitations. The new upload/guest/RSVP/email flows cannot be accepted end-to-end against it yet. Email sender credentials, provider event tracking, real-device camera verification and full responsive acceptance remain outstanding. No authenticated live browser session was available for testing.

## Scope notes

Verification at this checkpoint: `npm run build` passes including TypeScript; `npm run lint` passes with nine image-optimization warnings; `node scripts/verify-database.mjs` passes against isolated PGlite, including anonymous/owner isolation, guest-facing field projection, token rejection, seat limits, RSVP persistence/throttling/closure, draft privacy, optimistic arrival conflict, count constraints and mail rate limits. PGlite uses a test stand-in for pgcrypto and Supabase platform schemas; this does not certify live Storage, Auth, SMTP or camera behavior. Browser inspection was limited to the editor fixture at desktop/mobile widths; full responsive acceptance is still pending.

- Partial check-in currently uses party counts, not named people.
- Offline reception is lookup/manual fallback only; it does not queue unconfirmed writes.
- Email adapter uses provider-neutral SMTP. Accepted is distinct from delivered. Provider-specific delivery webhooks remain outstanding.
- Wishes are private notes with RSVP, not a public guestbook.
- Media removal removes the saved reference; old objects are retained to avoid deleting assets still used elsewhere.
- Preview currently shows saved data, not unsaved edits.
- Changes are not committed: the workspace already contained extensive uncommitted and untracked user work. No broad commit or reset was performed.
