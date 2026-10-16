> **9 October 2026:** This document is preserved as design history. The current authorized simplified product scope and implementation checkpoint are in [simplified-product-2026-10-08.md](simplified-product-2026-10-08.md). The four-section navigation supersedes the nine-item proposal below.

# Written Dearly — Design Approval & Wireframe Specification

> 18 September 2026 • Review 01 • Wireframe specification, not approved design.
> Figma setup started, but the Starter-plan MCP allowance was exhausted before new screen frames were created. No frontend implementation changed.

## Standing agreement: design before frontend development

This workflow is a user instruction, not merely a recommendation.

1. Document requirements and behavior in Notion.
2. Create responsive browser-based wireframes, including non-happy-path states. Figma is optional, not a prerequisite.
3. Obtain Kelvin's explicit approval of the named wireframe version and scope.
4. Create high-fidelity designs for visual and motion review.
5. Obtain explicit visual-design approval.
6. Implement only the approved scope and compare the result with those designs.

“Go for it” in this design task authorizes designing, not implementing the resulting proposals. Wireframe approval does not approve colors, type, photography or animation. Silence, an older task marked Done, an existing prototype, or approval of the database model does not constitute design approval.

Routine technical implementation choices may remain autonomous within approved scope. Material changes to layout, navigation, visual hierarchy, controls or interaction flow require renewed approval. Record approved frame links, version, date, scope and reviewer. Preserve prior versions.

## Review packet and sequence

Review 01: navigation and overview → party list/details → guest RSVP → reception.
Review 02: invitation opening and full narrative → content editor → preview/media/music.
Review 03: email dispatch, seating, wishes, settings and supporting states.
Then high-fidelity design and motion review. This sequence keeps each approval manageable.

All proposed screens use fictional sample data. Numeric labels distinguish parties from seats/people. UI notes describe intended behavior, not functionality already implemented.

## Navigation proposal

Desktop: stable sidebar with product/wedding identity, Overview, Invitation, Preview website, Guests & RSVP, Seating, Wishes & messages, Email invitations, Reception, Settings. Group content work separately from guest operations. Put reception within easy reach.

Tablet: compact navigation; preserve enough room for operational details.
Mobile: compact header with menu and wedding identity; single-column content; no compressed desktop tables. Reception has a focused operational header and an explicit return-to-dashboard control.

Navigation links remain aligned with the wordmark. Current location has text and visual indication; focus does not rely on color alone.

## R01 — Overview / Desktop + Mobile / Default + Empty

Purpose: answer “What needs my attention?” and “How ready are we?”

Desktop layout:
- Header: wedding name, date, publication status and Preview website action.
- Readiness panel: missing cover, event information, invitation publication and email setup.
- Statistics with explicit units: invited seats, confirmed people, awaiting replies, declined seats, arrived people.
- Recent responses beside upcoming events.
- Quick links to guests, invitation editing and reception.

Mobile stacks readiness first, compact metric groups second, then recent responses and events. Empty state guides the couple to add the first event and party; it does not present misleading charts.

Approval question: Is preparation prioritized appropriately before the wedding, and are arrival metrics clearly separated from RSVP?

## R02 — Guests & RSVP / Desktop + Mobile / Default + Filtered + Empty

Purpose: find and manage a party without requiring every individual name.

Desktop:
- Header with Add party and Import actions.
- Search by party/member name; filters for RSVP, group/side, email status and arrival.
- Sort control and visible result count.
- Rows show party, allocated seats, RSVP summary, table, email status and arrivals.
- Selecting a row opens party details. Bulk selection is explicit and separate from opening a record.
- Pagination or scalable data loading, with selection scope made clear.

Mobile: search first, filters in a compact sheet, party cards with essential counts and a clear details action. Never display all desktop columns at tiny sizes.

Empty states distinguish “no parties added” from “no search results.” Import preview shows invalid rows and does not silently discard them.

## R03 — Party details / Desktop panel + Mobile full page

Example: Tan Family, four allocated seats, three attending, one declined.

Sections:
1. Party identity and contact details.
2. Allocation: four invited seats; approved extras displayed separately.
3. Member/seat roster: Alex Tan; Jamie Tan; unnamed seat 3; unnamed seat 4.
4. Per-seat RSVP, diet and table/seat override; unnamed seats are deliberately valid.
5. Party-level event access and table default.
6. Private notes separated from guest-visible messages.
7. Personal invitation link, email action and reception pass access.

Actions: Save changes, Cancel, Name this seat, Add allocation and explicitly separated extra-seat approval. Deletion/reduction must warn when responses or arrival history would be affected.

Naming an unnamed seat preserves its identity, response and arrival. The interface must not present it as an extra person. Household diet notes must be distinguished from member-specific requirements.

Errors: allocation below existing occupied/responded places; invalid contact data; stale revision; failed save. Preserve form input on failure and only show saved after server confirmation.

## R04 — Personalized RSVP / Mobile first + Desktop

Entry: “Dear Tan Family”, wedding identity, four reserved seats and reply deadline.

Flow:
1. Review who is invited: named people and unnamed reserved places.
2. For named members choose Attending / Not attending / Decide later.
3. For unnamed places specify attending count within their allocation; remaining places can remain undecided or be declined explicitly.
4. Collect dietary information with clear member/household association.
5. Optional message to the couple.
6. Review summary and submit.
7. Confirmation displays the saved response and link back to invitation/pass.

Never infer declined merely because a checkbox is not selected. Partial responses must retain pending places.

States: initial, partial, saving, saved, previously submitted/editable, RSVP closed, over-allocation, stale data, invalid link and network failure. A failed save keeps the draft and does not show confirmation.

Desktop centers the form in a comfortable reading column; mobile uses full-width controls and large targets. Essential information remains usable without animation.

## R05 — Reception / Tablet + Mobile / Search + Scan

Purpose: fast, reliable operation while people queue.

Header: wedding/event context, connectivity indicator, arrived/expected people.
Primary modes: Search and Scan QR.
Search: autofocus when appropriate, fast matching by party/member, recognizable group/table context.
Scan: clear camera viewport, permission guidance and manual search always available.

On match show party identity, invited seats, confirmed people, arrived people and table. Do not record arrival automatically on scan: staff confirms the party and arriving people first.

Permission denied: switch to search and explain how to restore camera access.
Invalid QR: neutral error, scan again/search.
Network unavailable: prominently state that arrivals are not confirmed; do not fake offline synchronization.

## R06 — Reception party / Partial arrival + Success + Duplicate + Undo

Example: Tan Family; four invited, three confirmed, Alex already arrived.

Roster shows:
- Alex: arrived at known time; selection disabled for duplicate arrival.
- Jamie: attending, not arrived; selectable.
- Unnamed seat 3: attending, not arrived; selectable.
- Unnamed seat 4: declined; staff must deliberately handle any walk-in.

Primary action states exactly how many NEW people will be checked in. “Check in all remaining” must define its scope; do not silently include declined or unknown attendees.

After success: authoritative updated count, compact confirmation and Next guest action. Undo an arrival must identify the affected person/seat and refresh totals.

Duplicate scan: show existing arrivals without adding people.
Conflict: another staff member changed this party; refresh and reconfirm.
Unexpected extra: explicit approval, added seat count and required staff note.
Timeout: outcome uncertain; refresh before retrying to prevent accidental duplication.

## Remaining screen briefs

### Invitation and opening

Preserve the supplied botanical/linen/bow opening direction. Wireframe the closed invitation, opening action, music-off/playback-denied fallback and revealed hero. Then show couple, story, multiple events, countdown, gallery, practical details, RSVP, reception pass and closing.

Use labeled photo areas during wireframe review; imagery and serif styling belong to the later visual pass. Specify reduced-motion/static behavior alongside animation intent. Missing optional content should disappear cleanly, not produce empty cards.

### Invitation editor and preview

Focused tabs for couple/cover, events, story, gallery, details, music and publishing. Explicit save status. Preview identifies saved data and offers mobile/tablet/desktop. Preview RSVP cannot write.

Uploader states: empty, validation failure, uploading, preview, replace, remove and save/persistence error. Cover focal positioning needs a design decision. Music includes uploaded track state, replace/remove and playback testing.

### Email invitations

Audience selection → personalized preview → optional owner test → confirm send → results.
Show sending, accepted, delivered, failed and unknown distinctly.
Bulk action communicates recipient count. Retry is safe only when outcome is known; no blind resend for uncertain sends. Missing email/provider configuration have deliberate states.

### Seating, wishes and settings

Seating separates party default table from member overrides and shows unassigned people.
Wishes are private initially; public guestbook is a separate proposal.
Settings separates website publishing/RSVP controls from account/security. Staff authorization is not implied by drawing a reception screen.

## Cross-screen state and accessibility checklist

- Loading, empty, no results, success, validation error and network failure.
- Visible keyboard focus and logical tab order.
- Clear labels and errors associated with relevant inputs.
- Large touch targets; no reliance on hover alone.
- Status text in addition to color.
- Dialog focus management and escape/cancel behavior.
- Long names, larger text and narrow widths.
- Reduced-motion and audio-off paths.
- Sensitive fields clearly distinguished from guest-visible content.

Target review sizes: desktop 1440, tablet 768 and mobile 390. These are layout inspection sizes, not exhaustive device acceptance.

## Approval ledger

Review 01 wireframes: v1 browser prototype created in `design-review/review-01`; partial packet, NOT APPROVED. Covers overview, party lookup/read-only detail, seat RSVP, reception selection/undo and selected exception states. Add/import, bulk operations, editable party detail, extras approval and full state coverage remain unfinished. Figma access is no longer a blocker.
Review 02 wireframes: NOT STARTED.
Review 03 wireframes: NOT STARTED.
High-fidelity design: NOT STARTED.
Frontend implementation approval for these new designs: NOT GRANTED.
Party/member data-model approval: remains APPROVED separately.
Live Supabase application: remains NOT APPROVED.

Use this approval format when reviewing:
“Approve Review [number], version [date/version], frames [links], for [layout/behavior or visual design], with these exceptions: ...”

## Figma checkpoint and exact resume point

[Canonical Figma file](https://www.figma.com/design/cOWxMvQjzFeHaVdKtEXW69)

Preserved:
- 01 · Cover — page 7:2.
- 02 · Wireframes · Desktop — page 0:1; prior product wireframes frame 1:2.

Created:
- 03 · Review 01 · Parties to reception — page 14:2. Currently empty.

Library assets resolved/imported for reuse:
- Simple Design System Button — set 14:107.
- Input Field — set 14:46.
- Checkbox Field — set 14:189.
- Existing wireframes use Inter; use it only as neutral wireframe typography, not final brand approval.

No screen frames, screenshots of new screens or interactive prototype were completed. Do not call this a finished wireframe pack.

When Figma access is available, inspect page 14:2 and reuse it; do not create another review page. Continue in small sections, use component instances, return node IDs and visually inspect each screen. Present the completed first packet for approval before the visual-design pass.

## Documentation maintenance

This review specification is linked from the second brain. Future changes must update the screen inventory, approval status and exact frame links. Keep changes scoped; do not overwrite the previous design history. No frontend source or database changes were made in this design-start session.

