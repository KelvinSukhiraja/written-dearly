-- Approved and applied 23 October 2026 as public_wishes_owner_visibility.
-- Requires the existing guest workflow and event RSVP upgrade.
-- No backfill: historical private RSVP messages stay private.
begin;
create table if not exists public.invitation_wish_messages (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  name text not null check (length(name) between 1 and 200),
  message text not null check (length(message) <= 1000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists invitation_wish_messages_invitation_idx on public.invitation_wish_messages(invitation_id,created_at desc);
alter table public.invitation_wish_messages enable row level security;
revoke all on public.invitation_wish_messages from public,anon,authenticated;
grant select on public.invitation_wish_messages to authenticated;
grant update(hidden) on public.invitation_wish_messages to authenticated;
drop policy if exists wish_owner_read on public.invitation_wish_messages;
create policy wish_owner_read on public.invitation_wish_messages for select to authenticated
using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));
drop policy if exists wish_owner_hide on public.invitation_wish_messages;
create policy wish_owner_hide on public.invitation_wish_messages for update to authenticated
using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())))
with check (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));

-- Only public display fields leave this private function. No guest identifiers,
-- contact details, diet, RSVP counts, access tokens or hidden wishes are returned.
create or replace function invitation_private.list_wishes(p_slug text)
returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object('name',w.name,'message',w.message) order by w.created_at desc,w.id),'[]')
  from public.invitation_wish_messages w join public.invitations i on i.id=w.invitation_id
  where i.slug=p_slug and i.published and not w.hidden and nullif(btrim(w.message),'') is not null
    and i.theme->'public_wishes_visible' is distinct from 'false'::jsonb
$$;
revoke all on function invitation_private.list_wishes(text) from public;
grant execute on function invitation_private.list_wishes(text) to anon,authenticated;
create or replace function public.invitation_wishes(p_slug text) returns jsonb
language sql stable security invoker set search_path='' as $$ select invitation_private.list_wishes(p_slug) $$;
revoke all on function public.invitation_wishes(text) from public;
grant execute on function public.invitation_wishes(text) to anon,authenticated;

create or replace function invitation_private.own_wish(p_slug text,p_token text)
returns text language sql stable security definer set search_path='' as $$
  select w.message from public.invitation_wish_messages w
  join public.guests g on g.id=w.guest_id and g.invitation_id=w.invitation_id
  join public.invitations i on i.id=w.invitation_id
  where i.slug=p_slug and i.published and g.public_token=p_token and p_token ~ '^[a-f0-9]{64}$'
$$;
revoke all on function invitation_private.own_wish(text,text) from public;
grant execute on function invitation_private.own_wish(text,text) to anon,authenticated;
create or replace function public.invitation_own_wish(p_slug text,p_token text) returns text
language sql stable security invoker set search_path='' as $$ select invitation_private.own_wish(p_slug,p_token) $$;
revoke all on function public.invitation_own_wish(text,text) from public;
grant execute on function public.invitation_own_wish(text,text) to anon,authenticated;

-- New forms explicitly disclose public display and use this atomic endpoint.
-- Existing endpoints continue saving private replies without publishing them.
create or replace function invitation_private.respond_with_wish(
  p_slug text,p_token text,p_attending integer,p_message text,p_dietary text,
  p_event_mode boolean,p_selected_events text[],p_event_ids text[],p_version integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.invitations; g public.guests; receipt jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'This invitation link is invalid.'; end if;
  select * into i from public.invitations where slug=p_slug and published for share;
  if not found then raise exception 'This invitation is unavailable.'; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token for update;
  if not found then raise exception 'This invitation link is invalid.'; end if;
  if length(coalesce(p_message,''))>1000 then raise exception 'Please shorten your message.'; end if;
  if p_event_mode then
    receipt := invitation_private.respond_events(p_slug,p_token,p_attending,g.rsvp_message,p_dietary,p_selected_events,p_event_ids,p_version);
  else
    perform invitation_private.respond(p_slug,p_token,p_attending,g.rsvp_message,p_dietary);
    select jsonb_build_object('version',version) into receipt from public.guests where id=g.id;
  end if;
  if i.theme->'wishes_enabled' is distinct from 'false'::jsonb then
    insert into public.invitation_wish_messages(invitation_id,guest_id,name,message)
      values(i.id,g.id,g.name,btrim(coalesce(p_message,'')))
    on conflict(guest_id) do update set name=excluded.name,message=excluded.message;
    -- Preserve owner moderation even through clearing and re-entering a wish.
  end if;
  return receipt;
end $$;
revoke all on function invitation_private.respond_with_wish(text,text,integer,text,text,boolean,text[],text[],integer) from public;
grant execute on function invitation_private.respond_with_wish(text,text,integer,text,text,boolean,text[],text[],integer) to anon,authenticated;
create or replace function public.respond_to_invitation_with_wish(
  p_slug text,p_token text,p_attending integer,p_message text,p_dietary text,
  p_event_mode boolean,p_selected_events text[],p_event_ids text[],p_version integer
) returns jsonb language sql security invoker set search_path='' as $$
  select invitation_private.respond_with_wish(p_slug,p_token,p_attending,p_message,p_dietary,p_event_mode,p_selected_events,p_event_ids,p_version)
$$;
revoke all on function public.respond_to_invitation_with_wish(text,text,integer,text,text,boolean,text[],text[],integer) from public;
grant execute on function public.respond_to_invitation_with_wish(text,text,integer,text,text,boolean,text[],text[],integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
