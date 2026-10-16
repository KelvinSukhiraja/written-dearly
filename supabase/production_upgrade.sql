-- Reviewed upgrade for the existing WrittenDearly database. Preserves existing rows.
begin;
alter table public.guests
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists invitation_sent_at timestamptz,
  add column if not exists table_name text,
  add column if not exists dietary text,
  add column if not exists notes text,
  add column if not exists staff_notes text,
  add column if not exists public_token text not null default encode(extensions.gen_random_bytes(32),'hex'),
  add column if not exists checkin_token text not null default encode(extensions.gen_random_bytes(32),'hex'),
  add column if not exists event_ids text[] not null default '{}',
  add column if not exists checked_in_count integer not null default 0,
  add column if not exists extra_seats integer not null default 0,
  add column if not exists version integer not null default 0;
create unique index if not exists guests_public_token_idx on public.guests(public_token);
create unique index if not exists guests_checkin_token_idx on public.guests(checkin_token);
update public.guests set checked_in_count = coalesce(rsvp_attending_count, invited_count) where checked_in and checked_in_count=0;
alter table public.guests add constraint guests_arrivals_valid check (checked_in_count>=0 and extra_seats>=0 and checked_in_count <= invited_count+extra_seats) not valid;
alter table public.guests add constraint guests_seats_valid check (invited_count between 1 and 100) not valid;

drop policy if exists guests_select_own_or_published on public.guests;
drop policy if exists guests_update_own_or_published on public.guests;
drop policy if exists guests_insert_rsvp_on_published on public.guests;
create policy guests_select_owner on public.guests for select to authenticated using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));
create policy guests_update_owner on public.guests for update to authenticated using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid()))) with check (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));
revoke all on public.guests from anon;
grant select,insert,update,delete on public.guests to authenticated;
drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users for insert to authenticated with check (id=(select auth.uid()));

-- Token-authorized functions deliberately permit guests without an auth account.
-- Definer implementation is in an unexposed schema, with narrow invoker wrappers.
create schema if not exists invitation_private;
revoke all on schema invitation_private from public;
grant usage on schema invitation_private to anon,authenticated;
create or replace function invitation_private.guest_context(p_slug text,p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare g public.guests; i public.invitations;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return null; end if;
  select * into i from public.invitations where slug=p_slug and published;
  if not found then return null; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token;
  if not found then return null; end if;
  return jsonb_build_object('name',g.name,'invited_count',g.invited_count,'rsvp_status',g.rsvp_status,
    'rsvp_attending_count',g.rsvp_attending_count,'rsvp_message',g.rsvp_message,'dietary',g.dietary,
    'table_name',g.table_name,'checkin_token',g.checkin_token,'event_ids',g.event_ids);
end $$;
revoke all on function invitation_private.guest_context(text,text) from public;
grant execute on function invitation_private.guest_context(text,text) to anon,authenticated;
create or replace function public.guest_context(p_slug text,p_token text) returns jsonb language sql security invoker set search_path='' as $$ select invitation_private.guest_context(p_slug,p_token) $$;
revoke all on function public.guest_context(text,text) from public;
grant execute on function public.guest_context(text,text) to anon,authenticated;

create or replace function invitation_private.respond(p_slug text,p_token text,p_attending integer,p_message text,p_dietary text)
returns void language plpgsql security definer set search_path='' as $$
declare g public.guests; i public.invitations;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'This invitation link is invalid.'; end if;
  select * into i from public.invitations where slug=p_slug and published;
  if not found then raise exception 'This invitation is unavailable.'; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token for update;
  if not found then raise exception 'This invitation link is invalid.'; end if;
  if coalesce((i.theme->>'rsvp_closed')::boolean,false) or (nullif(i.theme->>'rsvp_deadline','') is not null and now()>(i.theme->>'rsvp_deadline')::timestamptz) then raise exception 'RSVP has closed. Please contact the couple.'; end if;
  if p_attending is null or p_attending<0 or p_attending>g.invited_count then raise exception 'Please stay within your allocated seats.'; end if;
  if length(coalesce(p_message,''))>1000 or length(coalesce(p_dietary,''))>500 then raise exception 'Please shorten your message.'; end if;
  if g.responded_at is not null and g.responded_at > timezone('utc',now())-interval '5 seconds' then raise exception 'Please wait a few seconds before updating your reply.'; end if;
  update public.guests set rsvp_status=(case when p_attending=0 then 'declined' else 'attending' end)::public."RsvpStatus",
    rsvp_attending_count=p_attending,rsvp_message=nullif(p_message,''),dietary=nullif(p_dietary,''),responded_at=timezone('utc',now()),version=version+1 where id=g.id;
end $$;
revoke all on function invitation_private.respond(text,text,integer,text,text) from public;
grant execute on function invitation_private.respond(text,text,integer,text,text) to anon,authenticated;
create or replace function public.respond_to_invitation(p_slug text,p_token text,p_attending integer,p_message text,p_dietary text) returns void language sql security invoker set search_path='' as $$ select invitation_private.respond(p_slug,p_token,p_attending,p_message,p_dietary) $$;
revoke all on function public.respond_to_invitation(text,text,integer,text,text) from public;
grant execute on function public.respond_to_invitation(text,text,integer,text,text) to anon,authenticated;

create table public.email_deliveries (
 id uuid primary key default gen_random_uuid(), invitation_id uuid not null references public.invitations(id) on delete cascade,
 guest_id uuid not null references public.guests(id) on delete cascade, status text not null default 'sending' check(status in ('sending','accepted','delivered','failed','unknown')),
 recipient text not null, provider_id text, error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(guest_id)
);
alter table public.email_deliveries enable row level security;
create policy email_owner on public.email_deliveries for all to authenticated using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid()))) with check (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));
grant select,insert,update on public.email_deliveries to authenticated;
create index email_invitation_idx on public.email_deliveries(invitation_id);

create table public.mail_rate_limits(user_id uuid not null references auth.users(id) on delete cascade, minute timestamptz not null, used integer not null default 1, primary key(user_id,minute));
alter table public.mail_rate_limits enable row level security;
create policy mail_rate_owner on public.mail_rate_limits for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant select,insert,update on public.mail_rate_limits to authenticated;
create function public.reserve_mail_slot() returns boolean language plpgsql security invoker set search_path='' as $$
declare count integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.mail_rate_limits(user_id,minute) values(auth.uid(),date_trunc('minute',now())) on conflict(user_id,minute) do update set used=public.mail_rate_limits.used+1 returning used into count;
 return count<=20;
end $$;
revoke all on function public.reserve_mail_slot() from public;
grant execute on function public.reserve_mail_slot() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('invitation-media','invitation-media',true,6291456,array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy media_read on storage.objects for select to public using(bucket_id='invitation-media');
create policy media_insert on storage.objects for insert to authenticated with check(bucket_id='invitation-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy media_delete on storage.objects for delete to authenticated using(bucket_id='invitation-media' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
