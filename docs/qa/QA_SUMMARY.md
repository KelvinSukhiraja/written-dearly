# QA discovery summary
Date: 15 October 2026. Session 1: discovery and documentation only.

## Outcome and confidence
The repository contains an owner-managed wedding invitation app, with automatic first-draft creation, Classic and Coastal renderers, shared editor, manual WhatsApp preparation, party-level RSVP, private wishes, QR passes and owner-operated arrival confirmation. It also preserves secondary seating, SMTP and settings tools.

No runtime feature was verified in this session. No browser/test/build/lint process was run, no dependencies installed, no external APIs called, no credentials printed and no application/schema/environment files edited. Prior checkpoint statements are historical evidence, not fresh results. Only five Markdown documents under `docs/qa/` are deliverables.

The earlier template-alignment question is answered by static mapping: **Coastal shares the management data and core RSVP/check-in flow, but does not cover every editor input.** Story text/heading, milestones, opening message and event end time have no Coastal render consumers. Public wish wall, bank-account card and event-specific RSVP are reference-only, not production data flows. Catalog registration is separately recorded as pending. See `FEATURE_INVENTORY.md` for the full input mapping.

## Architecture
Next.js 16.3.5 App Router + React 19.2.8 + strict TypeScript; Server Components for reads and Server Actions for mutations. Supabase Auth/SSR cookies, PostgreSQL/RLS/RPCs and public media Storage provide persistence. GSAP supplies motion; qrcode/ZXing generate/read passes; Nodemailer handles optional SMTP. Client forms use React state rather than a global store. The only explicit HTTP handler found is GET /auth/callback; no REST /api tree exists.

Authentication is checked both for navigation (claims/proxy) and server data/actions (getUser/requireCouple). Owner rows and versioned party mutations supply application checks; actual database security depends on deployed RLS/grants/RPC definitions. The app selects the owner's oldest invitation rather than providing a multi-invitation UI.

## Coverage plan
**89 planned test cases; all NOT RUN.**

| Priority | Count | Rationale |
| --- | --- | --- |
| P0 | 17 | Core customer/guest/arrival journeys, authorization, guest privacy, publication boundaries and concurrent state updates |
| P1 | 57 | Validation, error/recovery, persistence, template alignment, imports/sharing, secondary integration and mobile/accessibility |
| P2 | 15 | Compatibility, content/interaction refinement, reference boundaries and product behavior characterization |
| Total | 89 | No passed or failed execution result in Session 1 |

Coverage by feature/journey:
- Auth/new customer: 10.
- Invitation editor/designs: 16.
- Guest management: 12.
- WhatsApp/sharing: 6.
- Guest RSVP/public: 12.
- Reception/attendance: 10.
- Security/data integrity: 8.
- Settings/secondary tools: 7.
- Responsive/state/reference boundaries: 8.

Run complete owner → published invitation → personal guest RSVP → owner totals → pass → lookup/confirmed arrival journeys first. Use independent browser identities, then scoped database readback to establish persistence. Supplement UI journeys with direct sandbox Data API/RPC/Server Action boundary checks; tests of only UI-hidden controls cannot prove authorization.

## Static findings and potential risks
Severity below is provisional: these are static observations or product gaps, **not runtime-confirmed defects**.

| ID | Priority | Observation and impact | Evidence | Planned verification |
| --- | --- | --- | --- | --- |
| F01 | P0 | Historical base policies allow select/update of guests on any published invitation and public guest inserts. New scoped SQL replaces them; current hosted state is unverified here. An incomplete deployment could expose guest data or permit unauthorized changes. | `supabase/schema.sql`; `guest_workflow.proposal.sql`; later applied checkpoint in `docs/guest-workflow-2026-10-09.md` | Anonymous/unrelated-owner raw table read/write, token-only response and deployed-policy audit in isolated/staging context |
| F02 | P0 | Event access is presentational: generic public invitation and published theme can reveal all events despite personalized event_ids filtering. If certain events must be secret, this is insufficient. | `src/app/i/[slug]/page.tsx` selects full invitation; `classic.tsx`/`coastal.tsx` filter only with guest context; invitations published SELECT policy | Compare generic/personal/raw data; settle display preference versus confidentiality |
| F03 | P1 | Common editor exposes fields absent from Coastal rendering; users may save content with no visible output. Coastal catalog registration remains pending in recorded scope. | `invitation-editor.tsx`, `theme.ts`, `coastal.tsx`; `docs/coastal-invitation-2026-10-14.md` | Distinctive field mapping, current catalog and design switching |
| F04 | P1 | Initial draft creation does select-then-insert without transaction/unique owner constraint; layout/pages both call the helper. Concurrent initial requests can race on deterministic slug or create errors. | `src/lib/dashboard/session.ts:requireInvitation`; invitations has unique slug, nonunique user_id | Concurrent first protected navigation, row count and recoverability |
| F05 | P1 | Legacy exported updateGuestStatus changes status without count/version; setGuestCheckedIn changes boolean/time without checked_in_count/version. No current UI import was found, but exports remain a mutation surface. | `src/app/dashboard/actions.ts`; newer invariants in `guest-actions.ts` | Direct action invocation against disposable rows |
| F06 | P1 | Settings updates profile then slug in separate writes; duplicate slug can leave a changed name despite overall error. Changed slug has no redirect registry and invalidates old shared links. | `dashboard/actions.ts:updateSettings`, `settings-form.tsx` | Partial-save readback, old/new personal links and stable reception code |
| F07 | P1 | Invitation update has no optimistic version check; concurrent owner editors can overwrite shared fields/theme. Party edit/arrival/sent marker do check versions; delete does not. | `dashboard/actions.ts:updateInvitation/deleteGuest`; `guest-actions.ts` | Two-tab conflict and delete/edit races |
| F08 | P1 | Add/import uses generated IDs without deduplication/idempotency. Repeated files or retry after uncertain network outcome may duplicate parties and counts. UI says imports add, not update. | `dashboard/actions.ts:addGuest/importGuests`; `guests-table.tsx` | Duplicate/repeated submission with row-count comparison |
| F09 | P1 | Message hiding is a UI flag, not an RPC condition; a crafted response can still include wish text. Hidden message/diet fields can send empty values on later RSVP updates and clear existing values. | `classic-rsvp.tsx`; `i/[slug]/actions.ts`; SQL respond body | Disable wishes or decline, then update and read prior message/diet; define intended preservation rule |
| F10 | P1 | Uploads create public objects before saving invitation, and removal/unpublication does not revoke URL access or delete objects. No automatic cleanup exists. | `media-upload.tsx`; scoped media SQL; `docs/media-storage-2026-10-12.md` | Draft/remove/unpublish object lifecycle in sandbox; privacy/retention decision |
| F11 | P1 | Optimized-image host allowlist names the existing backend explicitly. Using an isolated QA project may upload successfully but fail next/image public rendering. | `next.config.ts`; `templates/wedding-image.tsx`; `media-upload.tsx` | Check QA host/image path compatibility before media E2E |
| F12 | P1 | Email studio depends on broader email schema/RPC/provider setup not established by scoped guest/media deployment. No delivered/bounce webhook handler was found. | `email-actions.ts`, `email-studio.tsx`, `production_upgrade.sql` | Missing-setup path then sink-based acceptance/failure/unknown and quota checks |
| F13 | P1 | Proposed mail rate table grants owner writes, so owner can potentially reset own quota. Delivery table has independent invitation and guest FKs without a consistency FK. | `production_upgrade.sql:mail_rate_owner/email_owner/email_deliveries` | Direct sandbox tampering/cross-reference checks; assess enforcement before external email rollout |
| F14 | P1 | Fictional development props do not isolate real actions. Fixture editor/guest saves may target current authenticated owner's real invitation through requireInvitation. | `src/app/dev/review/page.tsx`; reused dashboard components/actions | Only run against disposable owner/backend; verify fixture mutation target |
| F15 | P1 | Public load ignores query errors and lacks explicit published predicate; relies on RLS. Owner can see own draft at /i/slug, and query failure may look like not-found. | `src/app/i/[slug]/page.tsx:loadInvitation`; base invitation policy | Owner versus anonymous draft and DB-failure routes |
| F16 | P1 | All guests are fetched server-side in batches and filtered/paginated in memory; check-in caps visible matches at 40 and polls every 15 seconds. Large guest lists can create repeated load or stale selected dialogs. | `session.ts:getGuests`, `guests-table.tsx`, `check-in.tsx` | >=525 rows, page completeness, lookup refinement, polling/concurrent changes |
| F17 | P1 | No dedicated staff role, audit ledger, offline arrival queue, token rotation/revocation or member-aware runtime cutover found. Reception requires owner session; aggregate counts cannot identify individual companions. | `session.ts`, `guest-actions.ts`, `party_model.proposal.sql`, `docs/second-brain.md` | Treat as explicit scope boundaries; do not automate absent behavior as implemented |
| F18 | P2 | Auth trims passwords; confirmation-required signup is represented as error feedback. Login page does not read callback/profile error query. Auth redirect config remains external. | `dashboard/actions.ts:signUp/signIn`, `login/page.tsx`, `auth-form.tsx`, callback handler | Whitespace credentials, confirmation and callback recovery; assess UX |
| F19 | P1 | No self-contained Playwright runner/config is declared; existing browser scripts require external module path and Edge, with fixture-era selectors. | `package.json`; `scripts/verify-*-browser.mjs` | Resolve runtime, inspect scripts and establish persistence-capable harness before claiming E2E coverage |

Potential immediate RSVP/pass staleness requires a targeted check: form success uses action state while the pass is rendered from guest props. Revalidation exists, but runtime synchronization was not observed. Deadline interpretation uses device timezone in editor and timestamp checks in SQL; test multiple zones and stale forms.

Historical security advisor notes in guest/media docs mention signup-trigger EXECUTE warnings and disabled leaked-password protection. These were not checked this session; verify current configuration separately rather than reporting them as newly discovered live vulnerabilities.

## Session 2 readiness
Required: isolated Supabase/staging baseline, synthetic seed/cleanup scope, owner A/B plus signup inbox, independent guest contexts, compatible Node/Playwright/Edge runtime, HTTPS QA origin for enabled sharing/camera branches, and controlled SMTP sink if email integration is included. Confirm QA image host compatibility. Full requirements and proposed startup commands are in `TEST_ENVIRONMENT.md`.

Do not run against production because navigation, uploads, fixture controls and test emails can cause real writes or delivery. No blanket migration approval exists. Current session ends after documentation.

Product questions to resolve before dependent acceptance decisions:
1. Should Coastal hide unsupported editor fields or add render support? Is catalog activation desired in a later separately approved step?
2. Are event_ids display preferences or confidentiality requirements?
3. Should updating attendance preserve hidden wish/diet text? Does disabling wishes prohibit new server submissions?
4. Is repeated import/add allowed to duplicate parties, and how should uncertain-save retries be handled?
5. Should old invitation URLs redirect after slug changes, and should name/slug changes be atomic?
6. Are public draft media and retained removed objects acceptable under the intended privacy/retention rules?
7. What owner/staff and offline operational workflow is required for wedding day?
8. Is SMTP in release scope, and who provisions sink/provider/webhooks and delivery policy?

These questions do not block the documentation and were not used to request confirmation.

## Deliverables
- `FEATURE_INVENTORY.md`: architecture, all routes, status/dependencies, schema/server entry points and template input mapping.
- `USER_FLOWS.md`: actual customer/guest/owner Mermaid journeys, branches, failures and secondary tools.
- `TEST_CASES.md`: 89 prioritized scenarios with preconditions, steps, expected results, automation suggestion and NOT RUN status.
- `TEST_ENVIRONMENT.md`: safe startup/environment/data/tooling/integration requirements.
- `QA_SUMMARY.md`: this static audit, risk register, coverage and Session 2 handoff.
