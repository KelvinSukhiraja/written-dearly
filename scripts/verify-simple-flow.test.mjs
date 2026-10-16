import test from "node:test";
import assert from "node:assert/strict";
import { guestSummary } from "../src/lib/guests/summary.ts";
import {
  whatsappPhone,
  whatsappUrl,
  invitationLink,
  publicShareOrigin,
} from "../src/lib/guests/whatsapp.ts";
import { parseGuestCsv } from "../src/lib/guests/csv.ts";
import { normalizeGuestPhone } from "../src/lib/guests/contact.ts";

test("saving and WhatsApp sharing agree on formatted and malformed numbers", () => {
  for (const input of ["081234567890", "1------", "+12345678901234567890", "+62 812-3456-7890", "0044 (7700) 900123"]) {
    const saved = normalizeGuestPhone(input);
    assert.equal(saved?.slice(1) ?? null, whatsappPhone(input));
    if (saved) assert.match(saved, /^\+[1-9]\d{6,14}$/);
  }
});

test("CSV requires a usable phone and reports the invalid row before importing", () => {
  assert.throws(() => parseGuestCsv("name,side\nAlex,bride"), /phone columns/);
  assert.throws(() => parseGuestCsv("name,side,phone\nAlex,bride,\nJamie,groom,+447700900123"), /Row 2/);
  assert.throws(() => parseGuestCsv("name,side,phone\nAlex,bride,1------"), /Row 2/);
  assert.throws(() => parseGuestCsv("name,side,phone,email\nAlex,bride,+447700900123,wrong"), /email/);
});

test("companion allocations and partial arrivals use people, not invitations", () => {
  const totals = guestSummary([
    {
      invited_count: 3,
      rsvp_status: "attending",
      rsvp_attending_count: 3,
      checked_in_count: 1,
    },
    { invited_count: 2, rsvp_status: "pending", checked_in_count: 0 },
    {
      invited_count: 4,
      rsvp_status: "declined",
      rsvp_attending_count: 0,
      checked_in_count: 0,
    },
  ]);
  assert.deepEqual(totals, {
    reserved: 9,
    confirmed: 3,
    arrived: 1,
    remaining: 2,
    pending: 1,
  });
});

test("walk-ins and extra arrivals do not hide confirmed people still expected in another party", () => {
  const totals = guestSummary([
    {
      invited_count: 4,
      rsvp_status: "attending",
      rsvp_attending_count: 2,
      checked_in_count: 4,
    },
    {
      invited_count: 3,
      rsvp_status: "attending",
      rsvp_attending_count: 3,
      checked_in_count: 0,
    },
    { invited_count: 1, rsvp_status: "pending", checked_in_count: 1 },
  ]);
  assert.equal(totals.remaining, 3);
  assert.equal(totals.arrived, 5);
});

test("international phones are normalized without guessing a local country code", () => {
  assert.equal(whatsappPhone("+62 812-3456-7890"), "6281234567890");
  assert.equal(whatsappPhone("0044 (7700) 900123"), "447700900123");
  for (const phone of [
    "081234567890",
    "+62 812 x99",
    "",
    null,
    "+0123456789",
    "+1234567890123456",
  ])
    assert.equal(whatsappPhone(phone), null);
});

test("personal link and WhatsApp message survive names, newlines and query characters", () => {
  const link = invitationLink(
    "https://wedding.example",
    "alex-jamie",
    "a".repeat(64),
    true,
  );
  const parsed = new URL(link);
  assert.equal(parsed.searchParams.get("guest"), "a".repeat(64));
  assert.equal(parsed.hash, "#reception-pass");
  const text = "Hi Alex & Jamie!\nYour +2 invitation: " + link;
  const chat = new URL(whatsappUrl("+6281234567890", text));
  assert.equal(chat.hostname, "wa.me");
  assert.equal(chat.searchParams.get("text"), text);
});

test("local and insecure invitations cannot be shared as production links", () => {
  for (const origin of [
    "http://localhost:3000",
    "https://localhost",
    "https://127.0.0.1",
    "https://192.168.1.2",
    "https://10.0.0.4",
    "https://172.16.0.2",
    "https://[::1]",
    "http://wedding.example",
  ])
    assert.equal(publicShareOrigin(origin), false);
  assert.equal(publicShareOrigin("https://wedding.example"), true);
});

test("CSV import preserves WhatsApp numbers and total reserved places", () => {
  const [guest] = parseGuestCsv(
    'name,side,phone,email,invited_count\n"Alex, Morgan",bride,+6281234567890,alex@example.invalid,3',
  );
  assert.equal(guest.name, "Alex, Morgan");
  assert.equal(guest.phone, "+6281234567890");
  assert.equal(guest.email, "alex@example.invalid");
  assert.equal(guest.invited_count, 3);
  assert.throws(() => parseGuestCsv("name,side,invited_count\nAlex,bride,2.5"));
});
