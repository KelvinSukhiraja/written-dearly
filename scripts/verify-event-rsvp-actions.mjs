import ts from "typescript";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

// Exercise the actual server action with mocked Supabase/network boundaries.
// No hosted writes, credentials or browser session are involved.
const source = await readFile("src/app/i/[slug]/actions.ts", "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const calls = [],
  invalidations = [];
let answer = {
  data: { version: 5, event_responses: { dinner: "attending" } },
  error: null,
};
const exports = {};
new Function("require", "exports", outputText)((name) => {
  if (name === "next/cache")
    return { revalidatePath: (...args) => invalidations.push(args) };
  if (name.endsWith("supabase/server"))
    return {
      createClient: async () => ({
        rpc: async (...args) => {
          calls.push(args);
          if (answer instanceof Error) throw answer;
          return answer;
        },
      }),
    };
  if (name.endsWith("invitations/event-rsvp"))
    return { eventResponseMap: (value) => value ?? {} };
  throw new Error(`Unexpected dependency ${name}`);
}, exports);
function form(changes = {}) {
  const f = new FormData();
  for (const [key, value] of Object.entries({
    slug: "sample",
    token: "a".repeat(64),
    attending: "yes",
    attending_count: "2",
    event_mode: "on",
    event_ids: '["ceremony","dinner"]',
    version: "4",
    message: "See you",
    dietary: "Vegetarian",
    ...changes,
  }))
    f.set(key, value);
  f.append("selected_events", "dinner");
  return f;
}
const submit = (f) => exports.submitRsvp(null, f);
let result = await submit(form());
assert.deepEqual(result, {
  ok: true,
  version: 5,
  eventResponses: { dinner: "attending" },
});
assert.equal(calls[0][0], "respond_to_invitation_events");
assert.deepEqual(calls[0][1].p_selected_events, ["dinner"]);
assert.equal(calls[0][1].p_attending, 2);
assert.equal(calls[0][1].p_version, 4);
assert.equal(invalidations.length, 2);
const declined = form({ attending: "no" });
await submit(declined);
assert.deepEqual(calls.at(-1)[1].p_selected_events, []);
assert.equal(calls.at(-1)[1].p_attending, 0);
assert.equal(calls.at(-1)[1].p_dietary, "");
for (const changes of [
  { token: "invalid" },
  { attending_count: "4.5" },
  { version: "" },
  { version: "-1" },
  { event_ids: "{}" },
  { event_ids: '["dinner","dinner"]' },
  { message: "x".repeat(1001) },
]) {
  const n = calls.length;
  assert.equal((await submit(form(changes))).ok, false);
  assert.equal(calls.length, n);
}
const empty = form();
empty.delete("selected_events");
assert.match((await submit(empty)).error, /at least one event/);
const forbidden = form();
forbidden.append("selected_events", "private");
assert.equal((await submit(forbidden)).ok, false);
answer = { data: null, error: { code: "PGRST202", message: "RPC missing" } };
assert.match((await submit(form())).error, /being prepared/);
answer = {
  data: null,
  error: { code: "P0001", message: "Your invitation changed. Reload." },
};
assert.match((await submit(form())).error, /invitation changed/);
answer = new Error("network timeout");
assert.match((await submit(form())).error, /could not be saved/);
answer = { data: null, error: null };
assert.match((await submit(form())).error, /could not be confirmed/);
const legacy = form();
legacy.delete("event_mode");
assert.equal((await submit(legacy)).ok, true);
assert.equal(calls.at(-1)[0], "respond_to_invitation");
answer = {
  data: { version: 6, event_responses: { dinner: "attending" } },
  error: null,
};
assert.equal((await submit(form({ public_wish: "on" }))).ok, true);
assert.equal(calls.at(-1)[0], "respond_to_invitation_with_wish");
assert.equal(calls.at(-1)[1].p_event_mode, true);
const publicLegacy = form({ public_wish: "on" });
publicLegacy.delete("event_mode");
assert.equal((await submit(publicLegacy)).ok, true);
assert.equal(calls.at(-1)[0], "respond_to_invitation_with_wish");
assert.equal(calls.at(-1)[1].p_event_mode, false);
console.log(
  "PASS: real server action routes legacy/event calls, rejects malformed input before writes, passes count/events/version, clears declined dietary, returns receipt, handles setup/conflict/network/uncertain-result errors, invalidates only after success.",
);
