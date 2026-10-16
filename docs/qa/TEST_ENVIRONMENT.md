# Test environment and Session 2 requirements
Discovery: 15 October 2026. All instructions below are proposed for a future authorized execution session. Nothing here was started, installed, configured, sent or tested in Session 1.

## Safe execution boundary
Use a dedicated Supabase test project or fully isolated local Supabase stack with synthetic data. A development Next.js server is **not** a database sandbox: `src/lib/supabase/env.ts` takes its backend from environment variables, and server actions can write there regardless of the hostname. No external calls or environment changes were made during discovery. `.env.local` exists; its values were not read.

Before execution:
1. Identify the QA project's host/ref separately from production, verify actual grants/RLS/RPCs/storage, and document its schema version.
2. Ensure QA app/process uses only QA credentials, fictional contacts and an SMTP sink. Review configuration outside logs/screenshots; never print keys/passwords.
3. Confirm a safe schema baseline with the owner. Live database/security/model/delivery changes require their separate checkpoint under `AGENTS.md`. Do not apply historical SQL indiscriminately.
4. Prepare owner A/B accounts and separate anonymous browser contexts. Keep their auth storage isolated and outside version control.
5. Restrict external network destinations; intercept wa.me/clipboard/provider links as needed. Never send real invitations or mail as part of a smoke test.
6. Record cleanup scope by synthetic run namespace and known fixture IDs. Delete only QA-created records/objects using approved QA privileges. No production cleanup.

Production risks: default navigation can insert missing profile/invitation; uploads create durable public objects before Save; guest saves/import/delete/check-in mutate data; email test mode really sends; /dev/review components reuse real actions. No browser workflow should touch current production credentials.

## Startup instructions
Repository root: `D:\External\WrittenDearly`.

`package.json` provides:
```powershell
npm run dev
```
This runs `next dev`, normally at `http://localhost:3000`. Dependencies already exist in the inspected checkout. Do not install/reinstall dependencies as part of this discovery. Verify runtime/tool availability first in Session 2. Bundled Next guide `node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md` specifies Node >=20.9. A newer Node capable of the scripts' direct TypeScript imports, or an explicitly configured loader, is needed for the existing Node tests; verify the actual local Node version then.

For production-mode route/security checks after approving execution:
```powershell
npm run build
npm run start
```
These commands were **not run**. A build may write generated files and type metadata; it belongs to Session 2, not this docs-only scope. Historical project notes report Windows sandbox path-access build failures; do not mistake that history for a current failure/pass. Build/start requires isolated backend configuration too. Dev fixtures return not-found outside development.

A loopback server suffices for editor/browser behavior, but WhatsApp sharing deliberately rejects local/insecure URLs (`src/lib/guests/whatsapp.ts`). Exercise the enabled sharing branch on a controlled public HTTPS QA origin, or a documented intercepted-origin test. A local fixture is not evidence that a hosted invitation is reachable. Camera support requires HTTPS or a browser-supported secure localhost context; real phone camera verification needs an accessible HTTPS QA site.

## Environment variables
Names only; no secret values copied or inspected.

| Variable | Required for | Notes / source |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Auth, dashboard, public data, storage | Dedicated QA Supabase URL; `src/lib/supabase/env.ts` |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase clients | Publishable frontend key with real RLS restrictions; never substitute privileged key |
| APP_URL | SMTP link generation and emailConfigured | Absolute HTTPS QA origin; not the WhatsApp origin, which comes from window.location.origin |
| SMTP_HOST | Optional email integration | Controlled sink with suitable TLS, no live delivery |
| SMTP_PORT | Optional SMTP | Default 587; string 465 selects secure transport |
| SMTP_USER | Optional SMTP | QA sink account |
| SMTP_PASSWORD | Optional SMTP | Secret, never log/store in artifacts |
| EMAIL_FROM | Optional SMTP | Approved QA sender/sink identity |

All eight names appear in `.env.example`; source usage is `src/lib/email/provider.ts`, `src/app/dashboard/email-actions.ts` and Supabase env helper. No service-role variable is referenced in app source. Auth provider configuration (email confirmation, allowed redirect URLs/email templates, policies) is external project state; inspect only in a separately authorized execution session.

`next.config.ts` restricts optimized remote images to Unsplash and one existing Supabase host's invitation-media path. A different QA Supabase host may need approved future configuration work or controlled media interception for optimized images; this session does not change it. Distinguish raw upload preview success from public next/image rendering.

## Backend baseline and drift
| Source | Purpose | How to treat in QA |
| --- | --- | --- |
| `supabase/schema.sql` | Base users/templates/invitations/guests, trigger, original policies, Classic seed | Historical foundation; unsafe as sole baseline for current guest features |
| `supabase/guests_public_rsvp.sql`, `users_insert_policy.sql`, `uuid_defaults.sql`, `storage.sql` | Earlier incremental changes | Review history; not an ordered migration runner |
| `supabase/guest_workflow.proposal.sql` | Contacts, token/version/arrival fields, manual-sent marker, owner guest policies, public narrow RPCs | `docs/guest-workflow-2026-10-09.md` records scoped application on 12 October; validate current QA equivalent |
| `supabase/media_storage.proposal.sql` | Public 6 MiB bucket and authenticated owner-folder insert | Reported applied in `docs/media-storage-2026-10-12.md`; no list/update/delete permissions needed by uploader |
| `supabase/production_upgrade.sql` | Broader guest/email/rate/storage proposal | Not an authoritative live snapshot; overlaps scoped scripts and has non-idempotent objects |
| `supabase/party_model.proposal.sql` | party_seats and totals local design/test fixture | Explicitly not deployable; exclude from runtime baseline until separately approved cutover |
| `supabase/proposals/register-coastal-template.sql` | Coastal catalog registration | Recorded pending; preview-only coverage is available without applying it |

Required runtime contracts:
- Auth users → public.users profile trigger/fallback insertion.
- Active Classic template for first draft; active Coastal catalog row only for saved Coastal selection tests.
- Invitation owner CRUD and anonymous published reads.
- Guest owner CRUD; anonymous table access denied; unique 64-hex public and reception token defaults; version and capacity constraints.
- `guest_context(p_slug,p_token)` returns only minimal personal context for a published invitation.
- `respond_to_invitation(p_slug,p_token,p_attending,p_message,p_dietary)` enforces token, published, deadline, allocation, throttle and version increment.
- Storage insert into `userId/invitationId/randomUUID.ext`; public media URLs are intentionally publicly retrievable even for drafts.
- Optional email_deliveries, mail_rate_limits and reserve_mail_slot for sink integration. Scoped guest/media application does not prove email schema exists.

Do not use PGlite success as proof that hosted Supabase Auth/PostgREST/schema cache/extensions/storage/grants are correct.

## Test accounts and sample data
| Fixture | Required data |
| --- | --- |
| Owner A and B | Independent confirmed QA emails, passwords in secure runtime input, profiles, invitation per owner; B used for isolation |
| Fresh owner C | No profile/invitation initially where controlled; normal new confirmed signup plus confirmation-required variation |
| Anonymous guest contexts | Separate contexts for generic visitor, A party one, A party two, B party; no owner cookies |
| A invitation | Distinctive fictional names, unique run slug, future wedding, main venue and two events; draft/published variants; Classic and Coastal where catalog permits |
| Media | Local synthetic valid JPEG/PNG/WebP >=300x300, tiny/corrupt/oversized variants, small MP3/M4A/OGG; identifiable disposable object paths |
| Parties | Single seat, +2 (total 3), maximum 100, pending/declined/attending, partial response, diet/wish, assigned/unassigned tables, manual sent and unsent, partial/complete/extra arrival |
| Concurrency | Same party opened at same version in two tabs; valid pending party for guest-vs-owner race |
| Large list | 125 rows for UI page variants and >=525 for server 500-row batching; no real phone/email contacts |
| CSV | Valid BOM/quoted/multiline fixtures; invalid headers/row/quotes/email/phone/seats; duplicate batch; 500/501 rows; >1 MiB |
| Email | Owner and party sink addresses, accepted/rejected/unknown statuses; no real guest destinations |
| Tokens | Generated QA public/checkin tokens plus malformed/random/cross-wedding variants; redact from reports |
| Clock | Recorded server/device timezone, future/past/deadline boundary fixtures; current date is 15 October 2026 Asia/Jakarta, not a hardcoded future test date |

Use controlled non-deliverable contact data and intercept WhatsApp navigation. The phone validator accepts syntactic international numbers; it does not establish that an address is safe to contact. For mail delivery, use the controlled sink's real receiving addresses, not arbitrary fictional mailboxes.

## Existing tools and reuse
No dependency installation or test execution was performed.

| Asset | Reuse plan and limitations |
| --- | --- |
| `scripts/verify-simple-flow.test.mjs` | Eight node:test cases: phone, CSV, allocations/remaining counts, token links and local-share guards. Direct TS imports require compatible Node. |
| `scripts/verify-youtube.test.mjs` | Two node:test URL normalization/rejection cases. |
| `scripts/verify-guest-workflow-db.mjs` | In-memory PGlite; base schema plus scoped guest proposal; synthetic auth helpers and identities. |
| `scripts/verify-database.mjs`, `verify-party-model.mjs` | In-memory PGlite SQL regression and future member model fixtures; broader SQL differs from currently reported scoped deployment. |
| `scripts/verify-simple-flow-browser.mjs`, `verify-guest-workflow-browser.mjs`, `verify-cm-logo-browser.mjs` | Ad hoc Playwright Chromium/Edge scripts; load module from process.argv[2], use localhost fixtures and write screenshots outside docs/qa. Review selectors and side effects before reuse. |
| `design-review/review-01/model.test.mjs` | Historical prototype model checks; not production E2E proof. |
| Root package scripts | dev/build/start/lint; no test or E2E script. ESLint and TypeScript can support Session 2 after authorization. |

**Playwright is not configured as a repository test framework:** no root package dependency, Playwright config, test directory/runner script was found. Ad hoc scripts assume an external Playwright module path and installed Edge. Availability is unverified. Session 2 needs an approved runtime/module path, existing browser installation and potentially a new harness/config under that session's scope. Do not silently install packages or claim that fixture scripts cover persistence.

Candidate commands for later execution after checking runtime support:
```powershell
node --test scripts/verify-simple-flow.test.mjs scripts/verify-youtube.test.mjs
node scripts/verify-guest-workflow-db.mjs
node scripts/verify-database.mjs
node scripts/verify-simple-flow-browser.mjs "<absolute-existing-playwright-module-path>"
```
These are proposals, **NOT RUN**. Review browser scripts first: they expect localhost:3000 and Edge and may use outdated selectors. The imported verify-party-model is not a separate E2E runner. Avoid scripts that contact design/documentation services; they are outside QA execution needs.

## Execution strategy and evidence
1. Inspect isolated backend/config without printing secrets. Capture exact app revision, runtime versions, schema and Auth mode.
2. Run supported isolated regression checks, then static lint/type/build checks as permitted.
3. Run all P0 owner/guest/QR journeys, privacy/isolation and concurrency first.
4. Run P1 input, persistence, integration, error and responsive cases; use HTTP/action/RPC supplements only against sandbox for trust-boundary checks.
5. Run P2 compatibility/reference and secondary usability coverage.
6. Repeat critical journeys in production-mode staging; follow with real-device camera/music/QR-save checks.
7. Record test ID, actual result, evidence, environment, fixture IDs and defect link. A mocked UI response is not database persistence evidence. A successful RPC is not browser success. An SMTP accepted status is not delivered mail.
8. Keep expected outcomes in `TEST_CASES.md`; only update status with actual execution evidence in Session 2. Block unavailable integrations honestly rather than claiming pass.

Capture screenshots and redacted traces without real names, tokens, SMTP settings or session cookies. Inspect browser consoles/network for hydration and runtime errors. Future artifacts may require scope outside docs/qa; the current session creates only these five Markdown files.

## Outstanding inputs for Session 2
- Dedicated QA backend/origin and accepted schema baseline; whether existing provisioned staging can be used.
- Two owner accounts plus confirmation-required signup inbox; authorized synthetic seeding/cleanup.
- Playwright runtime/Edge availability and permission for any missing harness work; no automatic install.
- HTTPS QA origin for enabled-sharing and mobile camera branches; sink configuration for optional email tests.
- Product acceptance for Coastal unsupported inputs, event confidentiality semantics, slug-change breakage, public-media retention and duplicate imports.
- Separate approval only if dependent work changes live schema, security, party/member model or delivery infrastructure. This document does not request or imply those changes.
