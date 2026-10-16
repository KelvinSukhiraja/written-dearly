# End-to-end test cases
Discovery date: 15 October 2026. **All 89 cases are NOT RUN.** No inferred expected result is an observed pass.

P0: 17 release-critical journey/security/integrity cases. P1: 57 high-priority validation, persistence and recovery cases. P2: 15 compatibility/usability/characterization cases.

Each case assumes the isolated QA environment described in TEST_ENVIRONMENT.md. Browser means a suggested future Playwright-compatible E2E harness; none was installed or executed. Database readback must use scoped QA access with secrets/tokens redacted. For fault/tamper tests, act only inside the QA backend. Capture actual behavior separately where static code suggests a mismatch; expected outcomes are acceptance targets, not claims about present behavior. Missing integrations remain NOT RUN until executed; do not fabricate passing results from mocks.

## Auth / new customer
Evidence: `src/components/auth/auth-form.tsx`, `src/app/dashboard/actions.ts`, `src/app/auth/callback/route.ts`, `src/lib/dashboard/session.ts`, `src/lib/supabase/proxy.ts`.

### QA-001 — New customer through publication
- **Feature / Journey:** Auth / new customer
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Fresh QA email; confirmation mode recorded; active Classic template; clean owner namespace.
- **Steps:** Register with valid name/email/password; complete configured confirmation if required; sign in; follow design link; save names/date/venue; preview; enable publication and save; open public URL in anonymous context.
- **Expected result:** One profile and one draft become the saved published invitation; selected supported renderer displays saved content; anonymous reader can view it.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-002 — Required registration and credential validation
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Anonymous context; disposable QA email.
- **Steps:** Submit missing/whitespace name/email; malformed email; password below six characters; retry with valid values.
- **Expected result:** Invalid inputs are rejected without creating a usable account; provider errors are visible; pending prevents repeated submit.
- **Suggested automation:** Browser E2E; Auth sandbox account inspection

### QA-003 — Confirmation-required signup
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Staging Auth configured to require confirmation; controlled inbox.
- **Steps:** Sign up; inspect no-session message; attempt protected route; consume confirmation using configured email flow and sign in.
- **Expected result:** Unauthenticated user cannot enter dashboard; confirmation instructions are usable; profile/bootstrap occurs after valid authentication.
- **Suggested automation:** Browser + controlled auth inbox

### QA-004 — Duplicate account and invalid login
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Existing QA account; anonymous context.
- **Steps:** Register same email again; try wrong password and unknown email; then correct login.
- **Expected result:** Provider outcomes are displayed without crash or unintended new profile; valid login restores access.
- **Suggested automation:** Browser + Auth sandbox readback

### QA-005 — Protected routes and expired sessions
- **Feature / Journey:** Auth / new customer
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owner A session and anonymous context; all dashboard routes listed in inventory.
- **Steps:** Request each dashboard page and owner preview anonymously; expire/revoke QA session and invoke save; sign in again.
- **Expected result:** Private data/actions require valid identity; no unauthorized write; usable login/recovery path; re-authentication works.
- **Suggested automation:** Parameterized browser E2E + DB readback

### QA-006 — Logout and browser history
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner A signed in with private pages visited.
- **Steps:** Sign out; navigate Back and refresh private routes; attempt an old action from another tab.
- **Expected result:** No fresh private response or write is authorized after logout; stale UI recovers through login.
- **Suggested automation:** Multi-tab browser E2E

### QA-007 — Safe return paths and callbacks
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Anonymous context; valid and expired disposable Auth codes where available.
- **Steps:** Use next=/dashboard/guests, //external.invalid, external URL, slash-backslash and encoded variants; test callback with missing/invalid/reused code.
- **Expected result:** Only permitted same-site destination is reached; invalid codes return to login; no external redirect.
- **Suggested automation:** Browser navigation and response URL assertions

### QA-008 — Concurrent first visit bootstrap
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** New confirmed QA owner with no invitation; Classic active.
- **Steps:** Open two protected routes simultaneously; reload dashboard and query owned invitations.
- **Expected result:** Target: exactly one usable default invitation and no unhandled initialization error. Current code may race because creation is not atomic.
- **Suggested automation:** Two browser pages + DB row-count readback

### QA-009 — Profile/template bootstrap failure
- **Feature / Journey:** Auth / new customer
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable owner; controllable missing profile policy or absent Classic in isolated backend.
- **Steps:** Open dashboard with profile insert denied; repeat with no active Classic; recover setup and retry.
- **Expected result:** Clear failure/login state; no partial unusable invitation; retry can initialize after setup is restored.
- **Suggested automation:** Isolated backend fault fixture + browser

### QA-010 — Password whitespace behavior
- **Feature / Journey:** Auth / new customer
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Disposable account; recorded product decision for whitespace passwords.
- **Steps:** Register with leading/trailing password spaces; sign out; try exact and trimmed variants.
- **Expected result:** Document current trim behavior and require product acceptance; no claim that entered password is preserved literally.
- **Suggested automation:** Browser + controlled Auth accounts

## Invitation editor / designs
Evidence: `src/components/dashboard/invitation-editor.tsx`, `src/components/dashboard/design-picker.tsx`, `src/components/dashboard/media-upload.tsx`, `src/app/dashboard/actions.ts`, `src/app/dashboard/invitation/design-actions.ts`, `src/app/preview/[slug]/page.tsx`, `src/lib/invitations/theme.ts`, `src/components/templates/classic.tsx`, `src/components/templates/coastal.tsx`.

### QA-011 — Save persists all supported invitation content
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owner A draft; fictional values and supported local images.
- **Steps:** Fill each editor section with distinct values; save; reload; preview Classic; inspect public view after publication.
- **Expected result:** Saved fields survive reload, match supported renderer output and contain no unrelated fixture data.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-012 — Design selection preserves invitation data
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner with populated content/guests; supported active catalog rows.
- **Steps:** Select another available design; reopen editor/guests; preview; reopen after refresh.
- **Expected result:** Only template_id changes; content, slug, guests, tokens and responses remain intact.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-013 — Catalog empty/error/inactive/unsupported
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Isolated catalog variants; owner signed in.
- **Steps:** Open designs with no supported active entries and with read failure; forge selection of inactive, unknown and another invalid ID.
- **Expected result:** Appropriate empty/error UI; selection rejected; previous template remains saved.
- **Suggested automation:** Browser + controlled catalog responses + DB readback

### QA-014 — Coastal preview before catalog registration
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Coastal renderer exists; no Coastal catalog row.
- **Steps:** Open designs; open Coastal preview with owner details; return to editor and query template_id.
- **Expected result:** Coastal is preview-only; no false Use action or persistence; owner preview works without registration.
- **Suggested automation:** Browser + DB readback

### QA-015 — Shared editor versus Coastal field coverage
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner with unique opening message, story/heading/photo, milestones and event end time.
- **Steps:** Save fields; compare Classic and owner Coastal design override; record every missing output.
- **Expected result:** Acceptance target: visible input scope is honest for selected design. Expect static gaps for Coastal opening/story/milestones/end time; capture as defects or explicit scope decisions.
- **Suggested automation:** Browser rendered-content assertions + screenshots

### QA-016 — Saved preview and unsaved draft
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner with saved name X; editor open.
- **Steps:** Change to Y without saving; open saved preview; return; save; refresh preview; try supported design override.
- **Expected result:** Preview initially shows X and then Y after save/refresh; override does not change stored design; dirty/saved labels are accurate.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-017 — Publishing minimum fields and date validation
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner draft; anonymous reader context.
- **Steps:** Try publishing without each required name/date; bypass HTML with malformed date/theme JSON; then publish with minimum valid names/date but no venue.
- **Expected result:** Invalid requests fail without publication; minimum valid request follows actual names/date rule; absent venue has honest fallback.
- **Suggested automation:** Browser + browser-origin action tampering + DB readback

### QA-018 — Unpublish revokes anonymous access and RSVP
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Published invitation with personal token; anonymous guest tab open.
- **Steps:** Unpublish and save; refresh generic and personal links; submit previously loaded RSVP; republish valid draft.
- **Expected result:** Anonymous draft access and RSVP writes are denied; republishing restores intended availability; owner preview remains authorized.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-019 — Published edit becomes public
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Published invitation; anonymous context.
- **Steps:** Edit venue/name and save; refresh public page; verify updated saved values and no duplicate invitation.
- **Expected result:** Save updates guest-visible data without another release step; public response is current.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-020 — Theme validation and list limits
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable invitation with theme arrays and unsafe URL values.
- **Steps:** Submit >30 gallery/events/details/milestones, malformed entries, unsafe javascript/http/protocol-relative URLs and extreme focal points.
- **Expected result:** Server parser applies recorded limits/filters and clamps crop; unsafe links do not execute; no silent loss of earlier valid data beyond documented rules.
- **Suggested automation:** Browser action tampering + saved-theme inspection

### QA-021 — Upload-save-remove lifecycle
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner; disposable bucket; valid image/audio.
- **Steps:** Upload valid photo; inspect unsaved preview; save; reload public view; remove reference and save.
- **Expected result:** Upload is real object creation; Save persists reference; removed image disappears from invitation while retained object behavior is documented.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-022 — Upload invalid, oversized and failing media
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner; tiny, corrupt, wrong-MIME and >6 MiB files; denied Storage request.
- **Steps:** Try each file; abort an upload; retry valid file; attempt Save while upload is busy.
- **Expected result:** Invalid files are rejected; image below 300x300 rejected; failure shown; no false saved state; Save blocked during upload; successful retry preserves form state.
- **Suggested automation:** Browser file upload + network faults + Storage sandbox readback

### QA-023 — Music selection and YouTube privacy
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner with uploaded song; test YouTube ID; external traffic intercepted.
- **Steps:** Switch none/upload/YouTube; save/reload each; enter spoofed/playlist URL; load then close player in public view.
- **Expected result:** Only selected source plays; invalid YouTube cannot save; no YouTube connection before load; iframe close stops playback; token/path absent from referrer.
- **Suggested automation:** Browser + network interception; approved real provider check separately

### QA-024 — Invitation save failure and dirty state
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner editor with unsaved values.
- **Steps:** Fail/abort save; inspect input and dirty/error messages; retry after reading current DB state; reload after confirmed success.
- **Expected result:** Entered data stays available; no premature success; confirmed data survives reload; ambiguous commit is resolved before retry.
- **Suggested automation:** Browser fault injection + DB readback

### QA-025 — Editor optional sections and reordering
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Owner with empty optional content.
- **Steps:** Add/remove/reorder gallery; add/remove events/details/milestones; change cover focus/reset; save/reload.
- **Expected result:** Order, crop and valid optional data persist; empty sections have intentional fallback; accessible labels remain useful.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-026 — Dirty navigation and concurrent editor saves
- **Feature / Journey:** Invitation editor / designs
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Two owner tabs editing same invitation.
- **Steps:** Change unsaved fields; navigate internal link and reload; then save different fields from both tabs.
- **Expected result:** Record unload prompt and internal-navigation loss behavior; acceptance target: no silent unexpected overwrite. Invitation has no version guard, so lost-update risk must be demonstrated.
- **Suggested automation:** Two-tab browser E2E + final record readback

## Guest management / owner
Evidence: `src/components/dashboard/guest-form.tsx`, `src/components/dashboard/guests-table.tsx`, `src/app/dashboard/actions.ts`, `src/app/dashboard/guest-actions.ts`, `src/lib/guests/csv.ts`, `src/lib/dashboard/session.ts`.

### QA-027 — Guest to personal RSVP to owner totals
- **Feature / Journey:** Guest management / owner
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Published owner invitation; empty QA guest list; anonymous context.
- **Steps:** Add party with +2, save and prepare; obtain personal link; guest RSVPs for 2 with diet/wish; reload owner guests/Home/messages.
- **Expected result:** One party has allocation 3, response 2, private wish/diet and correct totals; personal token remains stable; confirmation follows commit.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-028 — Guest validation and country handling
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner on empty guests; synthetic phone numbers only.
- **Steps:** Try missing name/side/phone, overlong name, local/full international formats, malformed phone/email, companion -1/99/100/fraction.
- **Expected result:** Only supported normalized international numbers and allocation 1–100 save; errors preserve draft; +99 means 100 total.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-029 — Edit response and allocation boundaries
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party reserved 3; RSVP 2; no arrivals initially.
- **Steps:** Edit contacts; set pending/declined/attending; test count 0/4 and allocation below response; inspect timestamps/count after each valid save.
- **Expected result:** Valid status/count combinations persist; invalid combination rejected; response time and nullable count match state.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-030 — Cannot reduce allocation below arrivals
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party reserved 4 with 3 arrivals; current version.
- **Steps:** Try reduce allocation to 2; inspect failure, then valid reduction preserving existing arrivals.
- **Expected result:** Database rejects inconsistent capacity; entered values retained; no lost arrival/history data.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-031 — Stale owner edit after guest RSVP
- **Feature / Journey:** Guest management / owner
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owner edit modal at version v; guest context same party.
- **Steps:** Guest submits new reply; owner submits stale edit; refresh and reapply intended contact edit.
- **Expected result:** Stale write rejected; newer response/count retained; retry uses current version.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-032 — Delete guest confirmation and invalidation
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable guest with reply, token and optional sink email row.
- **Steps:** Cancel delete; then confirm deletion; reopen personal URL and scan saved reception code.
- **Expected result:** Cancel preserves record; confirmed delete removes only selected party; old personal link/pass unavailable; related rows follow configured FK.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-033 — CSV parse, preview and additive persistence
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner; CSV with BOM, quoted comma, doubled quotes, multiline group and formatted phones.
- **Steps:** Import valid file; inspect row/seat preview; cancel then reimport/confirm; reload list.
- **Expected result:** Cancel writes nothing; confirmed rows normalize phone and preserve names/group/total places; counts match preview.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-034 — CSV invalid/size/row limits
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Files: empty, missing required header, unterminated quote, invalid row, >1 MiB, 501 rows.
- **Steps:** Select each; confirm server rejects forged invalid row batch; test exactly 500 valid rows in disposable namespace.
- **Expected result:** Clear row/limit errors; invalid batch adds no partial records; 500 valid rows persist exactly once.
- **Suggested automation:** Browser uploads + action boundary checks + DB counts

### QA-035 — Duplicate add/import submission
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable guest list; same valid row/file.
- **Steps:** Submit same party twice and import same file twice; simulate double-click/ambiguous save; inspect duplicate rows and totals.
- **Expected result:** Target: no accidental duplicates or honest warning. Current code is additive and lacks dedup/idempotency; record actual behavior for product decision.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-036 — Large list/filter/pagination correctness
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** At least 525 fictional guests across statuses/manual sent markers; distinct phones/groups/tables.
- **Steps:** Traverse 25/50/100 pages; search formatted phone/name/email/group/table; combine sent/RSVP filters; change sort; inspect final record.
- **Expected result:** Server batching includes >500 records; page counts, reset/clamp and filtered results correct; no duplicate/omitted rows.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-037 — Missing schema and read failure states
- **Feature / Journey:** Guest management / owner
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Staging fixture missing guest upgrade; separate read-denied/network fault.
- **Steps:** Open dashboard and guests; try Add/Edit/Invite/Import; restore setup and refresh.
- **Expected result:** Honest setup/error state; known-failing controls disabled; read error is not represented as an empty successful list.
- **Suggested automation:** Browser + isolated schema/response variants

### QA-038 — New guest extra details and event assignment
- **Feature / Journey:** Guest management / owner
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Owner with two events.
- **Steps:** Add party with email/group/table/notes; reopen edit and choose one event; save; uncheck all and save.
- **Expected result:** Add details persist; event scope is available on edit; no selection means all; selection is not per-event RSVP.
- **Suggested automation:** Browser E2E + scoped database readback

## WhatsApp / sharing
Evidence: `src/components/dashboard/whatsapp-share.tsx`, `src/lib/guests/whatsapp.ts`, `src/app/dashboard/guest-actions.ts`, `src/components/templates/reception-pass.tsx`.

### QA-039 — Review message and manual sent status
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Published invitation on approved HTTPS QA origin; valid party token/phone.
- **Steps:** Open Invite; edit message; intercept wa.me navigation; mark sent manually; reload/filter; undo marker.
- **Expected result:** Correct encoded recipient/message/token link; opening alone does not set sent; explicit marker/version update persists; no actual message sent.
- **Suggested automation:** Browser popup interception + DB readback

### QA-040 — Share guards
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Draft/published parties; localhost, private HTTP/HTTPS and public HTTPS contexts; missing phone/token variants.
- **Steps:** Open sharing for each context; inspect copy/open controls and remedy actions.
- **Expected result:** Draft/local/private/insecure/missing-contact-or-token cases block sharing and explain remedy; public supported case enables.
- **Suggested automation:** Parameterized browser E2E; no external navigation

### QA-041 — Reception message and pass eligibility
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Pending, declined and attending parties; attending with positive count/token.
- **Steps:** Switch message tabs; download pass for attending party; inspect #reception-pass target in generated URL.
- **Expected result:** Wedding-day message enabled only with attending count/token; QR contains separate checkin token; pending/declined cannot use this sharing mode.
- **Suggested automation:** Browser + downloaded QR decode

### QA-042 — Stale sent marker and save failure
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Same party in two owner tabs.
- **Steps:** Edit party in tab B; mark sent using old version in A; simulate network failure; refresh before retry.
- **Expected result:** Conflict/error shown without false marker; newer state not overwritten; successful retry changes only marker/version.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-043 — Clipboard denial and special characters
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Published HTTPS QA origin; party name with accents, ampersand, emoji and newline message.
- **Steps:** Deny clipboard then Copy; allow and retry; inspect encoded WhatsApp message and URL.
- **Expected result:** Fallback instructions shown; text and token survive encoding; no unintended query/fragment injection.
- **Suggested automation:** Browser clipboard permission and popup assertions

### QA-044 — Slug rename after sharing
- **Feature / Journey:** WhatsApp / sharing
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Published invitation with generated personal link and valid response.
- **Steps:** Save a new unique slug; open old and new generic/personal links; scan existing pass.
- **Expected result:** New links use new slug; QR token remains same; old URL behavior documented (no redirect found). Flag breakage impact before release.
- **Suggested automation:** Browser E2E + scoped database readback

## Guest RSVP / public
Evidence: `src/app/i/[slug]/page.tsx`, `src/app/i/[slug]/actions.ts`, `src/components/templates/classic-rsvp.tsx`, `src/components/templates/reception-pass.tsx`, `src/components/templates/classic.tsx`, `src/components/templates/coastal.tsx`, `supabase/guest_workflow.proposal.sql`.

### QA-045 — Anonymous generic versus personal visibility
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Published invitation with two parties and private notes.
- **Steps:** Open generic link; open valid personal token; compare page and payload; open unknown slug.
- **Expected result:** Generic view cannot RSVP or list guests; valid party sees only intended context; unknown slug unavailable; no private notes/contact list exposed.
- **Suggested automation:** Anonymous browser + response/payload assertions

### QA-046 — Token substitution and wedding mismatch
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Two weddings and parties with distinct public/checkin tokens.
- **Steps:** Try random valid-shaped token, malformed/uppercase token, another wedding's public token, reception token as public token; submit forged mismatched slug.
- **Expected result:** No unauthorized context/write; malformed/not-found and error states disclose no other party details.
- **Suggested automation:** Anonymous browser + direct sandbox RPC checks

### QA-047 — RSVP allocation and direct-RPC bounds
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Published party reserved 3; anonymous personal context.
- **Steps:** Choose 1, 2, 3; forge 4, -1, fraction, NaN, >100 and yes with zero; test no response count.
- **Expected result:** Allowed totals persist; rejected inputs do not mutate; decline stores zero; RPC enforces allocation independently of UI.
- **Suggested automation:** Browser + direct RPC boundary requests + DB readback

### QA-048 — Closed and deadline enforced server-side
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Guest has open form; known QA server/device time; past/future deadline variants.
- **Steps:** Close RSVP or pass deadline while form is open; submit stale form/direct RPC; reopen before valid future deadline.
- **Expected result:** Closed/expired write rejected server-side; open valid reply succeeds; deadline boundary behavior recorded.
- **Suggested automation:** Browser + controlled clock/device timezone + scoped RPC

### QA-049 — Decline/update/reload confirmation
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party initially attending with diet/wish; no active rate window.
- **Steps:** Decline; reload personal page; later attend with new count; reload owner view.
- **Expected result:** Correct saved status/count, confirmation and pass eligibility; changes persist on both sides; hidden-field clearing is recorded.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-050 — Throttle and simultaneous replies
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** One party; two anonymous personal tabs; clean initial response time.
- **Steps:** Double submit and submit from both contexts within five seconds; wait beyond window and update again.
- **Expected result:** One coherent row update at a time; rapid reply rejected, no duplicate guest row; later update succeeds; versions reflect accepted writes.
- **Suggested automation:** Two-context E2E + database readback

### QA-051 — RSVP errors preserve response
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Guest form filled; controllable missing RPC, denial and network interruption.
- **Steps:** Fail submission; inspect entered attendance/diet/message; query persisted state; retry when safe.
- **Expected result:** Honest failure and retained input; no false confirmation; ambiguous commit resolved before retry.
- **Suggested automation:** Browser fault injection + sandbox DB readback

### QA-052 — Wishes disabled and message length/privacy
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party with saved wish; owner toggles wishes off; 500/1000 boundary inputs.
- **Steps:** Update RSVP after toggle; tamper message/diet lengths; open another guest page/messages as another owner.
- **Expected result:** No wish exposed publicly; length handling matches server truncation/RPC limits; capture potential old-wish erasure and server acceptance despite hidden field.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-053 — Immediate pass after RSVP and QR download
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Pending party valid personal link; both templates available for preview/runtime where registered.
- **Steps:** Submit yes; inspect confirmation and pass without manual reload; reload; download and decode QR.
- **Expected result:** Saved success followed by current pass without stale status; QR encodes wd:checkin_token only; failure offers name lookup.
- **Suggested automation:** Browser + QR download/decode + DB readback

### QA-054 — Event display preference versus confidential data
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Published invitation with two events; party scoped to one.
- **Steps:** Open personal and generic view; inspect raw invitation data and anonymous table query in sandbox.
- **Expected result:** Record actual behavior: personal display filters, generic/raw published theme can reveal all events. If confidentiality is required this is a failing security requirement, not a passed access control.
- **Suggested automation:** Browser + sandbox Data API read

### QA-055 — No external confirmation promise
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Valid personal guest; delivery traffic captured.
- **Steps:** Submit RSVP and inspect success wording plus outbound requests.
- **Expected result:** Confirmation is in-page only; no unexpected email/WhatsApp; owner state reflects response.
- **Suggested automation:** Browser + request capture

### QA-056 — Public optional and missing media states
- **Feature / Journey:** Guest RSVP / public
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Published minimally populated invitation; missing image/audio URL variants.
- **Steps:** Open both supported renderers at narrow width; expand gallery/music; force media 404.
- **Expected result:** No fabricated bank/account/wishes data; clear fallbacks and recoverable media failure; essential RSVP remains reachable.
- **Suggested automation:** Browser + media interception + screenshots

## Reception / attendance
Evidence: `src/components/dashboard/check-in.tsx`, `src/components/dashboard/qr-scanner.tsx`, `src/app/dashboard/guest-actions.ts`, `src/lib/guests/summary.ts`.

### QA-057 — Lookup-confirm-arrival lifecycle
- **Feature / Journey:** Reception / attendance
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owner with party allocation 3, RSVP 2, arrival 0 and valid pass.
- **Steps:** Search by name and scan/paste code; verify no write before confirmation; confirm total 1 then total 2; reload Home/guests/check-in.
- **Expected result:** Party arrival totals 1 then 2, not 3; booleans/timestamps/version consistent; remaining confirmed drops correctly.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-058 — Repeat scan and duplicate prevention
- **Feature / Journey:** Reception / attendance
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Party already has 2 arrivals; saved QR.
- **Steps:** Scan twice; inspect already-arrived notice; try unchanged total; reopen and confirm same total from stale tab.
- **Expected result:** No automatic increment or duplicate arrivals; unchanged primary action disabled; stale version rejected.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-059 — Extra seats with note and arrival bounds
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party allocation 2, RSVP 2; owner reception.
- **Steps:** Try total 3 without extras; extra 1 without note; then extra 1 with note; test negative/fraction/count >200/extra >100.
- **Expected result:** Invalid input rejected; valid approval stores extra/note and total; no unexplained capacity increase.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-060 — Pending/declined walk-in and remaining totals
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party A confirmed 3/unarrived; party B declined; owner session.
- **Steps:** Confirm B arrival with warning; inspect aggregate still-expected; partially arrive A.
- **Expected result:** B does not subtract from A remaining; labels distinguish RSVP and arrival; per-party max(0,confirmed-arrived) used.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-061 — Partial arrival and undo
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Party with partial arrival and extras/note.
- **Steps:** Increase cumulative total; undo all; reload; inspect count/checkin time/extras/note.
- **Expected result:** Count resets to zero with checked_in false/time null; totals update; retained extras/note behavior accurately shown.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-062 — Concurrent operators
- **Feature / Journey:** Reception / attendance
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Two owner browser contexts on same party version.
- **Steps:** Both open arrival dialog; A confirms total 1; B submits total 2 from old version; refresh B and retry.
- **Expected result:** Stale write fails without overwriting A; current-version retry succeeds; no lost/count-doubled arrival.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-063 — Offline and ambiguous commit recovery
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Loaded reception list; controllable network/offline state.
- **Steps:** Go offline; search loaded list; attempt scan/save; reconnect; abort response after server accepts save and refresh.
- **Expected result:** Offline writes disabled, no queued success; ambiguous save warns; refresh establishes actual count before retry.
- **Suggested automation:** Browser offline/network fault + DB readback

### QA-064 — Camera denied/unavailable and cleanup
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Supported camera test browser or controllable getUserMedia; manual code available.
- **Steps:** Deny permission; use unavailable device/insecure context; close scanner mid-start; use manual lookup; unmount page.
- **Expected result:** Useful fallback; no automatic arrival; camera stream stops after scan/close/navigation; lookup remains usable.
- **Suggested automation:** Browser mocked media + manual HTTPS camera check

### QA-065 — Reception code is lookup only
- **Feature / Journey:** Reception / attendance
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner A, owner B and anonymous contexts; A's public/reception tokens.
- **Steps:** Use malformed code/public token in manual lookup; use A code from B or anonymous; try direct confirmArrival with foreign ID.
- **Expected result:** No foreign lookup/write; public token not accepted as reception code; valid code never grants operator permissions.
- **Suggested automation:** Multi-context browser + action boundary checks

### QA-066 — Forty-match cap and refresh
- **Feature / Journey:** Reception / attendance
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** 125+ parties; owner at check-in.
- **Steps:** Search broad query then exact late-record name/phone/table; switch filters; wait visible online refresh and repeat hidden/offline.
- **Expected result:** 40-match notice honest; refined search finds omitted record; online refresh updates rows without count corruption.
- **Suggested automation:** Browser timers and scoped DB update

## Security / data integrity
Evidence: `supabase/schema.sql`, `supabase/guest_workflow.proposal.sql`, `supabase/media_storage.proposal.sql`, `supabase/production_upgrade.sql`, `src/app/dashboard/actions.ts`, `src/app/dashboard/guest-actions.ts`, `src/app/preview/[slug]/page.tsx`, `next.config.ts`.

### QA-067 — Cross-owner mutation isolation
- **Feature / Journey:** Security / data integrity
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owners A/B; separate invitations/guests; record baseline.
- **Steps:** From A tamper IDs for save/delete/design/email/arrival; attempt B profile/slug changes through Data API; inspect B state.
- **Expected result:** All foreign operations denied or produce zero changes; no B data returned; harmless no-op success wording recorded as issue.
- **Suggested automation:** Browser + direct authenticated sandbox requests + DB diff

### QA-068 — Anonymous guest table privacy
- **Feature / Journey:** Security / data integrity
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Published QA invitation; no guest token; publishable credentials only.
- **Steps:** Attempt guests select/insert/update/delete via sandbox Data API; repeat as unrelated owner.
- **Expected result:** No guest list or private mutation allowed; token RPC is only public response path. Legacy permissive policies must not be effective.
- **Suggested automation:** Direct sandbox RLS checks + public browser regression

### QA-069 — Storage owner isolation
- **Feature / Journey:** Security / data integrity
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owners A/B and anonymous context; disposable objects.
- **Steps:** Attempt upload into B folder as A; anonymous upload; object overwrite/list/delete; owner valid unique upload.
- **Expected result:** Unauthorized writes denied; current scoped policy permits owner-folder unique insert; public object downloads intentionally public.
- **Suggested automation:** Storage sandbox API + browser upload

### QA-070 — Public media persists outside publication
- **Feature / Journey:** Security / data integrity
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable known URL uploaded while draft; owner removes reference/unpublishes.
- **Steps:** Fetch known object URL anonymously before publish and after unpublish/removal; compare listing permissions.
- **Expected result:** Document expected public URL accessibility and retained object; no claim that unpublish revokes media. Product privacy acceptance required.
- **Suggested automation:** Anonymous browser + Storage sandbox read

### QA-071 — Draft page and owner-preview isolation
- **Feature / Journey:** Security / data integrity
- **Priority:** P0
- **Status:** NOT RUN
- **Preconditions:** Owner A draft; owner B and anonymous contexts.
- **Steps:** Open A draft /i/slug and /preview/slug in all contexts; test invalid design override and arbitrary slug.
- **Expected result:** Only intended owner can read draft/preview; other contexts get login/unavailable; nonsupported override rejected. Owner draft public-route behavior recorded.
- **Suggested automation:** Three browser contexts + RLS readback

### QA-072 — Legacy actions preserve count invariants
- **Feature / Journey:** Security / data integrity
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Disposable party with response/arrivals/version; action harness in future QA scope.
- **Steps:** Invoke exported updateGuestStatus and setGuestCheckedIn without newer forms; inspect attending count, checked_in_count and version.
- **Expected result:** Acceptance target: status/count/version remain consistent and authorized. Static code suggests older actions can bypass consistency; record defect evidence.
- **Suggested automation:** Browser-origin Server Action boundary harness + DB readback

### QA-073 — Untrusted content and error disclosure
- **Feature / Journey:** Security / data integrity
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** QA guest/content containing HTML/script strings, unsafe links and long text.
- **Steps:** Save and render names/notes/messages/details/email preview; inspect DOM and provider/SQL error responses.
- **Expected result:** Text remains escaped, unsafe URLs filtered, no script execution, credential leakage or foreign records in errors.
- **Suggested automation:** Browser payload checks + sandbox fault responses

### QA-074 — Tokens, headers and caches
- **Feature / Journey:** Security / data integrity
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Two personal contexts; request logging redacted; external destinations intercepted.
- **Steps:** Inspect document headers/metadata, history/cache reuse, outgoing links/YouTube requests and owner preview response.
- **Expected result:** Noindex/no-follow, private no-store and intended referrer policy apply; cross-guest cache reuse leaks no context; no guest token sent to third parties.
- **Suggested automation:** Browser network assertions + HTTP headers

## Settings / secondary tools
Evidence: `src/app/dashboard/actions.ts`, `src/components/dashboard/settings-form.tsx`, `src/app/dashboard/seating/page.tsx`, `src/app/dashboard/messages/page.tsx`, `src/app/dashboard/email-actions.ts`, `src/components/dashboard/email-studio.tsx`, `src/lib/email/provider.ts`, `supabase/production_upgrade.sql`.

### QA-075 — Settings persist normalized unique slug
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner and disposable unique slug.
- **Steps:** Change name and slug with spaces/punctuation; save/reload; use new public and personal links.
- **Expected result:** Normalized >=3-character unique slug and name persist; UI URL matches saved slug; former URL limitations recorded.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-076 — Duplicate slug and partial settings write
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner A/B with unique slugs; A baseline name.
- **Steps:** Change A name and slug to B slug; save; inspect profile and invitation after error.
- **Expected result:** User sees URL-taken error; acceptance target is atomic or explicit partial-save feedback. Current sequential writes can retain changed name; record actual state.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-077 — Private wishes and seating integration
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Two tables/unassigned parties; responses with wishes/diets.
- **Steps:** Update table/diet in Guests; open Seating and Messages; sort by response time; inspect empty states in clean owner.
- **Expected result:** Grouping uses saved table and correct people units; private wishes newest-first; no unintended public wall or editable seat-map promise.
- **Suggested automation:** Browser E2E + scoped database readback

### QA-078 — Email unconfigured and send guards
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** No SMTP/tracking setup; separate draft and missing-email variants.
- **Steps:** Open email studio, preview; invoke send with missing config/tracking, insecure APP_URL, draft and invalid recipient.
- **Expected result:** No send occurs; actionable configuration/validation errors; preview clearly separate from sending.
- **Suggested automation:** Browser + mocked sink and sandbox DB readback

### QA-079 — Email sink acceptance, rejection and ambiguity
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Isolated SMTP sink, approved sender, tracking tables/RPC; disposable guest.
- **Steps:** Send test to owner and confirmed selected guest; simulate acceptance, definite SMTP rejection and ambiguous network failure; inspect statuses.
- **Expected result:** Test goes only to owner; accepted not labeled delivered; definite failure retry eligible; unknown held; guest manual sent marker independent.
- **Suggested automation:** Browser + controlled SMTP sink + DB readback

### QA-080 — Email deduplication and quota integrity
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Sandbox delivery/rate rows; sink only; no live addresses.
- **Steps:** Double-send same guest concurrently; retry failed/accepted/unknown; exceed 20 reserved slots per minute; attempt owner rate-row tampering.
- **Expected result:** Only permitted retries dispatch; no duplicate accepted/unknown sends; rate limit behavior and tamper weakness documented; tracking matches sink.
- **Suggested automation:** Concurrent browser/actions + sink counts + sandbox SQL checks

### QA-081 — No delivered webhook claim
- **Feature / Journey:** Settings / secondary tools
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Sandbox email accepted by sink; no webhook integration configured.
- **Steps:** Inspect status after acceptance and page refresh; review available HTTP routes.
- **Expected result:** No fabricated delivered/bounced state; outstanding webhook integration explicitly documented.
- **Suggested automation:** Browser + route/static contract comparison

## Responsive / state / reference boundaries
Evidence: `src/components/dashboard/workspace.css`, `src/components/dashboard/sidebar.tsx`, `src/components/ui/dialog.tsx`, `src/app/dashboard/loading.tsx`, `src/app/error.tsx`, `src/app/dev/review/page.tsx`, `src/app/dev/coastal/page.tsx`, `src/components/templates/coastal-gallery-viewer.tsx`.

### QA-082 — Management mobile/tablet/desktop journey
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner data with long names and 125 rows; viewports 320/390/768/1024/1440.
- **Steps:** Navigate Home/editor/designs/guests/check-in/settings; open dialogs and mobile More; change rows and tabs.
- **Expected result:** Controls, input, save bar and status reachable; no document overflow; desktop 0.7 CSS zoom does not clip content; mobile scale usable.
- **Suggested automation:** Parameterized browser E2E + screenshots

### QA-083 — Public mobile journey in both designs
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Published fictional invitation; portrait and landscape sizes; Classic/Coastal available.
- **Steps:** Open invitation, dismiss opening, navigate menu, inspect events, submit personal RSVP and open pass; use gallery modal.
- **Expected result:** No blocked/hidden RSVP or clipped QR; focus/scroll restore after viewer/menu; text/images usable at 320px and orientation change.
- **Suggested automation:** Browser viewports + visual review

### QA-084 — Loading/empty/no-match/error recovery
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Delayed and failed reads; clean owner and populated owner.
- **Steps:** Visit dashboard routes with delays; search no-match; inspect clean lists/messages/seating; fail page load then retry.
- **Expected result:** Loading status distinct from empty/no-match/error; retry works; no misleading success or invented guest data.
- **Suggested automation:** Browser network faults + screenshots

### QA-085 — Keyboard, focus and reduced motion
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Owner and personal guest; keyboard-only and reduced-motion contexts.
- **Steps:** Tab through navigation/forms; open and Escape dialogs/gallery/menu; follow skip link; change motion preference.
- **Expected result:** Visible focus, no focus trap/leak or lost trigger focus; hidden animations cannot hide focused controls; essential journey works with reduced motion.
- **Suggested automation:** Browser keyboard/emulation + manual accessibility review

### QA-086 — Development routes inaccessible in production
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Build/start QA mode with isolated backend.
- **Steps:** Request /dev/review variants and /dev/coastal modes.
- **Expected result:** Production returns not-found; no reference wishes, bank data or test controls exposed.
- **Suggested automation:** Production-mode browser smoke

### QA-087 — Reference interaction cannot be counted as persistence
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Development isolated backend; /dev/coastal default, ?mode=preview and ?mode=empty.
- **Steps:** Use reference per-event form/gift copy/wishes; compare production preview modes; inspect DB/network.
- **Expected result:** Reference response is local only; no real per-event RSVP/public wall/bank data; production preview disables response.
- **Suggested automation:** Browser + intercepted action calls + DB readback

### QA-088 — Development fixture mutation hazard
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P1
- **Status:** NOT RUN
- **Preconditions:** Dedicated disposable owner/backend; /dev/review editor/guest controls.
- **Steps:** Record real owner rows; invoke one fixture save with synthetic values only; inspect target IDs/actions and data changes.
- **Expected result:** Fixture controls are classified accurately; no production connection allowed. Any reused action mutation is contained to QA owner and reported.
- **Suggested automation:** Sandbox-only browser + DB diff

### QA-089 — Browser/device compatibility and touch gallery
- **Feature / Journey:** Responsive / state / reference boundaries
- **Priority:** P2
- **Status:** NOT RUN
- **Preconditions:** Chrome/Edge/Firefox/WebKit where available; real iOS/Android for media/camera follow-up.
- **Steps:** Run critical owner/guest routes; touch swipe gallery; test popover/dialog/ResizeObserver, uploaded music and QR save.
- **Expected result:** Critical journey usable; unsupported camera/media gets fallback; actual device limits recorded separately from emulation.
- **Suggested automation:** Cross-browser E2E + manual real-device checks
