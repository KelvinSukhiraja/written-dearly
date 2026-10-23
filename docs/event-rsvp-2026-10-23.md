# Per-event RSVP — 23 October 2026

Owner requested separate event attendance and invitation dashboard changes matching the Figma RSVP (22:308). Implement locally; live schema application requires the separate checkpoint in AGENTS.md.

## Behavior and storage proposal

- Invitation → Events offers “Ask guests which events they will attend”. Existing invitations default off. Show the setup requirement when the hosted upgrade is absent. Stable event IDs survive renaming/reordering.
- RSVP follows the reference: guest name, overall yes/no, event checkboxes, one party-wide people count, dietary note and private message. One count applies to every selected event. This does not introduce individual member responses or different counts per event.
- Guests see and can respond only to their permitted events. Explicit copy explains that unchecked events become not attending upon submission. Before submission, missing choices remain pending; legacy replies are not inferred as yes/no to events.
- Overall yes requires at least one event; overall no declines all currently permitted events. Bounded seat allocation, deadline, closed/unpublished states and separate reception tokens stay intact.
- Proposed `guests.event_responses` JSON object maps stable event IDs to attending/declined. Missing entries mean pending. A distinct version-checked RPC saves overall and event replies atomically. The legacy RPC cannot bypass event choices when the feature is enabled. Guest context exposes only that party's permitted responses and version/capability, without contacts or other parties.
- Owner Guests shows per-event counts and choices, supports recording a response on the guest's behalf, and keeps event access separate from attendance. New/removed access and removed events cannot create false confirmations.
- Failed saves retain input. Stale party/event configuration is rejected; reload required. Preview uses explicitly fictional data and never writes.

## Release checkpoint

No live schema changes, feature activation or deployment performed. The proposal and local verification will be completed before requesting live approval. Rollout: apply reviewed proposal, deploy compatible app, then enable the invitation setting and perform an authorized test. Existing replies and guest identities are preserved.

## Completed implementation and verification

Local implementation is complete. The shared RSVP form now supplies the Coastal Figma-style presentation and Classic-compatible controls, personal read-only name, yes/no response, permitted event choices, bounded group count, dietary note, private wishes, validation, pending and saved/error states. Saved version receipts survive retry errors. Owner preview is an explicitly labelled interactive sample; it never calls the RSVP action.

Invitation → Events includes the opt-in setting with a database-readiness guard. Both the page and save action prevent activation before setup exists. Guests includes per-event people totals, separate pending/declined invitation counts and editable per-event responses. Contact-only edits preserve unanswered legacy event choices. Event access remains distinct from attendance. The private JSON map is filtered by active event IDs/access in token context; removed event replies remain stored but are not presented as current responses.

Isolated review routes: `/dev/event-rsvp` (full production Coastal renderer with fictional guest and preview-only submission), `?view=editor`, `?view=guests`, `?view=restricted`, `?view=returning`, `?view=closed`, `?view=not-ready`, `?view=empty`, `?view=classic`. Dashboard fixture saves/uploads are isolated. Production builds return not-found for these development routes.

Passed:

- `scripts/verify-event-rsvp-db.mjs`: additive/idempotent proposal and preserved tokens/versions; no invented backfill; atomic mixed/declined replies; allocation, restricted-event, changed-event-list and stale-version rejection; cooldown; closed/deadline/unpublished states; anonymous direct-read denial; owner isolation; malformed-map rejection/normalization; removed-event context privacy; legacy RPC compatibility and bypass rejection.
- `scripts/verify-event-rsvp-actions.mjs`: actual RSVP server action with mocked Supabase boundary; validation before writes; arguments/receipt; missing setup, conflict, network failure and uncertain-result errors; cache invalidation only after confirmed success.
- `scripts/verify-event-rsvp-owner.mjs`: actual owner save action with mocked boundary; contact-only preservation, explicit mixed/pending/declined updates, forbidden selections, missing setup and stale saves; event-total units/access filtering.
- Existing guest-workflow SQL regression and all eight simplified-flow tests.
- Production build including TypeScript. Targeted ESLint has no errors and one existing image warning. Diff whitespace check passes.
- Browser checks in the in-app browser: mobile 320/390/402px with no horizontal overflow; missing-selection error retains wishes; restricted event list; restored returning choices; yes/no and mixed-event count summary; safe preview confirmation; closed/missing setup/empty states; invitation toggle sample; guest totals, owner event-edit sample; Classic form submission. Screenshots visually inspected. Evidence in `design-review/coastal-content/event-rsvp-*.png`.

Limitations: hosted event persistence is not yet available, and no real guest reply was submitted. PGlite tests exercise transaction validation but not real multi-session PostgreSQL interleavings. The live proposal is `supabase/proposals/event-rsvp.sql`. Existing aggregate replies are not automatically assigned to events.

Next checkpoint: obtain explicit approval to apply that proposal live, deploy the compatible application and enable event attendance on the owner's invitation. Activation should verify a controlled, owner-approved guest reply and reload before inviting wider guest use. Roll back activation by disabling the invitation setting; retain stored responses. Do not drop the new column or functions as a rollback while the application may use them.

Reference: [Figma RSVP](https://www.figma.com/design/3C0yYAlzF44FnaevtIemRP/Wedding-Invitation?node-id=22-308). Database boundary follows [Supabase function security](https://supabase.com/docs/guides/database/functions) and the project's existing private implementation/public invoker wrapper pattern.

## Approved activation — 23 October 2026

Owner explicitly approved applying the proposal live, deploying and enabling the feature. Applied Supabase migration `event_rsvp_per_party` successfully. Follow-up confirms the column/RPC are ready, both existing guests remain pending, event reply maps are empty and anonymous guest-table reads remain denied. The exposed RPC is an invoker; token checks and the private implementation remain in place.

Hosted transactional verification passed the real anonymous RPC, two-person dinner-only save, version receipt, safe guest context, restricted-event rejection and legacy bypass rejection using a synthetic invitation/party inside a rolled-back transaction. Zero test invitations remain; real guests/replies are unchanged. Security advisors identify only unrelated existing `handle_new_user` execution grants and disabled leaked-password protection; no new RSVP finding. References: [function-execution advisory](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). These settings were not changed.

Preparing an exact scoped release from the staged tree. The invitation-editor release includes only the event setting/readiness additions, excluding pre-existing local multiple-gallery work. Unrelated local files are preserved. Production status and invitation activation will be recorded after verification.
