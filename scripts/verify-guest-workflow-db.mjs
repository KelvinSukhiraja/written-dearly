import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const db = new PGlite();
try {
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema extensions;
create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
create function extensions.gen_random_bytes(n integer) returns bytea language sql volatile as $$select decode(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'hex')$$;
`);
await db.exec(await readFile("supabase/schema.sql","utf8"));
const owner="00000000-0000-4000-8000-000000000001";
const wedding="00000000-0000-4000-8000-000000000003";
const guest="00000000-0000-4000-8000-000000000004";
await db.exec(`
insert into auth.users(id,email) values('${owner}','owner@example.invalid');
insert into public.invitations(id,user_id,slug,template_id,published) select '${wedding}','${owner}','workflow-test',id,true from public.templates limit 1;
insert into public.guests(id,invitation_id,name,side,invited_count) values('${guest}','${wedding}','Existing guest','bride',3);
`);
await db.exec(await readFile("supabase/guest_workflow.proposal.sql","utf8"));
const { rows:[original] }=await db.query("select * from public.guests where id=$1",[guest]);
assert.equal(original.name,"Existing guest");
assert.equal(original.invitation_sent_at,null);
assert.match(original.public_token,/^[a-f0-9]{64}$/);
await db.exec(`grant usage on schema public to authenticated,anon; grant select on public.invitations to authenticated,anon; set role authenticated; select set_config('request.jwt.claim.sub','${owner}',false);`);
await db.query("update public.guests set phone='+447700900123',email='guest@example.invalid',invitation_sent_at=now(),version=version+1 where id=$1 and version=0",[guest]);
const { rows:[saved] } = await db.query("select phone,invitation_sent_at,version from public.guests where id=$1",[guest]);
assert.equal(saved.phone,"+447700900123");
assert.ok(saved.invitation_sent_at);
assert.equal(saved.version,1);
const stale = await db.query("update public.guests set invitation_sent_at=null where id=$1 and version=0 returning id",[guest]);
assert.equal(stale.rows.length,0);
await db.exec("select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',false)");
assert.equal((await db.query("select id from public.guests")).rows.length,0);
await db.exec("set role anon");
await assert.rejects(db.query("select phone from public.guests"),/permission denied/);
await db.query("select public.respond_to_invitation('workflow-test',$1,3,'','')",[original.public_token]);
const {rows:[reply]}=await db.query("select public.guest_context('workflow-test',$1) as guest",[original.public_token]);
assert.equal(reply.guest.rsvp_attending_count,3);
assert.equal("phone" in reply.guest,false);
await assert.rejects(db.query("select public.respond_to_invitation('workflow-test',$1,4,'','')",[original.public_token]));
console.log("PASS: scoped guest proposal preserves existing records, saves contacts and sent status, rejects stale writes, isolates owners and supports token RSVP within allowance.");
} finally { await db.close(); }

