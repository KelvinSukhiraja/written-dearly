-- LOCAL DESIGN/TEST FIXTURE ONLY. Not a deployable migration.
-- Requires production_upgrade.sql. Application cutover and RPCs are still pending.
begin;

-- One seat is one person, optionally named. Naming an existing seat preserves
-- its RSVP/arrival history rather than adding a second independently counted person.
create table public.party_seats (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.guests(id) on delete cascade,
  seat_number integer not null check (seat_number between 1 and 200),
  member_name text check (member_name is null or length(trim(member_name)) between 1 and 160),
  rsvp_status public."RsvpStatus" not null default 'pending',
  dietary text check (length(dietary) <= 500),
  table_name text check (length(table_name) <= 120),
  seat_label text check (length(seat_label) <= 80),
  arrived boolean not null default false,
  arrived_at timestamptz,
  constraint party_seats_arrival_time check (arrived or arrived_at is null),
  unique(party_id,seat_number)
);
alter table public.party_seats enable row level security;
revoke all on public.party_seats from public,anon,authenticated;
-- Writes will only be exposed through transactional, version-checked RPCs.
grant select on public.party_seats to authenticated;
create policy party_seats_owner_read on public.party_seats for select to authenticated
using (exists (
  select 1 from public.guests g join public.invitations i on i.id=g.invitation_id
  where g.id=party_id and i.user_id=(select auth.uid())
));

-- Refuse ambiguous legacy values: never clamp counts or silently discard arrivals.
do $$ begin
  if exists (select 1 from public.guests where
    invited_count not between 1 and 100 or extra_seats not between 0 and 100 or
    checked_in_count not between 0 and invited_count+extra_seats or
    (rsvp_status='attending' and (rsvp_attending_count is null or rsvp_attending_count not between 1 and invited_count)) or
    (rsvp_status<>'attending' and coalesce(rsvp_attending_count,0)<>0)) then
    raise exception 'Party backfill requires review of inconsistent legacy counts.';
  end if;
end $$;

insert into public.party_seats(party_id,seat_number,rsvp_status,arrived,arrived_at)
select g.id,n,
  (case when n>g.invited_count then 'pending'
    when g.rsvp_status='pending' then 'pending'
    when n<=coalesce(g.rsvp_attending_count,0) then 'attending'
    else 'declined' end)::public."RsvpStatus",
  n<=g.checked_in_count,
  case when n<=g.checked_in_count then g.checked_in_at at time zone 'UTC' end
from public.guests g cross join lateral generate_series(1,g.invited_count+g.extra_seats) n;
-- Party dietary/notes/table values stay on guests; do not falsely attribute a
-- household's dietary requirement to a particular unnamed person.

create function invitation_private.guard_party_seat() returns trigger
language plpgsql security invoker set search_path='' as $$
declare capacity integer;
begin
  if tg_op='UPDATE' and (new.party_id<>old.party_id or new.seat_number<>old.seat_number) then
    raise exception 'Seat identity cannot be reassigned.';
  end if;
  select invited_count+extra_seats into capacity from public.guests where id=new.party_id for update;
  if capacity is null or new.seat_number>capacity then
    raise exception 'Seat exceeds party allocation.';
  end if;
  return new;
end $$;
revoke all on function invitation_private.guard_party_seat() from public,anon,authenticated;
create trigger guard_party_seat before insert or update on public.party_seats
for each row execute function invitation_private.guard_party_seat();

create function invitation_private.guard_party_capacity() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if exists(select 1 from public.party_seats where party_id=new.id and seat_number>new.invited_count+new.extra_seats) then
    raise exception 'Remove unused seats explicitly before reducing party allocation.';
  end if;
  return new;
end $$;
revoke all on function invitation_private.guard_party_capacity() from public,anon,authenticated;
create trigger guard_party_capacity before update of invited_count,extra_seats on public.guests
for each row execute function invitation_private.guard_party_capacity();

-- Derived, read-only counts. NULL response count still means no RSVP, not decline.
create view public.party_totals with (security_invoker=true) as
select g.id as party_id,
  count(s.id)::integer as seats,
  count(s.id) filter(where s.member_name is not null)::integer as named_members,
  count(s.id) filter(where s.member_name is null)::integer as unnamed_seats,
  count(s.id) filter(where s.rsvp_status='attending')::integer as attending,
  count(s.id) filter(where s.rsvp_status='pending' and s.seat_number<=g.invited_count)::integer as awaiting_reply,
  count(s.id) filter(where s.arrived)::integer as arrived,
  count(s.id) filter(where s.arrived and s.seat_number>g.invited_count)::integer as extra_arrivals
from public.guests g left join public.party_seats s on s.party_id=g.id group by g.id;
revoke all on public.party_totals from public,anon,authenticated;
grant select on public.party_totals to authenticated;
commit;
