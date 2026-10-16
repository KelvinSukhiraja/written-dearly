import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { verifyPartyModel } from "./verify-party-model.mjs";

// Isolated in-memory PostgreSQL. No production credentials or network access.
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema storage; create schema extensions;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
-- Local stand-in for pgcrypto; production uses Supabase's cryptographic implementation.
create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'hex')$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$select string_to_array(name,'/')$$;
`);
await db.exec(
  await readFile(new URL("../supabase/schema.sql", import.meta.url), "utf8"),
);
await db.exec(
  await readFile(
    new URL("../supabase/production_upgrade.sql", import.meta.url),
    "utf8",
  ),
);
await db.exec(`grant usage on schema public to anon,authenticated; grant select on public.invitations,public.templates to anon,authenticated; grant all on public.invitations to authenticated;
insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000001','owner@example.invalid'),('00000000-0000-4000-8000-000000000002','other@example.invalid');
insert into public.invitations(id,user_id,slug,template_id,published) select '00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','test-wedding',id,true from public.templates limit 1;
insert into public.guests(id,invitation_id,name,side,invited_count) values('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000003','Test party','bride',2);
`);
const {
  rows: [guest],
} = await db.query("select public_token,checkin_token from public.guests");
assert.match(guest.public_token, /^[a-f0-9]{64}$/);
assert.notEqual(guest.public_token, guest.checkin_token);
await db.exec("set role anon");
await assert.rejects(
  db.query("select * from public.guests"),
  /permission denied/,
);
assert.equal(
  (
    await db.query(
      "select public.guest_context('test-wedding','invalid') as context",
    )
  ).rows[0].context,
  null,
);
const context = (
  await db.query("select public.guest_context('test-wedding',$1) as context", [
    guest.public_token,
  ])
).rows[0].context;
assert.equal(context.name, "Test party");
assert.equal(context.invited_count, 2);
assert.ok(!("id" in context));
assert.ok(!("email" in context));
assert.ok(!("notes" in context));
assert.ok(!("public_token" in context));
await assert.rejects(
  db.query("select public.respond_to_invitation('test-wedding',$1,3,'','')", [
    guest.public_token,
  ]),
  /allocated seats/,
);
await assert.rejects(
  db.query("select public.respond_to_invitation('test-wedding',$1,-1,'','')", [
    guest.public_token,
  ]),
  /allocated seats/,
);
await db.query(
  "select public.respond_to_invitation('test-wedding',$1,2,'See you soon','Vegetarian')",
  [guest.public_token],
);
assert.equal(
  (
    await db.query(
      "select public.guest_context('test-wedding',$1) as context",
      [guest.public_token],
    )
  ).rows[0].context.rsvp_attending_count,
  2,
);
await assert.rejects(
  db.query("select public.respond_to_invitation('test-wedding',$1,1,'','')", [
    guest.public_token,
  ]),
  /wait a few seconds/,
);
await db.exec(
  "reset role; update public.invitations set theme='{\"rsvp_closed\":true}'; set role anon;",
);
await assert.rejects(
  db.query("select public.respond_to_invitation('test-wedding',$1,1,'','')", [
    guest.public_token,
  ]),
  /RSVP has closed/,
);
await db.exec(
  "reset role; update public.invitations set published=false; set role anon;",
);
assert.equal(
  (
    await db.query(
      "select public.guest_context('test-wedding',$1) as context",
      [guest.public_token],
    )
  ).rows[0].context,
  null,
);
await db.exec(
  "reset role; set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false);",
);
assert.equal((await db.query("select * from public.guests")).rows.length, 0);
await db.exec(
  "select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false)",
);
assert.equal((await db.query("select * from public.guests")).rows.length, 1);
assert.equal(
  (
    await db.query(
      "update public.guests set checked_in_count=1,version=2 where version=1 returning id",
    )
  ).rows.length,
  1,
);
assert.equal(
  (
    await db.query(
      "update public.guests set checked_in_count=2,version=2 where version=1 returning id",
    )
  ).rows.length,
  0,
);
await assert.rejects(
  db.query("update public.guests set checked_in_count=3"),
  /guests_arrivals_valid/,
);
for (let i = 0; i < 20; i++)
  assert.equal(
    (await db.query("select public.reserve_mail_slot() as allowed")).rows[0]
      .allowed,
    true,
  );
assert.equal(
  (await db.query("select public.reserve_mail_slot() as allowed")).rows[0]
    .allowed,
  false,
);
await verifyPartyModel(db);
await db.close();
console.log(
  "PASS: migration, anonymous isolation, owner isolation, token projection, invalid token, RSVP seat limits, saved RSVP, throttling, closed RSVP, draft privacy, check-in conflict and arrival limits, email rate limit.",
);
