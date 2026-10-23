import ts from "typescript";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const helpers = {};
new Function(
  "exports",
  compile(await readFile("src/lib/invitations/event-rsvp.ts", "utf8")),
)(helpers);
const events = [
  { id: "ceremony", title: "Ceremony" },
  { id: "dinner", title: "Dinner" },
];
assert.deepEqual(helpers.permittedEvents(events, ["dinner"]), [events[1]]);
assert.deepEqual(
  helpers.eventResponseMap({ dinner: "attending", ceremony: 123 }),
  { dinner: "attending" },
);
assert.deepEqual(
  helpers
    .eventTotals(
      [
        {
          event_ids: [],
          rsvp_status: "attending",
          rsvp_attending_count: 2,
          event_responses: { dinner: "attending", ceremony: "declined" },
        },
        {
          event_ids: ["dinner"],
          rsvp_status: "attending",
          rsvp_attending_count: 3,
          event_responses: {},
        },
      ],
      events,
    )
    .map(({ attending, pending, declined }) => ({
      attending,
      pending,
      declined,
    })),
  [
    { attending: 0, pending: 0, declined: 1 },
    { attending: 2, pending: 1, declined: 0 },
  ],
);
const writes = [];
let current = {
  id: "party",
  rsvp_status: "attending",
  rsvp_attending_count: 2,
  event_responses: { dinner: "attending" },
};
let stale = false;
const exports = {};
new Function(
  "require",
  "exports",
  compile(await readFile("src/app/dashboard/guest-actions.ts", "utf8")),
)((name) => {
  if (name === "next/cache") return { revalidatePath: () => {} };
  if (name.endsWith("dashboard/session"))
    return {
      requireInvitation: async () => ({
        invitation: { id: "wedding", theme: {} },
        supabase: {
          from: () => {
            let payload;
            const q = {
              select: () => q,
              eq: () => q,
              update: (value) => {
                payload = value;
                writes.push(value);
                return q;
              },
              maybeSingle: async () => ({
                data: payload
                  ? stale
                    ? null
                    : { ...current, ...payload }
                  : current,
                error: null,
              }),
            };
            return q;
          },
        },
      }),
    };
  if (name.endsWith("invitations/validation"))
    return {
      seatCount: (v, min = 1) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= min && n <= 100 ? n : null;
      },
    };
  if (name.endsWith("invitations/theme"))
    return {
      parseInvitationTheme: () => ({ events, rsvp_events_enabled: true }),
    };
  if (name.endsWith("invitations/event-rsvp")) return helpers;
  if (name.endsWith("guests/contact"))
    return {
      normalizeGuestPhone: () => "+447700900123",
      PHONE_ERROR: "Invalid phone",
    };
  if (name.endsWith("guests/errors"))
    return { guestDatabaseError: () => "Database error" };
  throw new Error(`Unexpected dependency ${name}`);
}, exports);
function form(changes = {}) {
  const f = new FormData();
  for (const [key, value] of Object.entries({
    name: "Sample party",
    side: "bride",
    phone: "+447700900123",
    invited_count: "3",
    rsvp_status: "attending",
    rsvp_attending_count: "2",
    version: "4",
    event_reply_edited: "off",
    ...changes,
  }))
    f.set(key, value);
  return f;
}
let result = await exports.saveGuest("party", form());
assert.equal(result.ok, true);
assert.equal("event_responses" in writes.at(-1), false); // Contact-only save preserves legacy/pending event choices.
const changed = form({ event_reply_edited: "on" });
changed.append("selected_events", "dinner");
assert.equal((await exports.saveGuest("party", changed)).ok, true);
assert.deepEqual(writes.at(-1).event_responses, {
  ceremony: "declined",
  dinner: "attending",
});
assert.equal(
  (await exports.saveGuest("party", form({ event_reply_edited: "on" }))).ok,
  false,
);
assert.equal(
  (await exports.saveGuest("party", form({ rsvp_status: "pending" }))).ok,
  true,
);
assert.deepEqual(writes.at(-1).event_responses, {});
const decline = form({ rsvp_status: "declined" });
assert.equal((await exports.saveGuest("party", decline)).ok, true);
assert.deepEqual(writes.at(-1).event_responses, {
  ceremony: "declined",
  dinner: "declined",
});
const forbidden = form({ event_reply_edited: "on" });
forbidden.append("event_ids", "dinner");
forbidden.append("selected_events", "ceremony");
assert.equal((await exports.saveGuest("party", forbidden)).ok, false);
current = { id: "party", rsvp_status: "attending", rsvp_attending_count: 2 };
assert.match(
  (await exports.saveGuest("party", form())).error,
  /database update/,
);
current = { ...current, event_responses: {} };
stale = true;
assert.match(
  (await exports.saveGuest("party", form())).error,
  /another session/,
);
console.log(
  "PASS: event summaries count people separately from pending/declined invitations, access filtering, malformed stored values, owner contact-only preservation, explicit mixed/pending/declined edits, forbidden selections, missing setup and stale saves.",
);
