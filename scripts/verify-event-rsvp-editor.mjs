import ts from "typescript";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const source = await readFile("src/app/dashboard/actions.ts", "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const exports = {},
  writes = [];
let ready = true;
const invitation = {
  id: "sample",
  slug: "sample",
  theme: {
    rsvp_events_enabled: true,
    events: [{ id: "dinner", title: "Dinner" }],
  },
};
new Function("require", "exports", output)((name) => {
  if (name === "next/cache") return { revalidatePath: () => {} };
  if (name === "next/navigation") return { redirect: () => {} };
  if (name.endsWith("supabase/server")) return {};
  if (name.endsWith("dashboard/session"))
    return {
      requireInvitation: async () => ({
        invitation,
        supabase: {
          from: () => ({
            update: (value) => {
              writes.push(value);
              return { eq: async () => ({ error: null }) };
            },
          }),
        },
      }),
    };
  if (name.endsWith("invitations/theme"))
    return {
      parseInvitationTheme: (value) => ({
        music_source: "none",
        events: [],
        rsvp_events_enabled: false,
        ...value,
      }),
    };
  if (name.endsWith("invitations/event-rsvp-setup"))
    return { eventRsvpReady: async () => ready };
  if (name.endsWith("invitations/validation"))
    return { safeUrl: (value) => value || null };
  if (name.endsWith("guests/errors") || name.endsWith("guests/contact"))
    return {};
  throw Error(name);
}, exports);
const submit = (theme) => {
  const f = new FormData();
  f.set("theme", JSON.stringify(theme));
  return exports.updateInvitation(null, f);
};
assert.equal((await submit({ events: invitation.theme.events })).ok, true);
assert.equal(writes.at(-1).theme.rsvp_events_enabled, true);
assert.equal(
  (
    await submit({
      events: invitation.theme.events,
      rsvp_events_enabled: false,
    })
  ).ok,
  true,
);
assert.equal(writes.at(-1).theme.rsvp_events_enabled, false);
ready = false;
assert.match(
  (await submit({ events: invitation.theme.events })).error,
  /database update/,
);
const n = writes.length;
assert.equal((await submit([])).ok, false);
assert.equal(writes.length, n);
console.log(
  "PASS: older editors preserve the server event setting; explicit modern disabling works; readiness and malformed-theme checks still block unsafe saves.",
);
