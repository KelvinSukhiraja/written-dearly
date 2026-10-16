# User flows
Discovery: 15 October 2026. All journeys below require runtime verification. Diagrams describe the inspected code, not observed successful executions.

## A. New customer
Registration does not lead to a dedicated creation wizard. The first protected page calls requireInvitation, which creates a draft with the active Classic template. Design selection is then optional; Home guides toward designs when details are incomplete.

```mermaid
flowchart TD
  A["Landing /"] --> B["Create account /signup"]
  B --> C{"Auth accepts registration?"}
  C -->|No| D["Validation/provider error; correct input"]
  D --> B
  C -->|Yes| E{"Session returned?"}
  E -->|No| F["Confirm email through configured Auth flow"]
  F --> G["Login /login or code callback /auth/callback"]
  E -->|Yes| H["/dashboard"]
  G --> I{"Session valid?"}
  I -->|No| J["Login error or invalid callback"]
  J --> G
  I -->|Yes| H
  H --> K["requireCouple: load/create profile"]
  K --> L{"Oldest owner invitation exists?"}
  L -->|Yes| M["Load existing invitation"]
  L -->|No| N["Find active Classic and insert draft"]
  N --> O{"Template / insert succeeds?"}
  O -->|No| P["Error boundary; retry after setup review"]
  O -->|Yes| M
  M --> Q["Choose design /dashboard/invitation/designs"]
  Q --> R{"Active supported catalog row?"}
  R -->|No| S["Empty/error or Coastal preview-only"]
  S --> T["Continue editing current design"]
  R -->|Yes| U["Save template selection"]
  U --> T
  T --> V["Edit couple, events and optional content"]
  V --> W["Save draft"]
  W --> X{"Validation / save succeeds?"}
  X -->|No| Y["Retain edits and show failure"]
  Y --> V
  X -->|Yes| Z["Preview saved invitation"]
  Z --> AA["Publishing: enable availability and save"]
  AA --> AB{"Names and wedding date valid; write succeeds?"}
  AB -->|No| Y
  AB -->|Yes| AC["Published /i/slug; add guests and prepare personal links"]
```

Dependencies: Supabase Auth, public.users trigger/fallback insert, active Classic row, invitations owner policies, media bucket for uploads. `src/lib/dashboard/session.ts` is called by the dashboard layout and pages; concurrent initial navigation is a bootstrap race to test. There is no exposed multiple-invitation switcher.

Conditional behavior:
- Email-confirmation setup is external. Signup returns an informational message as an error result when no session exists; do not assume the callback receives a valid code.
- A design can be previewed with `/preview/[slug]?design=coastal` without saving its selection. The Coastal catalog insert is recorded as pending, so its selectable branch is conditional.
- Editor tabs: Couple & cover, Events, Our story, Gallery, Guest information, Music, Publishing. Save does not enforce complete events or venue; only names/date are required when publishing.
- Preview opens saved data, not current unsaved edits. It disables submissions and requires ownership. Supported design override does not change data.
- On an already published invitation, Save immediately changes guest-visible content. Unchecking availability and saving returns it to a draft.
- The template compatibility gaps are listed in `FEATURE_INVENTORY.md`; a completed editor field may not be visible in Coastal.

Sources: `src/app/dashboard/actions.ts`, `src/app/dashboard/invitation/design-actions.ts`, `src/components/dashboard/home.tsx`, `src/components/dashboard/invitation-editor.tsx`, `src/app/preview/[slug]/page.tsx`.

## B. Wedding guest
The generic public URL is view-only for RSVP purposes. A guest needs the party's personal bearer token; no guest account or public guest registration exists.

```mermaid
flowchart TD
  A["Open /i/slug"] --> B{"Invitation visible through RLS?"}
  B -->|No| C["Not found / unavailable"]
  B -->|Yes| D{"guest query token supplied?"}
  D -->|No| E["Generic invitation; ask for personal link to reply"]
  D -->|Yes| F{"64-character lowercase hex?"}
  F -->|No| C
  F -->|Yes| G["guest_context slug + token RPC"]
  G --> H{"Matching published invitation and party?"}
  H -->|No| C
  H -->|RPC failure| I["Temporary failure; retry"]
  H -->|Yes| J["Personal greeting, event filtering and party allocation"]
  E --> K["View names, events, gallery, details and optional music"]
  J --> K
  K --> L{"Personal guest and RSVP open?"}
  L -->|No| M["Personal-link guidance or closed/deadline notice"]
  L -->|Yes| N["Choose yes/no; count if yes; optional diet and private wish"]
  N --> O["Submit server action"]
  O --> P{"Valid token, allocation, deadline and throttle?"}
  P -->|No| Q["Error; preserve entered response"]
  Q --> N
  P -->|Yes| R["RPC saves party reply and increments version"]
  R --> S["Saved confirmation"]
  S --> T{"Fresh context says attending?"}
  T -->|Yes| U["Reception pass; save QR PNG"]
  T -->|No| V["No reception pass"]
  S --> W["Reopen later to review/update same party reply"]
  W --> L
```

Important verification points:
- A generic page reveals the invitation's event details. `event_ids` filtering depends on personal context and cannot enforce secret event information: raw published invitation theme and generic rendering remain readable. Treat access labels as display preferences unless a new security requirement is approved.
- Classic and Coastal reuse ClassicRsvp and submitRsvp; production records one party attendance total, not individual names or per-event replies.
- The SQL RPC rejects unavailable invitation, invalid/mismatched token, excess count, closed/deadline response and rapid updates within five seconds. This is the repository contract; deployed definitions are unknown.
- Confirmation is an on-page status, not an automated email/WhatsApp notification. Immediate post-submit refresh of the guest context and pass must be verified; do not assume the success banner guarantees a freshly rendered pass.
- Wishes are private to the owner dashboard. Public wall, bank card and local per-event form in the Coastal reference are not this journey.
- Declining maps to count zero. Hiding the optional message/diet fields may submit empty values and overwrite prior data; test existing replies when changing settings/status.

Sources: `src/app/i/[slug]/page.tsx`, `actions.ts`, `src/components/templates/classic-rsvp.tsx`, `reception-pass.tsx`, `classic.tsx`, `coastal.tsx`, `supabase/guest_workflow.proposal.sql`.

## C. Invitation owner
Guest setup can happen before publication; sharing is guarded by published status and public HTTPS origin.

```mermaid
flowchart TD
  A["Login and open Home"] --> B["Guests /dashboard/guests"]
  B --> C{"Guest setup available?"}
  C -->|No| D["Setup issue; mutation controls disabled"]
  C -->|Yes| E{"Add, import or edit?"}
  E -->|Add| F["Name, side, country-aware phone, companions"]
  E -->|Import| G["CSV validation and preview; confirm additive import"]
  E -->|Edit| H["Contact, RSVP, table, notes, event display scope"]
  F --> I["Save; return server guest row"]
  G --> I
  H --> J{"Expected version still current?"}
  J -->|No| K["Conflict; refresh without overwriting newer row"]
  J -->|Yes| I
  I --> L["Review editable WhatsApp message"]
  L --> M{"Published + public HTTPS + phone + token?"}
  M -->|No| N["Publish / fix contact / use hosted site"]
  N --> L
  M -->|Yes| O["Open WhatsApp for manual send"]
  O --> P["Optionally mark sent explicitly"]
  P --> Q["Review replies, private messages and totals"]
  Q --> R["Update invitation; preview saved changes"]
  R --> S["Save immediately affects published page"]
  Q --> T{"Attending party?"}
  T -->|Yes| U["Prepare wedding-day QR message / download pass"]
  T -->|No| V["Reception can still handle pending/declined walk-in"]
  U --> W["/dashboard/check-in"]
  V --> W
  W --> X["Scan QR, paste code or search loaded party list"]
  X --> Y{"Valid wedding code / matching party?"}
  Y -->|No| Z["No match, camera error or other-wedding message"]
  Z --> X
  Y -->|Yes| AA["Review prior total, allocation, RSVP, table and notes"]
  AA --> AB["Enter cumulative arrivals; extras need note"]
  AB --> AC{"Online, valid capacity and current version?"}
  AC -->|No| AD["No confirmed write; recover/refresh before retry"]
  AD --> AA
  AC -->|Yes| AE["Confirm arrival or undo all"]
  AE --> AF["Refresh totals; monitor people still expected"]
  AF --> X
```

Rules and failure paths:
- +2 companion allowance means three reserved people total; it is distinct from extra seats approved at reception.
- Import adds records and does not update matches. Repeated file submission can create duplicate parties. Delete confirms removal and invalidates that party's RSVP/pass.
- Manual sent status is independent of opening WhatsApp, RSVP and SMTP acceptance.
- RSVP and edit operations share guest version; stale owner edit after guest reply must fail. Deletion and legacy actions lack equivalent version guards.
- Check-in displays at most 40 matches; refine search to locate other parties. Guest list pages offer 25/50/100 rows while server fetches all guests in 500-row chunks.
- Scan does not mutate attendance. ConfirmArrival stores a cumulative total, not an increment; repeated scan should not duplicate people. Pending/declined parties display a warning and require operator judgment.
- Offline status allows lookup of already loaded rows; no queued writes or attendance synchronization. A save interrupted after server commit requires refresh before retry.
- Metrics: reserved seats, confirmed people, arrived people, remaining confirmed per party, and pending party count. Walk-ins must not subtract from another party's remaining arrivals.
- Reception operator is the owner session. No delegated staff provisioning or durable arrival audit log was found.

Sources: `src/components/dashboard/guests-table.tsx`, `guest-form.tsx`, `whatsapp-share.tsx`, `check-in.tsx`, `qr-scanner.tsx`, `src/lib/guests/summary.ts`, `src/app/dashboard/guest-actions.ts`.

## D. Secondary tools
- Settings → edit profile name/slug → two sequential database writes → saved/error. Name can commit when duplicate slug fails; old URLs have no redirect feature.
- Guests → table assignment → Seating groups parties by table; no drag/drop or seat capacity editor.
- RSVP wish → Messages shows private nonempty wishes newest-first; no separate moderation/publication path.
- Email studio → preview → optional test-to-owner or confirm selected sends → reserve_mail_slot → reserve delivery row → SMTP → accepted/failed/unknown. A provider accepting a message is not delivery confirmation; no webhook implementation was found. Use a sink in Session 2.
- Development fixtures → review visual states only. Coastal ReferenceRsvp intercepts submit and never persists. Some /dev/review controls reuse real server actions and can mutate the authenticated owner's real invitation; do not assume fictional props make them a sandbox.

## Model boundary
Optional named/unnamed members are an approved future model represented by `supabase/party_model.proposal.sql`, not an implemented customer journey. Keep it separate from the current aggregate interface; no live schema/model changes are part of this plan.
