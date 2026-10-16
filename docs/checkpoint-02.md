# Checkpoint 02 — approved party model, local foundation

17 September 2026. User approved parties with optional named members. This supersedes the model-approval blocker in checkpoint 01, not the separate live-database approval requirement.

## Implemented in this stage

- `supabase/party_model.proposal.sql`: isolated SQL design/test fixture layered after the existing upgrade proposal. **Not a deployable migration.** No live database was contacted or changed.
- Existing `guests` IDs, party metadata, invitation tokens and reception tokens remain intact. Existing `invitations` continues to mean the wedding website; no redundant wedding/invitation hierarchy was introduced.
- Each allocated place has a `party_seats` row. A nullable member name makes it an unnamed place or named member without changing its identity, RSVP or arrival. UI can still offer a simple unnamed party count; users need not fill every name.
- Seats carry RSVP, dietary requirements, table/seat assignment and independent arrival state. Existing household dietary notes remain household-level rather than being attributed to an invented person.
- Existing RSVP/arrival counts backfill into unnamed places. Pending is not converted to declined. Extra seats remain distinguishable by their position beyond the invitation allocation. Unknown legacy arrival times remain unknown.
- Read-only `party_totals` derives named/unnamed, attending, pending and arrival totals from seat records. Owner RLS applies to the table and security-invoker view. Anonymous access and direct authenticated writes are denied.
- Constraints reject duplicate seats, over-allocation, blank names and moving an existing seat between parties. Capacity reduction requires explicit seat removal. Parent locking establishes the order that future write operations must follow.
- Conversion fails atomically for inconsistent legacy counts; it does not silently repair, clamp or delete them.

## Verification

`node scripts/verify-database.mjs` passes, including the earlier regression suite and the new `scripts/verify-party-model.mjs` suite:

- Rollback of invalid legacy conversion; no partially created seat table.
- Existing party rows and tokens unchanged after successful conversion.
- Pending/declined responses, unnamed-to-named conversion, mixed member responses.
- Partial arrivals, extra arrivals, and undo with derived totals.
- Capacity, duplicate-seat and immutable seat identity checks.
- Anonymous denial, other-owner isolation, owner reads, direct insert/update/delete denial.
- Cascading seat cleanup when a disposable test party is removed.

Tests use isolated PGlite, not hosted Supabase. They do not certify real concurrent transactions, platform Auth/Storage, SMTP, camera operation or end-to-end UI behavior. No frontend files changed in this stage; previous browser/build results are not new verification of the member feature.

After formatting, the database suite passed again. `npm run lint` passed with zero errors and the same nine existing image-optimization warnings.

## Required next stage: transactional operations and application cutover

This proposal deliberately does not synchronize the old aggregate columns or update existing RPCs. Applying it alongside the current app would leave totals stale; **do not apply either proposal as a production release**.

1. Add owner-authorized and token-authorized operations that lock the party first, verify the expected party version, check all seat IDs belong to that party, and atomically update seats plus compatibility aggregate columns. Reject stale revisions rather than overwrite concurrent RSVP or arrival edits.
2. Allocation changes must explicitly distinguish naming an existing seat, adding capacity and approving unexpected extras. Never drop a responding/arrived member silently. Changing invited allocation must not silently reclassify existing extra seats.
3. Replace aggregate-only guest editor, imports, RSVP and reception mutations together. Prohibit direct aggregate writes once cutover is complete. New parties must initialize their seats transactionally.
4. Public guest context should expose only safe member fields with party-scoped opaque identifiers; no database IDs, contact details, private notes or other parties. RSVP tokens remain separate from reception tokens.
5. Party-wide actions should resolve to member/unnamed-seat updates. Partial replies retain pending seats; attendance and RSVP remain independent. Preserve explicit historical party response metadata and communicate partial responses in the UI.
6. Add real PostgreSQL multi-session conflict tests and member-aware end-to-end tests. PGlite's single connection cannot validate interleaving between concurrent reception staff.
7. Generate a versioned migration only after the complete cutover is reviewed, data preflight passes, and live application is separately approved. Run Supabase advisors at that point.

## Skill/security review

Supabase guidance informed explicit grants, owner-scoped RLS, indexed party lookups, the security-invoker aggregate view and denying direct writes until validated operations exist. Current RLS documentation was checked at https://supabase.com/docs/guides/database/postgres/row-level-security . The changelog Markdown endpoint could not be retrieved (unsupported web content type; shell network restriction); no changing platform API was introduced in this stage.
