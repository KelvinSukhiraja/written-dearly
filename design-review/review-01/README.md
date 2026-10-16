# Review 01 · v1 · 18 September 2026

Isolated interactive wireframe, not application implementation or approved visual design.

Run from the project root: `node design-review/review-01/server.mjs`.
Open http://127.0.0.1:4173. Server listens only on this computer.
Tests: `node --test design-review/review-01/model.test.mjs`.

All data is fictional, in memory, reset on refresh. No dependencies, external assets, Supabase, email, credentials, storage, actual camera or production imports. Viewport selector sets real iframe layout widths (a wide frame may scroll horizontally on a small host window).

## Try these flows

1. Overview → Guests & RSVP → search Jamie → Open party.
2. Open Morgan Lee → RSVP → Attending for Morgan, leave guest Decide later → Save. Pending is not declined.
3. Reception → simulated Tan scan → select Jamie → confirm → undo. Alex remains arrived.
4. Select offline/conflict before entering a draft; attempted save preserves inputs and never reports success. Scenario changes themselves rerender/reset unsaved form fields.
5. Closed disables RSVP; invalid QR/camera denied provide manual search.

## Scope and deliberate gaps

This is a first review slice, not the entire Review 01 specification. Party details are read-only; per-seat unnamed RSVP controls are an explicit alternative to the proposed unnamed count control. Navigation shows only reviewable screens; Guest RSVP is a reviewer shortcut, not proposed admin navigation. Mobile navigation is a simple scrollable review strip, not a final navigation decision.

Add/import, bulk selection, sorting/pagination, contact/member editing, extras approval, per-person undo history, RSVP review step, message field, loading/timeout and complete invalid-link scenarios remain to design. No actual network/concurrency/privacy/QR correctness claims. Fictional state changes demonstrate behavior, not backend contracts. Already-arrived guest response changes need a later policy decision.

## Approval boundary

Review layout and behavior per named screen/version. No automatic approval capture. Explicit user approval precedes high-fidelity designs; separate visual/motion approval precedes production frontend changes. Figma is optional. Existing application work and database proposals remain untouched.
