> **C/M logo checkpoint (9 October 2026):** Approved all three placements; implemented as an opt-in invitation theme setting. See [cm-logo-checkpoint.md](cm-logo-checkpoint.md). Working local preview: `/dev/review?view=cm-logo`. Live invitation settings were not changed.

> **Current scope (9 October 2026):** The owner authorized simplifying the product around design selection, invitation editing, guest phone numbers and companion allowances, manual WhatsApp sharing, RSVP and QR check-in. Primary navigation is Home / Invitation / Guests / Check-in. See [current brief and verification](simplified-product-2026-10-08.md). Historical mandatory wireframe approval gates below are superseded for this scope. No live schema change or automated delivery setup was performed.

> **Guest workflow checkpoint (12 October 2026):** Desktop guest table, mobile cards, pagination, unified contact validation, CSV preview and save-to-invitation preparation implemented locally. Browser tests include 125 fictional guests. Hosted schema inspection confirms missing fields; the scoped guest update is tested locally and awaiting separate live approval. See [guest workflow checkpoint](guest-workflow-2026-10-09.md).

> **Coastal invitation (14 October 2026):** A second portrait invitation renderer is implemented from Figma MCP, using supplied Awesome Serif/Gotham fonts and downloaded artwork. Development reference: `/dev/coastal`; owner preview can inspect it without switching designs. Existing RSVP/privacy behavior remains; Figma-only public wishes, per-event responses and bank card are reference-only. Catalog registration proposal awaits a live-update checkpoint. See [implementation and checks](coastal-invitation-2026-10-14.md).

> **Landing page alignment (15 October 2026):** Replaced the old w wordmark and saturated blue hero styling with the current C/M artwork, near-white/slate palette, serif headings and pale actions. Added a concise current-product flow. TypeScript, targeted lint and responsive browser checks passed. See [landing checkpoint](landing-theme-2026-10-15.md). Local implementation only.

# Written Dearly — Product & Engineering Second Brain

> **Blank homepage (16 October 2026):** At the owner's request, removed all landing-page content from `/` and replaced it with a blank white page. Earlier landing designs are historical references.

> **Original Invitation Index (15 October 2026):** Owner chose the original generated horizontal-gallery/oversized-wordmark concept and authorized implementation of that page only. Replaces the living design wall; additional SaaS and pricing/catalogue sections are deferred. See [current implementation](invitation-index-2026-10-15.md). Prior versions preserved.

> **Living design wall (15 October 2026):** Owner approved a boutique design-studio landing page and scroll-driven collage-to-invitation animation before development. Implemented locally with native scrolling, responsive showcase, shorter mobile motion and static accessibility fallbacks. Supersedes the earlier workspace-style landing treatment. See [implementation checkpoint](landing-living-wall-2026-10-15.md) and its linked verification evidence.

> **Management redesign (13 October 2026):** Implemented the original C/M logo across an ivory/slate management workspace, guided by Apple HIG typography, layout, navigation and accessibility. Desktop sidebar, visible mobile primary navigation, clearer home next steps and consistent shared controls are complete locally. Public invitations are unchanged. Production build, TypeScript and 10 workflow tests pass; responsive fictional fixtures and dialog keyboard focus were checked. See [design and verification](management-redesign-2026-10-13.md).

> **Media and YouTube (12 October 2026):** User approved the scoped live storage setup; bucket creation, owner upload and public preview passed. Cross-owner/anonymous upload denial passed. YouTube source selection and a visible, explicitly loaded video player are implemented and browser-tested with a fictional fixture. Uploaded background songs remain supported. See [media checkpoint](media-storage-2026-10-12.md) for limits, verification and the unreferenced test object's cleanup path.

> **Logo scope correction (12 October 2026):** C/M branding was intended for the management website. The invitation logo option and opening/header/closing treatments have been removed at the owner's request; legacy theme settings are ignored. Earlier invitation-logo approval entries are superseded. Original artwork is retained for management-site branding.

> **Live flow test (12 October 2026):** Two fictional guests were added/edited through the signed-in website; personal RSVP and QR availability passed against hosted data. Fixed the RSVP dropdown reset after saving and retested. Test records were removed. Partial check-in was blocked before execution by browser approval-review rate limiting; real WhatsApp delivery/camera remain untested. See [flow guide and evidence](guest-flow-live-test-2026-10-12.md).

> **Live guest update applied (12 October 2026):** After explicit user approval, the scoped guest workflow migration was applied successfully. Hosted owner-role insert/update checks passed with rollback; API schema cache verified with HTTP 200. No sample guests or messages remain. This supersedes prior pending-approval notes for the guest workflow update only; the separate party/member model proposal remains unapplied. See [application evidence](guest-workflow-2026-10-09.md).

Notion copy: https://app.notion.com/p/3de858346b1781e5a035e7f0b1afc23d

> Project memory and implementation handoff • Updated 17 September 2026 • Product owner: Kelvin • Status: local implementation in progress, not production-ready.

## Start here — the 60-second version

Written Dearly is becoming a complete wedding invitation and reception product, not just a beautiful webpage. Couples manage their wedding in a warm, elegant dashboard; guests receive private personalized invitations, reply for their party, and present a QR code at reception.

The central journey is: **Dashboard → Party → Personalized email → Invitation → RSVP → Reception QR → Staff check-in.** Every stage must use the same party and seat records.

**Approved:** preserve each existing guest record as a party/household, with optional named members and unnamed seats. This approval was given explicitly on 17 September 2026.

**Not approved/applied:** live Supabase migration. Both SQL proposals remain local and must not be deployed as-is. Member-aware transactional operations and application cutover are unfinished.

**Next design step:** review the isolated browser wireframe slice at `design-review/review-01` (v1), then finish the remaining Review 01 interactions. Figma is optional and no longer blocks progress. Layout/behavior approval and separate high-fidelity visual/motion approval remain required before production frontend implementation. **Next backend step when implementation resumes:** atomic, version-checked party/member operations. Do not restart the project or undo existing work.

**18 September update — design-first is now required.** Responsive wireframes need explicit layout/behavior approval, followed by separate high-fidelity visual/motion approval, before frontend implementation. Figma setup began, but the Starter-plan MCP allowance was exhausted before new screens were created. Prior designs are preserved; the new review page is currently empty. See [Review 01 specification](https://app.notion.com/p/3df858346b1781e19ed3d9462b140941) and local `docs/design-review-01.md`.

## Navigation and source of truth

- [Existing design hub](https://app.notion.com/p/3dc858346b17815f990bc2f9cb9fde70)
- [Existing Figma wireframes](https://www.figma.com/design/cOWxMvQjzFeHaVdKtEXW69)
- [Project task board](https://app.notion.com/p/b4c917f7d7d24e2c8445652bd941d878)
- [Original desktop wireframe task](https://app.notion.com/p/3d8858346b17814f9959dfbd8cc5af73)
- [Remaining wireframe surfaces](https://app.notion.com/p/3dc858346b17814a95e4e8d32d869d18)

This page consolidates the latest user brief, architectural approval and local implementation checkpoints. The older design hub describes the earlier MVP: monochrome SaaS dashboard, simple public RSVP and fewer invitation sections. Those are historical design decisions, not requirements to preserve against the newer brief. Keep old frames as history and mark them superseded when redesigned.

Notion holds intent, decisions and implementation memory. Figma holds visual designs and interaction specifications. The repository holds implementation. Deployment and acceptance evidence determine what actually works live; a local component or a task marked Done is not proof of production readiness.

<table_of_contents/>

## 1. Product vision and design principles

Create a premium, elegant, modern, clean and warm wedding experience that non-technical couples can confidently use. Avoid generic SaaS coldness, excessive flowers, overly feminine styling, visual clutter and animation for its own sake.

The dashboard prioritizes clarity, accurate data and efficient actions. The invitation can be more cinematic and expressive. Both should feel like the same product through typography, spacing, color, buttons and interaction quality.

Keep useful existing code and the supplied new opening. Improve weak prototype decisions deliberately rather than rewriting everything. Work in small, testable stages with checkpoints.

Primary users:

- Couple/admin: creates the wedding website, manages guests, communications, seating and content.
- Invited party: opens a personal link, reads relevant information, replies and accesses its reception pass.
- Reception staff: finds guests, resolves party information and records arrivals quickly on a phone or tablet.

Dedicated staff permissions are a future access-control design decision. Current local reception actions use owner authorization; a separate least-privilege staff role is not implemented.

## 2. What exists now — honest status

### Local frontend drafts already built

- Warm ivory/sage dashboard styling, serif hierarchy, larger controls and revised navigation.
- Homepage frame/grid decoration removed; wordmark alignment addressed locally.
- Invitation editor organized into couple/cover, events, story, gallery, details, music and publishing.
- Saved-data preview using the actual invitation template, with mobile/tablet/desktop widths.
- Cover/media validation, browser image resizing, upload feedback and reference removal.
- Expanded invitation content, botanical-linen/silk-bow opening, guest greeting, music controls, story/gallery and motion.
- Guest editor, searching/filtering/sorting, paginated cards and improved CSV parsing.
- Reception scanner interface, manual lookup, partial count-based arrival, extra-seat notes and conflict checks.
- Email area with SMTP adapter, HTML preview, owner test-email flow, batches and send-state handling.
- Seating summary and private RSVP wishes/messages.
- Development-only review fixtures at localhost:3000/dev/review.

These are **local drafts**, not a fully accepted wedding-ready system. The party-member foundation has not yet been connected to these interfaces.

### Local data-model foundation completed at checkpoint 02

- Optional named members represented by named seat records; unnamed seats use the same accounting.
- RSVP and arrival are independent per seat.
- Derived party totals, owner-only reads and direct-client write denial.
- Backfill tests preserve existing party records and tokens.
- Invalid historical counts stop conversion atomically rather than silently discarding information.
- Capacity, duplicate-seat and immutable seat-identity checks.

### Live state last verified during the preceding status review

No upgrade migration was applied, no emails were sent and no deployment was performed. The live database still had no media bucket, no new guest token column and no email-delivery table. Existing anonymous guest policies on published weddings remained permissive.

This is a **dated observation**, not a fresh live audit made while writing this document. Security hardening is a release blocker. Do not use the current prototype with real private guest data until the approved security rollout is complete.

## 3. Dashboard structure and behavior

Use focused areas rather than one overwhelming settings page:

- **Overview:** preparation checklist, allocated seats, confirmed attendees, pending responses, declined seats, arrivals, recent responses, upcoming events and communication status.
- **Invitation:** couple, cover, events, story, gallery, guest information, music and publication.
- **Preview website:** real saved invitation with device-size controls and safe, non-writing RSVP.
- **Guests & RSVP:** party list, optional member details, contact information, allocations, RSVP, diet, seating, notes and personal links.
- **Seating:** party defaults and individual overrides; summarize unassigned seats and table occupancy.
- **Wishes & messages:** private responses initially. A public guestbook requires separate opt-in/moderation work.
- **Email invitations:** audience selection, previews, test sends, dispatch status and safe retry.
- **Reception:** quick search, QR scanner and arrival confirmation.
- **Settings:** site/account configuration, RSVP availability and operational settings.

Always distinguish **parties** from **people/seats** in labels and metrics. “12 parties checked in” and “38 people arrived” are different numbers.

Navigation must align naturally, show clear active/focus/hover states and work without horizontal overflow. On small screens, preserve easy access to reception search and scanning.

Preview currently uses saved data, not unsaved edits. Show this clearly, provide save feedback and refresh after saving. Unsaved live preview is optional future work, not an implemented promise.

## 4. Approved party + optional members model

### Vocabulary

- **Wedding website:** existing invitations row, owned by the couple/admin. Contains slug, template and wedding content.
- **Party/household:** existing guests row. Contains display name, contact details, group/side, invitation allocation, party notes, event access and tokens.
- **Seat:** one allocated place under a party. It may be unnamed or contain a named member.
- **Named member:** a seat with a name, not a second independent count.
- **Extra seat:** an explicitly approved additional place, particularly for unexpected reception plus-ones.
- **Personal invitation token:** opaque credential used to access a party’s guest-facing invitation.
- **Reception token:** separate opaque QR credential used by authenticated reception lookup.

Preserve existing IDs rather than replacing all parties. Retain invitations as the wedding-site table even though its name can be confusing; document the meaning instead of introducing duplicate entities prematurely.

### Example

The Tan Family has four invited seats. Two are named Alex and Jamie; two remain unnamed.

If Alex, Jamie and one unnamed guest accept, attendance is three—not five. Naming the unnamed accepting seat later must keep the same seat record and its response. If Alex and that guest arrive first, the party shows two arrived of three confirmed, with one confirmed person still expected.

Checking in a person does not automatically mean they previously RSVP’d. A declined or pending guest may arrive and require a staff decision.

### Party-level information

Display name; family/group; bride/groom side; email; optional phone; invited allocation; event permissions; household dietary note; default table; private admin notes; staff notes; response message; last response metadata; unique personal and reception tokens; optimistic version.

### Seat/member information

Stable internal ID; parent party; seat number; optional name; RSVP status; dietary requirement; table override; seat label; arrived flag; arrival time when known.

The current local proposal uses seat positions beyond the invited count to distinguish extras. Allocation-edit logic must not silently reclassify existing extras. This edge case must be resolved in transactional operations before deployment.

### Invariants

- A seat belongs to exactly one party and cannot be reassigned silently.
- Naming an existing place never increases allocation.
- Pending is distinct from declined.
- Arrival state is independent of RSVP.
- Household dietary notes must not be assigned to an invented individual during conversion.
- Totals derive from seats. Compatibility aggregate columns must not become a second independently editable truth.
- Capacity reduction cannot silently delete responding or arrived members.
- Existing unknown check-in times remain unknown.
- Invalid historical values require review; migration must not clamp counts to make the data fit.

## 5. How the complete journey will work

### A. Couple prepares and publishes

1. Enter names, date, events, photos, story, useful guest details and optional music.
2. Save and inspect the real template in mobile, tablet and desktop preview.
3. Review readiness warnings and publish when appropriate.
4. Draft websites remain unavailable through guest-facing token lookup.

### B. Couple creates parties

1. Create a party with contact details and allocated seats.
2. Optionally name some or all seats; keep others unnamed.
3. Configure event access and party/table defaults.
4. Generate separate private-link and reception credentials.
5. Search, filter and sort larger lists; import with validation and clear row-level errors.

Current CSV parsing handles quoted/multiline fields, but member-aware imports and transactional seat initialization still need implementation.

### C. Couple sends invitations

Select recipients, inspect the personalized email, optionally send a test to the signed-in owner, then confirm dispatch. Each recipient gets the correct private invitation URL. No generic URL should replace the party-specific link.

### D. Guest opens the invitation

Validate the wedding and opaque token. Show a tasteful personal greeting and only the relevant event/content information. Do not expose other parties, internal database IDs, private notes, contact information or predictable guest URLs.

The opening gesture may also begin music. If audio is blocked or unavailable, the invitation still opens and remains usable.

### E. Guest replies

Show named members and unnamed seat options, enforce allocation, collect diet and a message, save atomically and show a confirmation. Previously submitted replies should be readable and editable while RSVP is open.

Partial replies retain pending members. Closed RSVP, invalid links, stale changes and network failures receive deliberate messages without false success.

### F. Guest presents the reception pass

Show the party QR somewhere easy to find, with clear wording that it is for reception. Offer a downloadable pass; a screenshot can be useful when the guest has poor reception.

A saved QR does not make staff check-in writes offline-capable.

### G. Staff records arrival

Scan or search, inspect party details, verify the correct record, select arriving members or unnamed count, and confirm. Show allocated seats, RSVP count, current arrivals, table and relevant staff notes.

Duplicate scans display current arrival state rather than incrementing totals. Support partial arrival, entire-party check-in, undo and explicit extra-seat approval with a note. Return quickly to scanner/search for the next party.

## 6. Transactional backend and security plan

The next stage is the member-aware write layer, not more disconnected UI.

For every party mutation:

1. Authenticate the owner/staff permission or validate the narrow guest token.
2. Lock the party first.
3. Verify the expected version and that every referenced seat belongs to that party.
4. Validate capacity, response rules, RSVP availability and requested transition.
5. Update seats and any temporary compatibility totals in one database transaction.
6. Increment version and return the authoritative state.
7. If stale, reject and ask the interface to refresh; do not overwrite another staff member’s work.

New party creation must initialize its seats transactionally. Guest editing, imports, RSVP and arrival actions must switch together. Do not deploy a hybrid that continues independently writing old totals.

Security requirements:

- Owner-scoped row-level security and explicit database grants.
- No anonymous direct guest-list or seat-table access.
- Narrow token-authorized guest functions; minimal safe field projection.
- Public member identifiers must be opaque and scoped to the party.
- QR must not embed private database identifiers.
- Reception tokens identify a party; they must not authorize anonymous arrival changes.
- Keep secrets server-side and out of source, Notion, logs and browser bundles.
- Avoid referrer/indexing leakage for personalized links.
- Define token rotation/revocation behavior before operational release.
- Separate reception access from full account access when adding staff roles.

A prior live migration attempt was rejected by approval review because of the scope of RLS, privileges, token functions and infrastructure changes. Model approval does not authorize bypassing that gate.

## 7. Invitation experience specification

Retain the supplied opening direction and expand it into one coherent, mobile-first experience.

- **Opening/hero:** couple names, wedding date, strong photography, opening message and personal greeting.
- **Couple:** portraits, short descriptions and optional family context.
- **Story:** narrative, photographs and dated milestones.
- **Events:** multiple custom events with date, start/end time, venue, address, description, dress code, map link and special instructions.
- **Countdown:** relevant wedding/event time, with explicit timezone handling still requiring verification.
- **Gallery:** expressive photography, responsive layout and accessible image viewing.
- **Guest details:** configurable transportation, parking, accommodation, schedule, directions, dress code, gifts/registry, contact and notes.
- **RSVP:** personalized, bounded by the party allocation, with meaningful confirmation and error states.
- **Wishes:** optional private message initially; public display must not be assumed.
- **Reception pass:** convenient, legible QR and reception instructions.
- **Closing:** warm final message and couple identity.

Hide empty optional sections rather than show blank cards or placeholder copy. Missing cover photography needs a deliberate typographic fallback.

Video support is an original product ambition, not completed functionality. Decide upload constraints, poster fallback and performance treatment before adding it.

## 8. Motion, music, media and performance

### Motion

Use selected scroll text/image reveals, gentle scaling, parallax photography and section transitions. Desktop may support richer pinned visuals; mobile should avoid heavy scroll work and layout instability.

Respect reduced-motion preferences and provide a useful static experience. Do not require animation to finish before essential guest information becomes accessible.

### Music

Couple configures/uploads a track. Guest has play, pause and mute/unmute controls. Start from the invitation-opening gesture, handle playback rejection, and never block the invitation on audio success. Avoid unnecessary audio loading before interaction.

Music rights and suitable upload limits remain operational considerations.

### Media upload

Target flow: choose file → validate → show progress → upload → preview → save reference → confirm persistence. Replacing and removing must have clear outcomes.

Local draft: supported image/audio MIME checks, 6 MB limit, image decoding, minimum dimensions, image resizing to a maximum 2200-pixel dimension, WebP output and unique object paths. Hosted storage behavior is unverified.

Removal currently clears the saved reference but retains the object to avoid deleting shared assets. A safe orphan-cleanup policy remains future work. Cropping/focal positioning needs acceptance review rather than being assumed complete.

### Performance work still needed

Responsive image sizes, optimized loading of the first screen, below-fold lazy loading, restrained motion, gallery sizing and caching that never shares private party context. An image helper exists but is not integrated; nine lint image warnings remain.

## 9. Email delivery design

Use a provider-neutral adapter; the current local implementation uses SMTP. Configuration belongs in secure environment settings, not hardcoded application logic.

Required user flow: select guests → preview → test → send individual/bulk → inspect results → safely retry known failures.

The current draft limits batches to 20 and includes rate reservation. Email state distinguishes sending, provider acceptance, delivered, failed and unknown. **Accepted is not delivered.**

Avoid blind retries after a timeout: the provider may already have accepted the message. Preserve uncertain state and reconcile it. Escape personalized HTML. Define explicit resend behavior separately from accidental duplicate prevention.

Still required: configured sender/provider, domain authentication, delivery/bounce webhook integration where supported, repeated-send attempt history as needed, rate-limit testing and real acceptance tests. No real invitation emails have been sent.

## 10. Reception operating rules and failure states

- **Camera denied/unavailable:** explain how to enable permission and keep manual search usable.
- **Invalid QR:** no matching guest information; provide scan again/search.
- **Already arrived:** show who/when and offer only valid remaining actions.
- **Partial arrival:** retain arrived members and show those still expected.
- **Unexpected plus-one:** require explicit extra capacity and a staff note; do not rewrite original invited counts casually.
- **Accidental check-in:** undo with clear feedback. Durable audit history remains work to define and implement.
- **Stale record:** refresh authoritative data and ask staff to reconfirm.
- **Network unavailable:** show unconfirmed status; never claim successful check-in without server confirmation.
- **Poor connection:** use available lookup/manual fallback and visible connectivity status.

Offline write queuing/synchronization is not implemented. Do not describe the product as offline-ready. Operational acceptance should include a manual contingency guest list and a reconciliation procedure that the couple approves.

## 11. Design system, accessibility and responsiveness

Create shared tokens and states for typography, spacing, colors, radius, shadows, buttons, forms, cards, tables, modals and feedback. Invitation and dashboard may differ in expression while using a coherent brand.

Verify keyboard navigation, visible focus, labels, contrast, dialog focus behavior, touch targets, meaningful image alternatives and reduced motion. Status must not depend on color alone.

Test mobile as the primary invitation device. Dashboard must remain usable on tablets and phones, especially reception. Preview presets currently use 390, 768 and 1280 widths; these are useful inspection sizes, not a replacement for real-device testing.

Explicit state inventory:

- Empty guest list; no cover; no gallery; missing optional content.
- Saving/uploading; save/upload failure; success and replacement/removal.
- Invalid/unavailable invitation; draft website; RSVP closed; prior reply; partial reply.
- Camera denied; invalid QR; already arrived; stale arrival; offline/unconfirmed write.
- No email address; send failure; provider accepted; delivery failure; unknown outcome.
- Empty seating and unassigned people; empty wishes.

## 12. Original bugs and what was learned

- **Cover upload:** assumed a missing storage bucket, reused a fixed path and lacked adequate validation/error distinctions. Local flow improved; live storage setup and end-to-end proof remain.
- **Preview:** was a separate summary card rather than the invitation. Replaced locally with actual-template saved-data preview.
- **Homepage lines:** decorative frame pseudo-elements and grid overlay, not unexplained browser rendering.
- **Navbar/wordmark:** line-box/layout alignment needed correction, plus responsive review.
- **Guest privacy:** permissive published-wedding guest policies and name-only RSVP were unsafe foundations.
- **Reception counts:** mixed parties with people and used boolean arrival state.
- **Build hygiene:** extracted reference files were included in lint/type checks; optional GSAP context typing and remote font fetching also caused issues.

These findings are from the earlier code audit. Do not re-audit from scratch unless new evidence or changed code requires it.

## 13. Implementation roadmap and checkpoints

### Stage 1 — audit and local product draft: completed as a draft

Preserved reusable Next.js/Supabase/template architecture; improved navigation, styling, editor, preview and invitation surfaces. Checkpoint 01 records limitations.

### Stage 2 — approved party foundation: locally tested

Added seat-based optional members and derived totals; tested conversion, integrity and access isolation. Checkpoint 02 is the current implementation boundary.

### Stage 3 — transactional operations: next

- [ ] Owner/member mutation contract and party-version conflict handling.
- [ ] Token-authorized member RSVP with safe field projection.
- [ ] Arrival/undo/extra-seat operations.
- [ ] New-party and import seat initialization.
- [ ] Allocation-edit behavior and prevention of extra-seat reclassification.
- [ ] Real multi-session PostgreSQL concurrency tests.
- [ ] Checkpoint showing successful and rejected transitions.

### Stage 4 — connected interfaces

- [ ] Member-aware party editor and named/unnamed seat controls.
- [ ] Personalized RSVP and partial-response states.
- [ ] Fast reception selection, duplicate scan, undo and manual fallback.
- [ ] Shared derived totals in overview, seating, guests and reception.
- [ ] Replace aggregate-only writes together.
- [ ] Complete end-to-end happy-path and failure-path tests.

### Stage 5 — infrastructure and controlled rollout

- [ ] Preflight existing data, backup/recovery plan and reviewed versioned migration.
- [ ] Explicit live Supabase approval.
- [ ] Security advisors, RLS and storage verification.
- [ ] Media persistence and personal-link verification.
- [ ] SMTP configuration, delivery handling and test-email approval when appropriate.
- [ ] No deployment until migration and application versions are compatible.

### Stage 6 — visual polish and wedding acceptance

- [ ] Figma documentation and high-fidelity responsive screens.
- [ ] Invitation image optimization, motion and audio testing.
- [ ] Real phones/tablets, camera permissions and weak-network scenarios.
- [ ] Accessibility, empty/error states and larger guest lists.
- [ ] Reception rehearsal with duplicate scans, partial arrivals and extra guests.
- [ ] Release checklist and operational handoff.

## 14. Tests actually run and their limits

Earlier checkpoint:

- Production build passed, including TypeScript.
- Standalone TypeScript check passed earlier.
- Lint passed with nine raw-image optimization warnings.
- Dependency audit reported no vulnerabilities at that time.
- Browser inspection covered the editor fixture at desktop and mobile widths only.

Latest model checkpoint:

- node scripts/verify-database.mjs passed after formatting.
- New party-model suite covered atomic rollback on invalid legacy data; party/token preservation; named/unnamed totals; pending/declined states; partial/extra arrivals; undo; immutable identity; allocation and duplicate constraints; owner/anonymous isolation; direct-write denial; cascade cleanup.
- Earlier database regressions also passed: token privacy, invalid links, seat limits, RSVP save/throttle/closure, draft privacy, optimistic arrival conflict and email rate limits.
- npm run lint passed with zero errors and the same nine warnings.

PGlite is an isolated, disposable PostgreSQL environment with test stand-ins for Supabase platform schemas/crypto. It does not prove hosted Auth/Storage behavior, real simultaneous staff sessions, SMTP delivery, camera operation or production end-to-end functionality.

Build was not rerun for the SQL-only model checkpoint. No tests are being represented as newly run during this documentation task.

## 15. Figma handoff — for later

The existing Notion design hub identifies a canonical Figma file with six desktop lo-fi surfaces. This document links that file; its current contents were not independently inspected today.

Keep the existing file/history. Add new pages or explicitly label superseded frames rather than silently replacing the older MVP.

Recommended Figma pages:

- **00 Read me:** current scope, status legend, Notion link and screen index.
- **01 Foundations:** typography, palette, spacing, layout, accessibility and motion principles.
- **02 Components:** navigation, buttons, inputs, status badges, cards, tables, dialogs, uploader, device preview, music control, QR pass.
- **03 Dashboard:** overview, content tabs, saved preview, parties/members, seating, messages, email, settings.
- **04 Reception:** scan/search, party detail, partial arrival, already-arrived, undo, extras, camera/network failures.
- **05 Invitation:** opening, hero, couple, story, events, gallery, details, RSVP, pass and closing.
- **06 Responsive and states:** mobile/tablet variants and the complete state inventory.
- **07 Flows and handoff:** end-to-end journey, annotations and component-to-code mapping.
- **Archive:** earlier lo-fi/superseded directions, clearly labeled.

Use the existing naming convention: Screen / Device / State, with ordered screen prefixes. Start with the approved data flow and critical mobile RSVP/reception states before polishing decorative screens.

Figma acceptance: every important control maps to an implemented action or is explicitly labeled planned; mockups do not imply live delivery, offline writes or staff authorization that has not been built.

## 16. Decision log and unresolved choices

### Approved / established

- Incremental implementation; preserve existing work.
- Party plus optional named members; unnamed seats remain first-class.
- Separate personal invitation and reception tokens.
- Premium warm wedding dashboard and expressive mobile-first invitation.
- Keep the supplied opening direction.
- Checkpoints between major stages.
- No live migration implied by model approval.

### Current implementation choices, not permanent product promises

- Next.js App Router, React, Tailwind, GSAP and Supabase remain the foundation.
- SMTP adapter avoids tying product logic to one provider.
- Saved-data preview rather than unsaved live preview.
- Private RSVP wishes rather than public guestbook.
- Retain removed media objects until a safe cleanup strategy exists.
- No queued offline arrival writes.

### Still to settle before dependent work or release

- Staff roles, permissions and access lifecycle.
- Final allocation/extra-seat mutation semantics.
- Party-level summary labels for partial RSVP.
- Token rotation and revocation.
- Durable check-in audit/undo history and retention.
- Sender/provider configuration, webhook integration and resend attempt history.
- Public guestbook moderation if desired.
- Media cropping, video support, storage cleanup and rights.
- Wedding timezone and event-specific visibility rules.
- Operational offline contingency and data export/privacy handling.

Do not ask the user to reapprove the already-approved party/member model. Ask when a new expensive-to-reverse decision genuinely changes the approved approach.

## 17. Repository map and resume instructions

Local workspace: D:/External/WrittenDearly. Paths below are local repository references, not public web links.

Key records:

- docs/production-audit.md — original audit; its simpler count-only recommendation is superseded by approval and checkpoint 02.
- docs/checkpoint-01.md — broad local implementation draft and historical approval blockers.
- docs/checkpoint-02.md — approved model foundation, test results and cutover requirements.
- supabase/production_upgrade.sql — unapplied upgrade proposal.
- supabase/party_model.proposal.sql — local design/test fixture, not deployable migration.
- scripts/verify-database.mjs — isolated database regression runner.
- scripts/verify-party-model.mjs — model-specific tests.

Key implementation areas:

- src/app/dashboard — pages and server actions, including guest-actions.ts and email-actions.ts.
- src/components/dashboard — editor, preview, uploader, guest list, reception/scanner and email studio.
- src/app/i and src/app/preview — public invitation and owner preview routes.
- src/components/templates — classic invitation, opening, RSVP, gallery, motion, music/pass-related presentation.
- src/lib — invitation validation/theme, Supabase types/session helpers, email adapter/templates and CSV logic.
- src/app/dev/review/page.tsx — development-only fixtures.
- public/invitation-art — opening assets.
- zip-review — extracted reference project; excluded from checks, not deleted.

Resume protocol:

1. Read this page and checkpoint 02.
2. Inspect current git status and relevant current files; do not reset, restart or redo completed work.
3. Read the project AGENTS.md and relevant bundled Next.js guides before Next.js code changes.
4. Continue Stage 3 locally; protect user changes and keep changes scoped.
5. Test and report exactly what passed, failed and remains unverified.
6. Document each checkpoint and separately obtain live migration approval.

Suggested next-session prompt: “Continue Written Dearly from checkpoint 02 and the Notion second brain. The party-plus-optional-members model is approved. Implement and test the local transactional member-aware operations next, preserving existing work. Do not apply live Supabase changes without separate approval.”

## 18. Maintenance and definition of done

At each checkpoint, update the date, completed work, changed files, tests actually run, known failures, approvals and exact next step. Keep planned behavior visibly separate from shipped behavior. Do not copy secrets or real guest details into this document.

The product is wedding-ready only when the complete personal invitation → RSVP → QR → reception journey works against the intended environment, private guest data is protected, staff can handle real exceptions, media/music work on phones, emails are accurately tracked, and the couple has a clear operating handoff.

No automation, background schedule, Figma edit, live database mutation or deployment was created as part of this documentation request.


