# Feature inventory
Discovery date: 15 October 2026. Method: static repository inspection only. No feature is verified working by this audit.

## Evidence and status
**Code-complete** means a route/UI/action path exists, not that it passes runtime tests. **Partial** means a known flow or integration is incomplete. **Reference/mock** means fictional fixture or nonpersistent interaction. **Missing** means no implementation was found in the inspected application. **Deployment unknown** means repository evidence cannot establish the current hosted state.

The current four-section scope is recorded in `docs/simplified-product-2026-10-08.md`. `AGENTS.md` supersedes historical approval gates in `docs/design-review-01.md` and `docs/figma-state.json`. Historical checkpoint results are not test results from this session. `docs/guest-workflow-2026-10-09.md` records guest changes applied on 12 October, superseding its older pending paragraphs. `docs/media-storage-2026-10-12.md` likewise records media storage applied. Neither was checked remotely.

## Architecture and persistence
- Next.js **16.3.5**, React/React DOM **19.2.8**, TypeScript strict mode, App Router under `src/app`; Tailwind CSS 4, shared CSS, GSAP and @gsap/react. Source: `package.json`, `tsconfig.json`, `src/app/layout.tsx`.
- Server Components load data; React Server Actions perform mutations. There is no `src/app/api` REST API tree. The explicit application HTTP route handler is `GET /auth/callback`.
- Supabase JS ^2.116.0 and SSR ^0.12.7 supply browser/server clients. Cookie sessions are refreshed by `src/proxy.ts` and `src/lib/supabase/proxy.ts`. `requireCouple` uses `auth.getUser()`; `requireInvitation` selects the owner's oldest invitation or creates a Classic draft. The proxy uses claims for navigation checks; it is not the sole authorization boundary.
- Authoritative persistence is Supabase PostgreSQL (invitations, guests, profile, template catalog), Auth, and Storage. Browser uploads use the publishable client and owner-folder policies. No service-role key is referenced in inspected source.
- Client state uses React useState/useMemo/useTransition/useActionState. No Redux/Zustand or persistent client data cache was found. Classic opening remembers dismissal in sessionStorage (`src/components/templates/invitation-opening.tsx`). Editor state is unsaved until submitted; preview reads saved data. Check-in refreshes every 15 seconds while visible and online.
- Other dependencies: Nodemailer 10.0.10 for SMTP, qrcode 1.5.4 for client QR generation, @zxing/browser 0.1.5 for camera decoding. @tanstack/react-table is declared; the inspected guest list implements its own table/filter/pagination. PGlite 0.3.14 is a development database test dependency.
- `zip-review/` is an extracted reference project excluded by TypeScript and ESLint, not the production application. `design-review/` contains isolated historical prototypes.

## Routes
| Route | Purpose and access | Source |
| --- | --- | --- |
| `/` | Public landing; account-aware navigation | `src/app/page.tsx` |
| `/signup`, `/login` | Email/password auth; signed-in users redirected to dashboard | `src/app/signup/page.tsx`, `src/app/login/page.tsx` |
| `/auth/callback` | Exchange auth code, redirect to sanitized local next path | `src/app/auth/callback/route.ts` |
| `/dashboard` | Owner overview, first-draft bootstrap | `src/app/dashboard/page.tsx`, `layout.tsx` |
| `/dashboard/invitation` | Seven editor sections; `?section=publish` opens publishing | `src/app/dashboard/invitation/page.tsx` |
| `/dashboard/invitation/designs` | Active supported design catalog | `src/app/dashboard/invitation/designs/page.tsx` |
| `/dashboard/preview` | Saved invitation iframe and viewport controls | `src/app/dashboard/preview/page.tsx` |
| `/preview/[slug]` | Authenticated owner-only render; optional supported `?design=` override | `src/app/preview/[slug]/page.tsx` |
| `/dashboard/guests` | Party contacts, allocations, import, sharing, RSVP management | `src/app/dashboard/guests/page.tsx` |
| `/dashboard/check-in` | Owner-operated reception search/scan/confirm | `src/app/dashboard/check-in/page.tsx` |
| `/dashboard/settings` | Profile name and invitation slug | `src/app/dashboard/settings/page.tsx` |
| `/dashboard/messages` | Owner-private RSVP wishes | `src/app/dashboard/messages/page.tsx` |
| `/dashboard/seating` | Table grouping; edit via guests | `src/app/dashboard/seating/page.tsx` |
| `/dashboard/emails` | Optional SMTP studio and delivery status | `src/app/dashboard/emails/page.tsx` |
| `/i/[slug]` | Invitation; anonymous visibility depends on published-row policy; `?guest=` adds token context | `src/app/i/[slug]/page.tsx` |
| `/dev/review`, `/dev/coastal` | Development-only fictional fixtures; production calls notFound | `src/app/dev/review/page.tsx`, `src/app/dev/coastal/page.tsx` |

## Feature inventory
All runtime checks below are pending; test IDs are in `TEST_CASES.md`.

| Feature | Implementation status | Route/component and dependencies | Static observations / required runtime verification |
| --- | --- | --- | --- |
| Landing/navigation | Code-complete | `src/app/page.tsx`; claims; `components/dashboard/sidebar.tsx` | Four main destinations, secondary tools. Verify anonymous/account CTAs, current location, mobile More menu. |
| Registration | Code-complete, provider-dependent | `components/auth/auth-form.tsx`; `dashboard/actions.ts:signUp`; Auth/profile trigger | Name/email/password; six-character minimum. No-session signup returns confirmation instruction in error UI. Verify duplicate account, provider rejection and confirmation flow. |
| Login/session/logout | Code-complete | `dashboard/actions.ts:signIn/signOut`; SSR clients; proxy | Password is trimmed, including at signup. Verify whitespace behavior, expiry, logout, return paths and malicious redirect variants. |
| Confirmation callback | Partial/provider-dependent | `auth/callback/route.ts`; exchangeCodeForSession | Callback exists; signup does not supply an explicit emailRedirectTo. Verify configured Auth email template/redirect behavior; login does not consume error query in inspected page. |
| Password recovery/account security | Missing | No reset/change-password/MFA/email-change routes found | Do not invent these journeys. Product decision required. |
| Owner authorization | Code-complete in app, DB state unknown | `lib/dashboard/session.ts`, owner-filtered actions and RLS SQL | Verify two-account isolation in browser and direct data access; no staff role implementation. |
| Invitation creation | Code-complete automatic bootstrap | `requireInvitation`; users/templates/invitations | Oldest invitation only; no create wizard/list/switcher. Read/navigation can insert profile/draft. Concurrent first visits may race. |
| Dashboard | Code-complete | `components/dashboard/home.tsx`; guestSummary and invitation theme | Guidance uses venue readiness, whereas publication requires only names/date. Verify counts and branch order for empty/draft/published. |
| Template catalog/selection | Code-complete; Coastal availability unknown | `design-picker.tsx`, `invitation/design-actions.ts:chooseDesign`; templates | Only active supported keys selectable. Classic + Coastal renderers exist; Coastal registration pending per `docs/coastal-invitation-2026-10-14.md` and SQL proposal. Verify catalog failure/empty states and content preservation. |
| Couple/cover customization | Code-complete | `invitation-editor.tsx`; `updateInvitation`; invitation columns/theme | Names, wedding date, descriptions/photos, opening message, cover/focal point. Verify persistence and both renderers; some Coastal fields have no render consumer (mapping below). |
| Events | Code-complete aggregate/event-visibility implementation | Editor; `theme.ts`; `guest.event_ids`; Classic/Coastal | Event title/date/start/end, venue/address, map URL, description, dress code/instructions. No event-specific RSVP storage. Event filtering is presentational, not confidentiality. |
| Story/milestones | Code-complete for Classic; partial for Coastal | Editor; invitation.story/theme.story_heading/story_photo_url/milestones; `classic.tsx` | Coastal does not reference story text/heading or milestones. Runtime compare selected design and identify misleading editor controls. |
| Gallery | Code-complete | Editor/media upload; `templates/gallery.tsx`, `coastal-gallery-viewer.tsx` | Up to 30 photos; alt text/reordering/removal; image failure and modal controls require verification. |
| Media storage | Code-complete, hosted setup historically reported | `media-upload.tsx`; browser Supabase Storage; `media_storage.proposal.sql` | 6 MiB input cap; images min 300px each dimension, resized max 2200px and WebP. Unique paths, no overwrite. Removing clears reference, not object. Upload is a real write before Save. |
| Music | Code-complete, browser/provider-dependent | Editor; opening; `youtube-music.tsx`; `invitations/youtube.ts` | None/upload/YouTube; URL normalized to single video. YouTube requires explicit load, external fallback. Verify activation, autoplay restrictions, switching and token referrer handling. |
| Guest information/details | Code-complete | Editor/theme.details; both renderers | Heading/body/safe link. No structured production bank-account input; verify links and empty optional content. |
| Owner preview | Code-complete | `invitation-preview.tsx`, `/preview/[slug]` | Saved data only, RSVP disabled. Supported design override is nonsaving. Verify owner access, 390/768/1280 simulations, refresh and no mutations from preview. |
| Publish/unpublish | Code-complete | Publishing tab; `updateInvitation`; invitations.published | Save is publication action; no deployment step/payment flow. Names/date required; venue not required. Verify anonymous availability before/after changes; owner can read own draft through public route. |
| Public invitation | Code-complete, RLS/RPC-dependent | `/i/[slug]`; templates index; guest_context | Generic link has no response form; personal token must be 64 lowercase hex. Query errors in base load may resemble not-found. Unknown template falls back Classic. |
| Guest add/edit/delete | Code-complete | `guest-form.tsx`, `guests-table.tsx`; addGuest/saveGuest/deleteGuest | Required name/side/international phone. Companion input +2 maps to 3 total seats. Edit is version-checked; delete is not. Verify old contacts, failed saves, stale editing and cross-owner IDs. |
| Guest list/search/pagination | Code-complete | `guests-table.tsx`; getGuests | Server reads batches of 500 into memory; browser paginates 25/50/100. Search contact/group/table; RSVP and manual-sent filters. Verify >500 rows and performance. |
| CSV import | Code-complete, additive | `guests/csv.ts`; importGuests | Required name/side/phone; optional email/group/invited_count. 1 MiB file, 1–500 rows, seats 1–100. Quote/multiline support; no duplicate merge/dedup found. Verify preview, invalid row all-or-nothing, repeated imports. |
| WhatsApp preparation | Code-complete manual handoff | `whatsapp-share.tsx`, `guests/whatsapp.ts` | Published public HTTPS origin and usable phone/token required; reviewed editable message, copy, wa.me. Opening does not send or prove delivery. Verify local/draft guards without sending messages. |
| Manual sent marker | Code-complete | markInvitationSent; guests.invitation_sent_at/version | Explicit sent/undo only, separate from delivery. Verify stale version and UI filters. |
| Aggregate RSVP | Code-complete, RPC-dependent | `classic-rsvp.tsx`; `i/[slug]/actions.ts:submitRsvp`; respond_to_invitation | Both templates share form; yes/no, 1..allocation, diet 500/message 1000. Deadline/closure checked by proposed SQL. Five-second throttle, row lock/version in SQL. Verify persistence and immediate QR render after success. |
| Guest messages | Code-complete private messages | RSVP/theme.wishes_enabled; `dashboard/messages/page.tsx` | Private wish attached to RSVP; no standalone or public production guestbook. Form hiding does not make wishes_enabled a server restriction. Verify disabling messages does not accidentally erase old message when updating RSVP. |
| Reception pass | Code-complete | `templates/reception-pass.tsx`; checkin_token | Only attending personal context renders pass; separate wd: token, downloadable PNG, table. Pass is lookup credential, not a check-in authorization. |
| Check-in/search/scan | Code-complete, hardware-dependent | `check-in.tsx`, `qr-scanner.tsx`; findReceptionGuest/confirmArrival | Scan only opens confirmation. Cumulative total, extras require note, version guard, undo all. Offline lookup only, no queued writes. Verify permissions, races, duplicate scans and attendance totals. |
| Seating | Partial/simple view | `dashboard/seating/page.tsx`; guests.table_name | Read-only grouping; edit assignment through guest form. No seat map, capacity enforcement or per-member UI. |
| SMTP email studio | Partial/external setup | `email-studio.tsx`, `email-actions.ts`, email provider/template | Optional sender config, test-to-owner, selected recipients, reservation, status/retry safeguards. Tables/RPC only in broader upgrade. No webhook endpoint found; accepted is not delivered. Verify only with approved sink. |
| Account settings | Partial/basic | `settings-form.tsx`; updateSettings | Profile name/slug editable; no password/email/delete-account UI. Two writes are nontransactional: name can persist when slug fails. Slug changes break previously shared URLs; no redirect registry found. |
| Named/unnamed members | Intended/local SQL fixture only | `party_model.proposal.sql`, `verify-party-model.mjs` | Approved model, not runtime cutover: no party_seats use in app types/actions/UI. Current responses and arrivals are party totals. |
| Coastal reference-only extras | Reference/mock | `dev/coastal/page.tsx`, `coastal-fixture.ts`, CoastalReference/ReferenceRsvp | Fictional wishes/bank account, local per-event selection and submit interception. No production public wish wall, bank copy card or per-event persistence. |
| Loading/error/empty/accessibility | Partial coverage implemented | `dashboard/loading.tsx`, `app/error.tsx`, dialogs, lists, viewers | Loading status, retry, no-match/empty, focus handling/reduced motion present. Verify with delayed/failed requests, keyboard and real viewport/zoom. No accessibility test suite found. |
| Billing, admin, staff invitations, offline arrival sync | Missing in inspected app | No corresponding routes/actions found | No payment, subscription, operator role, audit-history or offline queue journey to automate as implemented behavior. |

## Editor-to-template input alignment
The common management form saves one shared data shape; visual parity is incomplete.

| Input | Classic | Coastal production |
| --- | --- | --- |
| Names, date, cover, couple photos/descriptions | Render consumers present | Render consumers present |
| Main venue/address and event date/start/venue/address/description/instructions/dress code | Render consumers present; generated map fallback from address | Render consumers present; explicit map URL required for map button |
| Event end time | Rendered | No `end_time` consumer found |
| Opening message | Rendered | No `opening_message` consumer found |
| Story text, story heading, milestones | Rendered | No corresponding consumers found |
| Story photo | Story image | Used as an opening-photo fallback, not as a story narrative |
| Gallery, useful details, music | Present | Present with different layout |
| RSVP close/deadline/private message option | Shared ClassicRsvp | Shared ClassicRsvp |
| Public wishes, structured bank account, per-event reply | No production feature | Reference only |

Evidence: `src/components/dashboard/invitation-editor.tsx`, `src/lib/invitations/theme.ts`, `src/components/templates/classic.tsx`, `src/components/templates/coastal.tsx`. These are static mappings; verify rendered behavior with distinctive fictional values in Session 2.

## Data model and deployment evidence
| Entity | Relationships and constraints | Evidence / limitations |
| --- | --- | --- |
| auth.users → public.users | Same UUID, auth deletion cascades; unique profile email; signup trigger creates profile | `schema.sql`; requireCouple fallback inserts missing profile |
| users → invitations | user_id FK, cascade; slug unique; template_id FK restrict deletion | `schema.sql`; no unique user_id constraint; app only exposes oldest row |
| templates → invitations | Active catalog entries and component_key unique | Classic base seed; Coastal separate pending registration proposal |
| invitations → guests | invitation_id FK cascade; each row a party with total seats | Base schema has only original columns; guest workflow adds contact, tokens, version, arrivals/extras, event IDs and manual sent timestamp |
| guests → email_deliveries | Unique guest_id; invitation_id and guest_id separate FKs | `production_upgrade.sql`, broader upgrade deployment unverified; no composite FK ensuring both reference same wedding |
| auth.users → mail_rate_limits | user/minute composite key; reserve_mail_slot returns allowance <=20 | Broader upgrade only; owner can write own rate rows under supplied policy, so quota tamper resistance needs review |
| guests → party_seats; party_totals view | Optional named people per allocated seat, owner read, restricted writes | Local fixture only; not evidence of hosted rollout |
| storage.buckets/objects | Public invitation-media, UUID-folder authenticated insert | Scoped storage SQL reported applied; public object URL remains accessible for a draft/removed image |

Security history: base `schema.sql` permits reading/updating guests of published invitations and anonymous RSVP inserts. Scoped guest SQL removes these policies and revokes anon guest access, replacing it with token RPCs in an unexposed schema. Verify actual grants/RLS before any real-data testing; never apply all historical SQL files as a setup script.

## Server entry points
- `src/app/dashboard/actions.ts`: signUp, signIn, signOut, updateInvitation, addGuest, importGuests, updateGuestStatus, deleteGuest, setGuestCheckedIn, updateSettings.
- `src/app/dashboard/guest-actions.ts`: saveGuest, markInvitationSent, confirmArrival, findReceptionGuest.
- `src/app/dashboard/invitation/design-actions.ts`: chooseDesign.
- `src/app/dashboard/email-actions.ts`: sendInvitationEmail.
- `src/app/i/[slug]/actions.ts`: submitRsvp.
- `src/app/auth/callback/route.ts`: GET.
- Supabase RPC contracts: guest_context, respond_to_invitation, reserve_mail_slot. SQL bodies are repository evidence, not proof of deployed definitions.
- Legacy updateGuestStatus/setGuestCheckedIn have no imports in inspected UI; they remain exported actions and can bypass newer count/version conventions. Include direct invocation checks in Session 2.

## Existing test assets
`scripts/verify-simple-flow.test.mjs` has eight Node test cases; `scripts/verify-youtube.test.mjs` has two. Database scripts use PGlite: `verify-database.mjs`, `verify-guest-workflow-db.mjs`, and imported `verify-party-model.mjs`. Browser scripts `verify-simple-flow-browser.mjs`, `verify-guest-workflow-browser.mjs`, `verify-cm-logo-browser.mjs` load Chromium from an externally supplied module path and use Edge. `design-review/review-01/model.test.mjs` tests a separate prototype. No Playwright package/config/test script was found in the root project. No tests were executed in Session 1.
