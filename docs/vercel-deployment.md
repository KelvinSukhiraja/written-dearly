# Vercel deployment — 21 October 2026

Requested: host the existing Written Dearly application on Vercel so guests can open public HTTPS invitation links and owners can use manual WhatsApp sharing.

## Scope

Deploy the current Next.js application with existing Supabase backend. No database migrations, template registrations, SMTP setup or WhatsApp Business activation are part of this hosting step. Preserve the intentionally blank homepage; use `/login` or `/dashboard` to enter the management application.

## Project settings

- Repository: `KelvinSukhiraja/written-dearly` (for Git-based deployment).
- Framework: Next.js. Root: repository root.
- Install: `npm ci`. Build: `npm run build`. Output: framework default; do not use static export or `out`.
- Use the normal server-capable Vercel deployment: authentication, RSVP, owner actions and webhooks require the Next.js server runtime.
- `.vercelignore` excludes local secrets, dependencies, build caches, reference archives, review artifacts, SQL proposals and verification scripts from CLI uploads. It does not replace Git ignore rules or remove files from Git history.
- The local working tree contains newer WhatsApp validation/tests than the last commit. A Git import builds the pushed commit; it will not include uncommitted changes. A CLI deployment can upload the reviewed local snapshot.

## Initial environment

Set the existing values through Vercel environment settings before the build:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing hosted Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Existing browser-safe publishable/anon key |
| `APP_URL` | Final public HTTPS production origin |
| `WHATSAPP_ENABLED` | `false` |
| `WHATSAPP_TEMPLATE_APPROVED` | `false` |

Do not upload `.env.local` or copy unrelated SMTP/WhatsApp/backend secrets as part of initial hosting. The manual sharing flow needs no WhatsApp API credentials. Public-prefixed Supabase values are embedded at build time, so set them before building and redeploy after changing them.

## Auth and access

After the domain exists, review Supabase Auth Site URL and redirect allowlist for the exact production origin and `/auth/callback`. Preserve localhost entries used for development. Changes to hosted auth configuration are a separate security checkpoint under AGENTS.md; do not silently expand wildcard access. Email confirmation/auth callback paths need verification against the hosted origin.

Guest invitation routes must be accessible without a Vercel account. Verify deployment protection behavior before sharing a guest link; use the intended public production domain. Review any protection changes before applying them.

## Verification before announcing the hosted site

1. Successful Vercel build and deployment with final environment values.
2. `/` remains intentionally blank; `/login` renders and anonymous `/dashboard` redirects to login.
3. Owner login works against the intended Supabase project; inspect existing data without creating guests or sending messages.
4. Published invitation opens on the public HTTPS domain and draft/private pages remain protected.
5. Guests → Invite → Open WhatsApp becomes available for a published invitation with a valid international guest phone and token. Inspect the prepared link without sending a real message.
6. Personal RSVP, QR display and media URLs use the hosted site as intended. Real RSVP writes/check-ins or test messages require a controlled test scope.

## Current checkpoint

Vercel sign-in is required in the opened dashboard tab. No project, deployment, environment setting or Supabase Auth configuration has been changed by this preparation. The hosting request authorizes deployment; separate live schema and delivery-infrastructure approvals remain in force.

The current local production build passed on 21 October 2026, including compilation, TypeScript, page-data collection and static generation. Existing `.env.local` is ignored by Git and explicitly excluded from CLI uploads. No application source changes were needed for hosting preparation.

References: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Vercel environment variables](https://vercel.com/docs/environment-variables), [CLI upload exclusions](https://vercel.com/docs/deployments/vercel-ignore).
