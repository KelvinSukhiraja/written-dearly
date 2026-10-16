# Guest workflow checkpoint — 9 October 2026

## Live application — 12 October 2026

User explicitly approved applying the tested guest update. Applied to WrittenDearly (`sikswvcuyhtusnxyafzj`) as `guest_workflow_contacts_sharing_rsvp`. Owner-role guest insertion, contact storage, token defaults and sent-status/version updates passed against the hosted database in a rolled-back transaction. Guest count and ID checksum remained unchanged (zero guests before and after). No invitations were sent.

Configured Supabase API verification returned HTTP 200 for the new guest-context function using an invalid fixture token (no data exposed), confirming the schema cache refresh.

Security advisor reports existing signup-trigger execute grants (`public.handle_new_user`) and disabled leaked-password protection; these are outside this migration's scope. References: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . Historical pending-approval notes below are superseded by this application checkpoint.

Authorized: repair reviewed guest workflow and choose a more suitable view for large lists.

Implementation: desktop semantic table with mobile cards; search, RSVP/manual-sent filters, sorting and 25/50/100 rows; essential guest form with additional details collapsed; required country-aware WhatsApp input; shared validation across add/edit/import/share; save and prepare invitation using the server-returned record; explicit manual sent/undo; RSVP controls separate from contact details; validated CSV preview before import.

Schema read-only inspection confirmed the hosted guests table still contains only the original twelve columns. Local proposal `supabase/guest_workflow.proposal.sql` adds contact/token/check-in fields and invitation_sent_at, restricts guest row access to owners, and exposes narrow token-based RSVP functions. It preserves existing rows and excludes email/storage infrastructure. Live application requires the separate approval required by AGENTS.md. No live schema changes or messages sent.

Design reference: preserve the existing isolated `design-review/simple-flow` prototype. New development fixture screenshots and functional test results will be recorded after verification. Guest form is used directly in the development fixture with fictional data.

Deferred: member-aware transactional cutover, automated WhatsApp delivery, bulk sending. Manual sent status is not proof of delivery. The localhost sharing guard remains active.

## Verification and handoff — 12 October 2026

Eight focused phone/CSV/allocation/sharing tests pass. The scoped SQL proposal passes an isolated PostgreSQL test for preserving legacy rows, writing contact and sent fields, stale-update rejection, owner isolation and token RSVP limits. TypeScript and focused ESLint passed. Headless Edge passed desktop/tablet/mobile (1440/768/390), letter filtering, +2 totals, conditional RSVP bounds, local-share blocking, QR rendering and draft preservation after an intentionally aborted save. Pagination, 25/100 page sizes, sent filtering and empty states passed with 125 fictional guests. Screenshots are in `design-review/guest-workflow/screenshots`.

No live save or real WhatsApp delivery was performed. Live database application is still pending separate approval. Guest mutation controls show the setup issue rather than allowing known-failing saves. Public sharing still requires a published HTTPS website. Local preview: `/dev/review?view=guests-many`.

Final 12 October verification: production build and TypeScript passed. The Windows sandbox blocked Next.js path resolution; the same build passed outside the sandbox. Notion second-brain checkpoint was updated successfully.
