import ts from "typescript";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import { readFileSync } from "node:fs";
const modules = new Map();
function loadLocal(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file);
  const value = {};
  modules.set(file, value);
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  new Function("require", "exports", code)(
    (name) => loadLocal(path.resolve(path.dirname(file), name + ".ts")),
    value,
  );
  return value;
}
const themeModule = loadLocal("src/lib/invitations/theme.ts");
const optionsModule = loadLocal("src/lib/invitations/coastal-options.ts");
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
    public_wishes_visible: false,
    gift: {
      enabled: true,
      bank: "Demo bank",
      account_holder: "Sample couple",
      account_number: "0000",
    },
    dress_code: {
      enabled: true,
      title: "No batik",
      note: "Sample note",
      colors: [{ name: "Sage", color: "#A2AD91" }],
    },
    footer: {
      enabled: true,
      vendor_name: "Fictional vendor",
      logo_url: "",
      whatsapp_url: "https://wa.me/628123456789",
      instagram_url: "https://www.instagram.com/sample/",
    },
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
  if (name.endsWith("invitations/theme")) return themeModule;
  if (name.endsWith("invitations/coastal-options")) return optionsModule;
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
assert.deepEqual(writes.at(-1).theme.gift, invitation.theme.gift);
assert.deepEqual(writes.at(-1).theme.dress_code, invitation.theme.dress_code);
assert.equal(writes.at(-1).theme.public_wishes_visible, false);
assert.deepEqual(writes.at(-1).theme.footer, invitation.theme.footer);
assert.equal(
  (
    await submit({
      dress_code: { title: "Updated heading" },
      footer: { enabled: false },
    })
  ).ok,
  true,
);
assert.deepEqual(
  writes.at(-1).theme.dress_code.colors,
  invitation.theme.dress_code.colors,
);
assert.equal(writes.at(-1).theme.dress_code.note, "Sample note");
assert.equal(writes.at(-1).theme.footer.enabled, false);
assert.equal(
  writes.at(-1).theme.footer.whatsapp_url,
  invitation.theme.footer.whatsapp_url,
);
const newColors = [
  { name: "Ocean", color: "#123ABC" },
  { name: "Pearl", color: "#EEEEEE" },
];
assert.equal(
  (
    await submit({
      dress_code: { colors: newColors },
      footer: { enabled: true, vendor_name: "New vendor" },
    })
  ).ok,
  true,
);
assert.deepEqual(writes.at(-1).theme.dress_code.colors, newColors);
assert.equal(writes.at(-1).theme.footer.vendor_name, "New vendor");
assert.equal(
  (await submit({ footer: { whatsapp_url: "javascript:alert(1)" } })).ok,
  false,
);
assert.equal(
  (
    await submit({
      footer: { instagram_url: "https://instagram.com.evil.example/" },
    })
  ).ok,
  false,
);
assert.equal(
  (
    await submit({
      footer: { instagram_url: "https://user:secret@instagram.com/" },
    })
  ).ok,
  false,
);
assert.equal(
  (
    await submit({
      events: invitation.theme.events,
      public_wishes_visible: true,
      gift: { ...invitation.theme.gift, enabled: false },
    })
  ).ok,
  true,
);
assert.equal(writes.at(-1).theme.public_wishes_visible, true);
assert.equal(writes.at(-1).theme.gift.enabled, false);
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
  "PASS: real theme parsing and owner save boundary preserve older-editor settings, custom swatches and optional vendor fields; valid updates save and unsafe social links are rejected; event readiness and malformed-theme checks still pass.",
);
