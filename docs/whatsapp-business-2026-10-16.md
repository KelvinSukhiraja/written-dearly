# WhatsApp Business API — 16 October 2026

Requested: automated invitation sending using Meta Cloud API. Account and number are ready; invitation template is pending.

## Local implementation contract

- Preserve manual sharing. Add an API panel to the existing invitation preparation dialog.
- Proposed template `wedding_invitation`, positional body parameters: guest name, couple names, reserved places, full personal HTTPS link. No header or buttons in this first contract. Final approved template must match before activation.
- Owner reviews the exact rendered template and saved recipient and confirms permission to contact that recipient over WhatsApp.
- Server loads authoritative guest data, verifies ownership/publication/version/phone and reserves a durable attempt before contacting Meta. One attempt per guest in this initial slice; no resend/bulk scheduler.
- Track reserved/sending, accepted, sent, delivered, read, failed and unknown independently of the existing manual sent marker. A timeout is unknown, never automatically retried.
- Verify webhook challenge and raw-body HMAC; scope to configured sending number; process duplicate/out-of-order receipts monotonically. Do not store incoming chat content.
- Feature is disabled by default. Missing schema/config/template approval must fail before provider access.

## Activation checkpoint

Review the local delivery-table proposal and service-only write boundary before dependent live setup. No party/member model changes. Configure server secrets through deployment settings, approve the exact Meta template, apply the reviewed SQL separately, deploy the callback and subscribe to messages. Authorize a controlled recipient before an actual send. Never put access tokens or app secrets in chat or NEXT_PUBLIC variables.

## Implemented locally

Guests → Invite → Use WhatsApp Business API opens the separate provider panel. Manual copy/click-to-chat and manual sent/undo remain available. The API panel loads current delivery setup, shows a non-editable template preview and recipient, requires consent confirmation, and supports status refresh. It keeps the dialog open during sending, preserves uncertain outcomes, and never changes the manual sent marker.

The pilot sender is restricted to `WHATSAPP_OWNER_ID`. Server actions recheck owner access, saved guest version, published state and reviewed content. `reserve_whatsapp_invitation` atomically reserves one immutable attempt per guest, with a cap of 20 attempts per owner per minute. This slice intentionally has no resend, bulk sending or background scheduling. Failed/unknown attempts require operator reconciliation before any future retry workflow is introduced.

The delivery table is additive; no existing guest/member fields change. Authenticated owners can read their own deliveries; only the backend secret role can reserve or mutate them. The webhook verifies the raw body using the Meta app secret, bounds bodies to 256 KiB, checks the configured phone number ID, and correlates status by provider message ID or opaque attempt UUID plus recipient. Duplicate and lower-priority statuses cannot regress delivered/read states. Incoming chat bodies are ignored and not saved.

## Template to submit/reconcile

Proposed name: `wedding_invitation`; language: `en_US`. Submit the exact body below with positional parameters and no header/buttons, or adapt the local contract to your approved template before enabling it. Meta has not approved this proposed wording in this task.

```text
Hi {{1}}, you're invited to celebrate the wedding of {{2}}. We've reserved {{3}} for your invitation. View the details and RSVP here: {{4}} We hope to celebrate with you!
```

Fictional parameter samples: `Alex`, `Amelia & James`, `3 places`, `https://wedding.example/i/amelia-james?guest=fictional`. A one-place invitation uses `1 place` as the third parameter. The live personal link is generated from authoritative saved data and `APP_URL`; arbitrary message text is never sent through the API.

## Setup after the live checkpoint

1. Confirm the approved template name, language, exact body and four-parameter contract. Confirm the sending phone number ID belongs to the intended Meta app/account.
2. Review `supabase/whatsapp_delivery.proposal.sql`, including the owner-read policy and backend-only function grants. Apply it only with separate live approval. It depends on the existing guest workflow schema. This proposal is not an automatically applied migration.
3. In secure server deployment settings, configure `APP_URL` as the public HTTPS origin, `WHATSAPP_OWNER_ID` as the pilot owner UUID, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, an explicitly supported `WHATSAPP_API_VERSION`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_TEMPLATE_LANGUAGE`, `WHATSAPP_APP_SECRET`, a random `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, and backend-only `SUPABASE_SECRET_KEY`. Use an appropriately scoped Meta system-user token. Never expose these secrets to client code.
4. Deploy the callback at `/api/whatsapp/webhook`; configure it in Meta using the verify token and subscribe the correct account/app to message status events. Webhook receipts remain processable when the send switch is disabled so existing attempts can settle.
5. After template approval and controlled recipient authorization, set `WHATSAPP_TEMPLATE_APPROVED=true` and `WHATSAPP_ENABLED=true`. Preview one invitation, confirm recipient consent, send once, and verify accepted → sent/delivered/read as events become available. Disable sending again if verification fails; reconcile reserved/unknown attempts in Meta before any new send.

## Verification actually run

- Seven focused provider/configuration/template/signature/receipt tests and eight existing manual guest-flow tests pass.
- Isolated PostgreSQL proposal checks pass: stale/wrong-owner/wrong-recipient/draft guards, unique reservation, 20-attempt cap, receipt correlation, monotonic delivery state, owner read isolation, anonymous denial and backend-only mutation grants.
- Targeted ESLint, TypeScript and the final production build pass. The sandboxed build stalled; the final build passed outside the Windows sandbox.
- Headless Edge passes 1440/768/390px API inactive-state loading/refresh, preserved localhost sharing guard, dialog close and no horizontal overflow/page errors. Evidence: `design-review/whatsapp-business/screenshots`. The Windows sandbox prevented Edge launch; the same test passed outside it.
- Production HTTP route tests using dummy secrets pass challenge echo, wrong verify token, correct HMAC with ignored chat content, absent/tampered signatures, invalid signed JSON and actual-body size limit. No receipt was written during those route checks.

No live database mutation, Meta subscription, deployment, real API send or delivery test was performed. The enabled authenticated send interface, valid-receipt persistence against hosted Supabase and real concurrent staff sessions remain unverified. PGlite and mocked provider results do not prove hosted delivery. An interrupted process can leave `sending` reserved; inspect Meta rather than clearing the row or blindly retrying.

References: [Meta template documentation](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/), [Meta's Cloud API request collection](https://www.postman.com/meta/whatsapp-business-platform/request/lwtlz1k/send-message-template-interactive), [Meta webhook signature example](https://github.com/fbsamples/whatsapp-api-examples/tree/main/signature-validation-with-webhooks-payloads), [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api). Meta's SDK docs are archived; implementation uses direct HTTP, with the API version explicitly configured. Current developers.facebook.com pages returned rate limits during research; activation must reconcile the final approved template and API version with the account.
