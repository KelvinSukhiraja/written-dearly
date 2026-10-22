# Login design alignment — 21 October 2026

Owner requested updating the old login design to match the dashboard and using the supplied logos, including the favicon. Reuse the existing original C/M artwork, near-white canvas, white surfaces, slate text, serif titles, pale blue-grey primary actions and visible control boundaries from the current management workspace.

The responsive layout pairs a quiet brand panel with the form on desktop and stacks a compact monogram header above the form on mobile. Signup shares this presentation. Preserve authentication actions, safe login destination, field labels/autocomplete, native validation, pending submit, server error and successful redirect behavior. Form content must remain readable with reduced motion and at narrow/short viewport sizes. Derive browser icons from the original monogram rather than recreating the logo.

Implemented in the shared auth shell and scoped CSS module. The placeholder wordmark and grid have been removed from login/signup. The supplied monogram produces a three-size ICO (16/32/48px), 192px app icon and 180px Apple touch icon via `scripts/generate-brand-icons.mjs`.

Verification: production build (including TypeScript) and targeted ESLint passed. Edge checks passed login/signup at 1440, 768, 390 and 320px without horizontal overflow; original artwork, keyboard focus, safe destination and rejected external redirect, native required validation, disabled/busy pending state, server validation error and retry, icon metadata/routes and JavaScript-disabled visibility. Reduced motion was used at tablet/mobile widths. Desktop/mobile and error-state screenshots were visually inspected; evidence is in `design-review/auth-2026-10-21`. The browser script uses a fictional email and whitespace password rejected before any Supabase call. Authenticated success remains the existing redirect and was not tested with a real account.

Local implementation only, not deployed. No live schema, authentication configuration or delivery infrastructure changes.
