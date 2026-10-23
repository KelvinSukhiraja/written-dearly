import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
const owner = "00000000-0000-4000-8000-000000000001",
  other = "00000000-0000-4000-8000-000000000002",
  wedding = "00000000-0000-4000-8000-000000000003",
  party = "00000000-0000-4000-8000-000000000004";
try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
    create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'hex')$$;`);
  for (const file of [
    "supabase/schema.sql",
    "supabase/guest_workflow.proposal.sql",
    "supabase/proposals/event-rsvp.sql",
  ])
    await db.exec(await readFile(file, "utf8"));
  await db.exec(`grant usage on schema public to anon,authenticated; grant select on public.invitations,public.templates to anon,authenticated;
    insert into auth.users(id,email) values('${owner}','owner@example.invalid'),('${other}','other@example.invalid');
    insert into public.invitations(id,user_id,slug,template_id,published,theme) select '${wedding}','${owner}','wish-test',id,true,'{"rsvp_events_enabled":true,"events":[{"id":"dinner","title":"Dinner"}]}' from public.templates limit 1;
    insert into public.guests(id,invitation_id,name,side,invited_count,rsvp_message,phone) values('${party}','${wedding}','Fictional family','bride',3,'Historical private note','+447700900123');`);
  const proposal = await readFile(
    "supabase/proposals/public-wishes.sql",
    "utf8",
  );
  await db.exec(proposal);
  await db.exec(proposal);
  const token = (
    await db.query("select public_token from public.guests where id=$1", [
      party,
    ])
  ).rows[0].public_token;
  const list = async () =>
    (await db.query("select public.invitation_wishes('wish-test') as wishes"))
      .rows[0].wishes;
  const submit = (message, version, access = token, count = 2) =>
    db.query(
      "select public.respond_to_invitation_with_wish('wish-test',$1,$2,$3,'Private diet',true,array['dinner'],array['dinner'],$4) as reply",
      [access, count, message, version],
    );
  const age = async () => {
    await db.exec("reset role");
    await db.query(
      "update public.guests set responded_at=now()-interval '10 seconds' where id=$1",
      [party],
    );
    await db.exec("set role anon");
  };
  await db.exec("set role anon");
  assert.deepEqual(await list(), []);
  await assert.rejects(
    db.query("select * from public.invitation_wish_messages"),
    /permission denied/,
  );
  await assert.rejects(submit("Public wish", 0, "0".repeat(64)), /invalid/);
  await assert.rejects(submit("x".repeat(1001), 0), /shorten/);
  await assert.rejects(submit("Public wish", 0, token, 4), /allocated seats/);
  assert.deepEqual(await list(), []);
  const receipt = (await submit("Congratulations!", 0)).rows[0].reply;
  assert.equal(receipt.version, 1);
  assert.deepEqual(await list(), [
    { name: "Fictional family", message: "Congratulations!" },
  ]);
  assert.equal(
    (
      await db.query(
        "select public.invitation_own_wish('wish-test',$1) as message",
        [token],
      )
    ).rows[0].message,
    "Congratulations!",
  );
  assert.equal(
    (
      await db.query(
        "select public.invitation_own_wish('wish-test',$1) as message",
        ["0".repeat(64)],
      )
    ).rows[0].message,
    null,
  );
  await db.exec("reset role");
  assert.equal(
    (
      await db.query("select rsvp_message from public.guests where id=$1", [
        party,
      ])
    ).rows[0].rsvp_message,
    "Historical private note",
  );
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub','${other}',false)`,
  );
  assert.deepEqual(
    (await db.query("select * from public.invitation_wish_messages")).rows,
    [],
  );
  assert.equal(
    (
      await db.query(
        "update public.invitation_wish_messages set hidden=true returning id",
      )
    ).rows.length,
    0,
  );
  await assert.rejects(
    db.query("update public.invitation_wish_messages set message='tampered'"),
    /permission denied/,
  );
  await assert.rejects(
    db.query(
      "insert into public.invitation_wish_messages(invitation_id,guest_id,name,message) values($1,$2,'x','x')",
      [wedding, party],
    ),
    /permission denied/,
  );
  await db.exec(`select set_config('request.jwt.claim.sub','${owner}',false)`);
  assert.equal(
    (
      await db.query(
        "update public.invitation_wish_messages set hidden=true returning id",
      )
    ).rows.length,
    1,
  );
  await db.exec("set role anon");
  assert.deepEqual(await list(), []);
  await age();
  await submit("Updated wish", 1);
  assert.deepEqual(await list(), []); // Guest edits cannot undo moderation.
  await age();
  await submit("", 2);
  await age();
  await submit("New wish", 3);
  assert.deepEqual(await list(), []); // Clearing cannot bypass moderation either.
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false)`,
  );
  await db.query("update public.invitation_wish_messages set hidden=false");
  await db.exec("set role anon");
  assert.equal((await list()).length, 1);
  await db.exec("reset role");
  await db.query(
    "update public.invitations set theme=theme||'{\"public_wishes_visible\":false}' where id=$1",
    [wedding],
  );
  await db.exec("set role anon");
  assert.deepEqual(await list(), []);
  await db.exec("reset role");
  await db.query(
    "update public.invitations set theme=theme||'{\"public_wishes_visible\":true}',published=false where id=$1",
    [wedding],
  );
  await db.exec("set role anon");
  assert.deepEqual(await list(), []);
  await assert.rejects(submit("Unavailable", 4), /unavailable/);
  await db.exec("reset role");
  await db.query(
    "update public.invitations set published=true,theme=theme||'{\"rsvp_events_enabled\":false}' where id=$1",
    [wedding],
  );
  await age();
  await db.query(
    "select public.respond_to_invitation_with_wish('wish-test',$1,1,'Legacy mode wish','',false,'{}','{}',0)",
    [token],
  );
  assert.equal((await list())[0].message, "Legacy mode wish");
  await db.exec("reset role");
  await db.query(
    "update public.invitations set theme=theme||'{\"wishes_enabled\":false}' where id=$1",
    [wedding],
  );
  await age();
  await db.query(
    "select public.respond_to_invitation_with_wish('wish-test',$1,1,'Should not replace','',false,'{}','{}',0)",
    [token],
  );
  assert.equal((await list())[0].message, "Legacy mode wish");
  console.log(
    "PASS: public wishes default visibility, no private backfill, atomic RSVP, access control, owner moderation, sticky hiding, whole-section hiding, unpublished protection, legacy and disabled modes.",
  );
} finally {
  await db.close();
}
