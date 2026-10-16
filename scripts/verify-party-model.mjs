import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Invoked by verify-database.mjs against its isolated, disposable PostgreSQL.
export async function verifyPartyModel(db) {
  const wedding = "00000000-0000-4000-8000-000000000003";
  const party = "00000000-0000-4000-8000-000000000004";
  const pending = "00000000-0000-4000-8000-000000000005";
  const declined = "00000000-0000-4000-8000-000000000006";
  await db.exec("reset role");
  await db.query(
    `insert into public.guests(id,invitation_id,name,side,invited_count,rsvp_status,rsvp_attending_count,checked_in_count,extra_seats)
    values ($1,$3,'Pending household','bride',3,'pending',null,0,0),
    ($2,$3,'Declined household','groom',2,'declined',0,3,1)`,
    [pending, declined, wedding],
  );
  const before = (await db.query("select * from public.guests order by id"))
    .rows;
  const proposal = await readFile(
    new URL("../supabase/party_model.proposal.sql", import.meta.url),
    "utf8",
  );

  // A bad historical RSVP must stop conversion, without leaving partial tables.
  await db.query(
    "update public.guests set rsvp_attending_count=10 where id=$1",
    [party],
  );
  await assert.rejects(db.exec(proposal), /inconsistent legacy counts/);
  await db.exec("rollback");
  assert.equal(
    (await db.query("select to_regclass('public.party_seats') as relation"))
      .rows[0].relation,
    null,
  );
  await db.query(
    "update public.guests set rsvp_attending_count=2 where id=$1",
    [party],
  );
  await db.exec(proposal);
  assert.deepEqual(
    (await db.query("select * from public.guests order by id")).rows,
    before,
    "Backfill must not mutate existing party records or tokens",
  );
  const totals = async (id) =>
    (
      await db.query("select * from public.party_totals where party_id=$1", [
        id,
      ])
    ).rows[0];
  assert.deepEqual(await totals(party), {
    party_id: party,
    seats: 2,
    named_members: 0,
    unnamed_seats: 2,
    attending: 2,
    awaiting_reply: 0,
    arrived: 1,
    extra_arrivals: 0,
  });
  assert.equal((await totals(pending)).awaiting_reply, 3);
  assert.equal((await totals(declined)).attending, 0);
  assert.equal(
    (await totals(declined)).arrived,
    3,
    "Arrival is independent of RSVP, including walk-ins",
  );
  assert.equal((await totals(declined)).extra_arrivals, 1);
  const seat = (
    await db.query(
      "select * from public.party_seats where party_id=$1 and seat_number=1",
      [party],
    )
  ).rows[0];
  await db.query(
    "update public.party_seats set member_name='Alex',dietary='Vegetarian',table_name='Olive',seat_label='A1' where id=$1",
    [seat.id],
  );
  const named = (
    await db.query("select * from public.party_seats where id=$1", [seat.id])
  ).rows[0];
  assert.equal(named.id, seat.id);
  assert.equal(named.rsvp_status, seat.rsvp_status);
  assert.equal(named.arrived, seat.arrived);
  assert.equal((await totals(party)).seats, 2);
  assert.equal((await totals(party)).named_members, 1);
  assert.equal((await totals(party)).unnamed_seats, 1);
  await db.query(
    "update public.party_seats set arrived=false,arrived_at=null where id=$1",
    [seat.id],
  );
  assert.equal(
    (await totals(party)).arrived,
    0,
    "Undo arrival changes the derived total",
  );
  await db.query(
    "update public.party_seats set rsvp_status='declined' where id=$1",
    [seat.id],
  );
  assert.equal((await totals(party)).attending, 1);
  await assert.rejects(
    db.query("update public.party_seats set party_id=$1 where id=$2", [
      pending,
      seat.id,
    ]),
    /cannot be reassigned/,
  );
  await assert.rejects(
    db.query(
      "insert into public.party_seats(party_id,seat_number) values($1,3)",
      [party],
    ),
    /exceeds party allocation/,
  );
  await assert.rejects(
    db.query(
      "insert into public.party_seats(party_id,seat_number) values($1,1)",
      [party],
    ),
    /unique constraint/,
  );
  await assert.rejects(
    db.query("update public.party_seats set member_name=' ' where id=$1", [
      seat.id,
    ]),
    /check constraint/,
  );
  await assert.rejects(
    db.query("update public.guests set invited_count=1 where id=$1", [party]),
    /Remove unused seats explicitly/,
  );

  await db.exec("set role anon");
  for (const table of ["party_seats", "party_totals"]) {
    await assert.rejects(
      db.query(`select * from public.${table}`),
      /permission denied/,
    );
  }
  await db.exec(
    "reset role; set role authenticated; select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000002',false)",
  );
  assert.equal(
    (await db.query("select * from public.party_seats")).rows.length,
    0,
  );
  assert.equal(
    (await db.query("select * from public.party_totals")).rows.length,
    0,
  );
  await db.exec(
    "select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false)",
  );
  assert.equal(
    (await db.query("select * from public.party_seats")).rows.length,
    8,
  );
  assert.equal(
    (await db.query("select * from public.party_totals")).rows.length,
    3,
  );
  for (const sql of [
    "insert into public.party_seats(party_id,seat_number) values($1,1)",
    "update public.party_seats set member_name='Overwrite' where party_id=$1",
    "delete from public.party_seats where party_id=$1",
  ])
    await assert.rejects(db.query(sql, [party]), /permission denied/);
  await db.exec("reset role");
  await db.query("delete from public.guests where id=$1", [pending]);
  assert.equal(
    (
      await db.query("select * from public.party_seats where party_id=$1", [
        pending,
      ])
    ).rows.length,
    0,
  );
  console.log(
    "PASS: party-model proposal, atomic invalid-data refusal, legacy preservation, named/unnamed accounting, partial/extra arrival and undo, seat identity/capacity, owner/anonymous isolation, direct-write denial, cascade cleanup.",
  );
}
