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

Verification results and setup instructions will be appended after implementation.
