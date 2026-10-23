import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
const wedding = "00000000-0000-4000-8000-000000000003";
const party = "00000000-0000-4000-8000-000000000004";
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'hex')$$;`);
  await db.exec(await readFile("supabase/schema.sql", "utf8"));
  await db.exec(await readFile("supabase/guest_workflow.proposal.sql", "utf8"));
  await db.exec(`grant usage on schema public to anon,authenticated; grant select on public.invitations,public.templates to anon,authenticated;
    insert into auth.users(id,email) values('${owner}','owner@example.invalid'),('${other}','other@example.invalid');
    insert into public.invitations(id,user_id,slug,template_id,published,theme)
      select '${wedding}','${owner}','event-test',id,true,'{"rsvp_events_enabled":true,"events":[{"id":"ceremony","title":"Ceremony"},{"id":"dinner","title":"Dinner"},{"id":"private","title":"Private event"}]}' from public.templates limit 1;
    insert into public.guests(id,invitation_id,name,side,invited_count,event_ids,phone)
      values('${party}','${wedding}','Fictional family','bride',3,array['ceremony','dinner'],'+447700900123');`);
  const before = (
    await db.query("select * from public.guests where id=$1", [party])
  ).rows[0];
  const proposal = await readFile("supabase/proposals/event-rsvp.sql", "utf8");
  await db.exec(proposal);
  await db.exec(proposal); // Additive/idempotent replay, preserving IDs and tokens.
  const saved = (
    await db.query("select * from public.guests where id=$1", [party])
  ).rows[0];
  assert.equal(saved.public_token, before.public_token);
  assert.equal(saved.version, before.version);
  assert.deepEqual(saved.event_responses, {});
  const token = before.public_token;
  const run = (
    count = 2,
    selected = ["dinner"],
    ids = ["ceremony", "dinner"],
    version = 0,
    slug = "event-test",
    accessToken = token,
  ) =>
    db.query(
      "select public.respond_to_invitation_events($1,$2,$3,'See you','Vegetarian',$4,$5,$6) as reply",
      [slug, accessToken, count, selected, ids, version],
    );
  const context = async () =>
    (
      await db.query("select public.guest_context('event-test',$1) as guest", [
        token,
      ])
    ).rows[0].guest;
  const ageReply = async () => {
    await db.exec("reset role");
    await db.query(
      "update public.guests set responded_at=now()-interval '10 seconds' where id=$1",
      [party],
    );
    await db.exec("set role anon");
  };
  await db.exec("set role anon");
  await assert.rejects(
    db.query("select event_responses from public.guests"),
    /permission denied/,
  );
  const initial = await context();
  assert.equal(initial.event_rsvp_available, true);
  assert.equal(initial.version, 0);
  assert.deepEqual(initial.event_responses, {});
  for (const secret of [
    "phone",
    "email",
    "notes",
    "staff_notes",
    "id",
    "public_token",
  ])
    assert.equal(secret in initial, false);
  await assert.rejects(run(4), /allocated seats/);
  await assert.rejects(run(-1), /allocated seats/);
  await assert.rejects(run(null), /allocated seats/);
  await assert.rejects(run(2, []), /at least one event/);
  await assert.rejects(run(0, ["dinner"]), /Declined replies/);
  await assert.rejects(run(2, ["private"]), /only the events/);
  await assert.rejects(run(2, ["dinner", "dinner"]), /once/);
  await assert.rejects(run(2, ["dinner"], ["ceremony"]), /events changed/);
  await assert.rejects(
    run(2, ["dinner"], ["ceremony", "dinner", "private"]),
    /events changed/,
  );
  await assert.rejects(
    run(2, ["dinner"], ["ceremony", "dinner"], null),
    /invitation changed/,
  );
  await assert.rejects(
    run(2, ["dinner"], ["ceremony", "dinner"], 0, "another-wedding"),
    /unavailable/,
  );
  await assert.rejects(
    run(2, ["dinner"], ["ceremony", "dinner"], 0, "event-test", "invalid"),
    /invalid/,
  );
  await assert.rejects(
    db.query("select public.respond_to_invitation('event-test',$1,2,'','')", [
      token,
    ]),
    /settings changed/,
  );
  assert.equal((await context()).version, 0); // Every invalid submission rolled back.
  const response = (await run()).rows[0].reply;
  assert.equal(response.version, 1);
  assert.deepEqual(response.event_responses, {
    ceremony: "declined",
    dinner: "attending",
  });
  let current = await context();
  assert.equal(current.rsvp_status, "attending");
  assert.equal(current.rsvp_attending_count, 2);
  assert.equal(current.rsvp_message, "See you");
  assert.equal(current.dietary, "Vegetarian");
  await assert.rejects(run(), /invitation changed/);
  await assert.rejects(
    run(2, ["ceremony"], ["ceremony", "dinner"], 1),
    /wait a few seconds/,
  );
  await ageReply();
  await run(0, [], ["ceremony", "dinner"], 1);
  current = await context();
  assert.deepEqual(current.event_responses, {
    ceremony: "declined",
    dinner: "declined",
  });
  assert.equal(current.rsvp_attending_count, 0);
  assert.equal(current.rsvp_status, "declined");
  assert.equal(current.dietary, null);
  await db.exec("reset role");
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub','${other}',false)`,
  );
  assert.equal(
    (await db.query("select event_responses from public.guests")).rows.length,
    0,
  );
  assert.equal(
    (
      await db.query(
        "update public.guests set event_responses='{}' where id=$1 returning id",
        [party],
      )
    ).rows.length,
    0,
  );
  await db.exec(`select set_config('request.jwt.claim.sub','${owner}',false)`);
  assert.equal(
    (await db.query("select event_responses from public.guests")).rows.length,
    1,
  );
  await assert.rejects(
    db.query("update public.guests set event_responses='[]' where id=$1", [
      party,
    ]),
    /object/,
  );
  await assert.rejects(
    db.query(
      "update public.guests set event_responses='{\"dinner\":true}' where id=$1",
      [party],
    ),
    /Invalid event/,
  );
  await db.query(
    "update public.guests set rsvp_status='pending',rsvp_attending_count=null,version=version+1 where id=$1",
    [party],
  );
  assert.deepEqual(
    (
      await db.query("select event_responses from public.guests where id=$1", [
        party,
      ])
    ).rows[0].event_responses,
    {},
  );
  await db.exec("reset role");
  await db.query(
    'update public.guests set rsvp_status=\'attending\',rsvp_attending_count=2,event_responses=\'{"ceremony":"attending","dinner":"declined"}\',event_ids=array[\'dinner\'] where id=$1',
    [party],
  );
  assert.deepEqual(
    (
      await db.query("select event_responses from public.guests where id=$1", [
        party,
      ])
    ).rows[0].event_responses,
    { dinner: "declined" },
  );
  await db.query(
    'update public.guests set event_ids=\'{}\',event_responses=\'{"ceremony":"attending","dinner":"declined"}\' where id=$1',
    [party],
  );
  await db.query(
    'update public.invitations set theme=jsonb_set(theme,\'{events}\',\'[{"id":"dinner","title":"Renamed dinner"}]\') where id=$1',
    [wedding],
  );
  await db.exec("set role anon");
  assert.deepEqual((await context()).event_responses, { dinner: "declined" }); // Removed event is not exposed.
  await assert.rejects(
    run(2, ["dinner"], ["ceremony", "dinner"], 3),
    /events changed/,
  );
  await db.exec("reset role");
  await db.query(
    "update public.invitations set theme=theme||'{\"rsvp_closed\":true}' where id=$1",
    [wedding],
  );
  await db.exec("set role anon");
  await assert.rejects(run(1, ["dinner"], ["dinner"], 3), /closed/);
  await db.exec("reset role");
  await db.query(
    "update public.invitations set theme=(theme-'rsvp_closed')||'{\"rsvp_deadline\":\"2020-01-01T00:00:00Z\"}' where id=$1",
    [wedding],
  );
  await db.exec("set role anon");
  await assert.rejects(run(1, ["dinner"], ["dinner"], 3), /closed/);
  await db.exec("reset role");
  await db.query("update public.invitations set published=false where id=$1", [
    wedding,
  ]);
  await db.exec("set role anon");
  assert.equal(await context(), null);
  await assert.rejects(run(1, ["dinner"], ["dinner"], 3), /unavailable/);
  await db.exec("reset role");
  await db.query(
    "update public.invitations set published=true,theme=theme-'rsvp_deadline'-'rsvp_events_enabled' where id=$1",
    [wedding],
  );
  await ageReply();
  await assert.rejects(run(1, ["dinner"], ["dinner"], 3), /settings changed/);
  await db.query(
    "select public.respond_to_invitation('event-test',$1,1,'Legacy compatible','')",
    [token],
  );
  current = await context();
  assert.equal(current.rsvp_attending_count, 1);
  assert.deepEqual(current.event_responses, {});
  console.log(
    "PASS: additive upgrade, no invented backfill, atomic mixed/declined replies, allocation/access/config/version checks, cooldown, closed/deadline/unpublished states, owner isolation, anonymous denial, trigger normalization, removed-event privacy and legacy compatibility.",
  );
} finally {
  await db.close();
}
