# Simplified invitation product — 8 October 2026

User-authorized scope: choose a design, edit the invitation, add guests and phone numbers, set companion allowances, share through WhatsApp, collect RSVP, share a wedding-day QR pass, scan and confirm arrivals. Refine invitation aesthetics later. This supersedes the broader navigation and visual direction in Review 01, preserving that history.

## Flow and boundaries

1. Home explains the next useful step.
2. Invitation starts with a design catalogue, then essentials, events, optional story/photos/music/details, and publishing. Only implemented, active designs can be selected. The second user-owned design is forthcoming; do not invent it.
3. Guests holds contact details, one personal invitation per party, and total reserved places. One invitee with +2 means three places. Households may keep total-place allocation. Preserve the approved optional named/unnamed member model; do not apply the local member proposal or change live schema.
4. WhatsApp opens a reviewed message for manual sending. Never infer sent/delivered from opening the app. Require a country-code phone number and a published, publicly reachable invitation link. Localhost links are review-only.
5. RSVP records the attending total bounded by allocation. The existing aggregate response interface remains until the separately tracked member-aware backend cutover; no claim of individual companion identities.
6. Wedding-day messages are available for attending parties, link to their QR section and offer a downloadable QR image to attach manually. No automated media sending or second confirmation database state is implied.
7. Check-in searches/scans the same party, then asks the operator to confirm arrivals. Separate reserved, RSVP confirmed, checked in and confirmed still expected. Compute remaining per party so walk-ins cannot subtract from other parties' expected arrivals. Checked in is cumulative, not current occupancy.

Primary navigation: Home, Invitation, Guests, Check-in. Settings is secondary. Existing seating, wishes and email screens remain accessible under additional tools.

## Visual and interaction rules

Neutral white/cool-grey dashboard, charcoal text, restrained blue actions, sans-serif headings, compact headers and consistent controls. Preserve the existing guest invitation design. One next action on Home; optional editor sections grouped below essentials. Clear saved/draft/published language.

Keep loading, empty, no-match, failure and saved states. Preserve entered values after failed saves. Never auto-check-in on scanning. Unknown codes, duplicate arrivals, offline status and concurrent edits must be explicit. QR is a party lookup credential; check-in still requires owner authorization.

## Checkpoints

- Isolated fictional wireframe: `design-review/simple-flow/index.html`.
- No deployment, real message sending, live migration, provider setup or new staff role in this work.
- Existing production upgrade and party/member proposal remain unapplied. Hosted end-to-end behavior cannot be claimed from previews.
- WhatsApp click-to-chat reference: https://faq.whatsapp.com/5913398998672934/
- Verification results will be appended after implementation.

## Implementation checkpoint — 9 October 2026

Completed locally:
- Four primary navigation items and guided Home; older optional tools preserved.
- Neutral dashboard styling and simpler invitation editing sections.
- Active, implemented design catalogue with authenticated template selection; Classic is the only implemented design.
- Guest contact/CSV phone support and companion allowance mapped to existing total reserved places.
- Reviewed WhatsApp invitation/wedding-day messages, local-link guard and QR download for manual attachment. No messages sent.
- Shared people-based counts, per-party remaining arrivals, search/filter/scan confirmation, duplicate count protection and explicit non-attending-party handling.
- Failed guest saves preserve form input; invitation/design save network failures surface feedback.

Validation so far: production build passed; subsequent TypeScript check passed; lint passed with zero errors and nine existing image warnings; six focused flow tests passed. Browser fixture verification covers 1440px and 390px widths, Home/empty/designs/editor/guests/check-in, local sharing guard, QR generation and +2 allocation. Final browser console check is recorded below.

Known boundaries: no new live schema, no automated WhatsApp API, no delivery tracking, no dedicated staff role, no departure tracking. The separate member-aware transactional backend cutover remains outstanding; existing aggregate RSVP storage records how many companions are coming, not their individual names. Live authenticated save, hosted RSVP persistence, camera hardware and real WhatsApp delivery have not been tested in this pass. The second user-owned invitation design still needs its source/reference.

Final browser result: PASS. Twelve rendered screen/viewport combinations had no horizontal overflow; WhatsApp local-link blocking, wedding-day QR generation and companion allocation interactions passed. React/hydration console errors are treated as failures. An initial screenshot-induced caret-style hydration warning was resolved by preserving the caret during screenshots; no production hydration workaround was added.
