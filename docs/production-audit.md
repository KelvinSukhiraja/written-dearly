# Written Dearly — product audit and implementation

Reviewed 17 September 2026: all source routes, components, server actions, styles, Supabase SQL and live database policies/buckets.

## Existing architecture

Next.js 16 App Router, React 19, Tailwind 4, GSAP, Supabase SSR authentication and Postgres RLS. Server components load the owner's first invitation; client forms call server actions. The classic template renders published content. Guests currently represent parties (one name and multiple allocated seats), not individual people. Keep this model and support partial arrivals by count; named individual seating needs a separate member model later.

## Findings

- Live Storage has no buckets. The upload code assumes `invitation-media`, overwrites a fixed path and masks all failures as missing-bucket errors. No validation, remove control or reliable persistence feedback.
- Preview is a separately implemented summary card. It cannot represent invitation behavior or responsive breakpoints.
- Published guest SELECT/UPDATE policies expose the entire guest list and allow anonymous changes. Name-based RSVP does not prove invitation ownership and ignores allocated seats.
- Check-in totals mix party and person counts; boolean state cannot represent partial arrivals. No scan, concurrency protection or staff notes.
- Homepage corner borders come from `.wd-frame` pseudo-elements; grid decoration reinforces the prototype appearance. Inline wordmark links create inconsistent line boxes.
- Invitation theme already stores gallery/events, but the editor does not write them. No music, email, token, seat, dietary or delivery model.
- `zip-review` is an extracted reference project accidentally included in lint/TypeScript. Exclude it without deleting user files.
- Type errors in optional GSAP `contextSafe`. Hosted font downloads make offline builds dependent on Google.
- Guest loading assumes the default API row limit; CSV splitting does not support quoted values. Destructive row actions lack confirmation.

## Structure

Overview; Invitation (couple, events, story, media, details, music, publishing); Preview; Guests & RSVP; Seating; Wishes; Email invitations; Reception; Settings. Keep content editing organized into focused tabs with a single explicit save. Preview uses the actual saved invitation in an isolated iframe, including the opening and real breakpoints; preview RSVP never writes.

## Data and API plan

Extend existing parties with email, phone, table, diet, notes, separate random invitation/check-in tokens, event access, partial arrival count and optimistic version. Owner RLS protects the table. Narrow token-authorized functions return only guest-facing fields and update RSVP within seat/deadline limits. Check-in is owner-authorized and detects concurrent updates. Email attempts are tracked separately; SMTP is provider-neutral and acceptance is not represented as delivery. No email sends during implementation.

## Verification

Run lint, TypeScript and production build. Verify anonymous guest isolation, invalid token, over-limit RSVP, closed RSVP, draft invitations and check-in conflicts in rolled-back database tests. Exercise desktop/mobile preview and upload states. Real camera and mail delivery require device/provider acceptance testing. Do not label untested flows as production-certified.
