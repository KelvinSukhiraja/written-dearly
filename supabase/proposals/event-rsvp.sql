-- LOCAL PROPOSAL ONLY. Requires a separate live-application checkpoint.
-- Additive upgrade for the inspected guest_workflow schema, not the member cutover.
begin;

alter table public.guests add column if not exists event_responses jsonb not null default '{}';

-- Missing response keys mean pending; no fabricated backfill of legacy replies.
create or replace function invitation_private.validate_event_responses()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare item record; n integer := 0;
begin
  if jsonb_typeof(new.event_responses) is distinct from 'object' then
    raise exception 'Event responses must be an object.';
  end if;
  for item in select * from jsonb_each(new.event_responses) loop
    n := n + 1;
    if n > 30 or length(item.key) not between 1 and 80
      or jsonb_typeof(item.value) <> 'string'
      or item.value #>> '{}' not in ('attending','declined') then
      raise exception 'Invalid event response.';
    end if;
  end loop;
  if new.rsvp_status = 'pending' then new.event_responses := '{}'; end if;
  if new.rsvp_status = 'declined' then
    select coalesce(jsonb_object_agg(key,'declined'::text),'{}') into new.event_responses
      from jsonb_each(new.event_responses);
  end if;
  if cardinality(new.event_ids) > 0 then
    select coalesce(jsonb_object_agg(key,value),'{}') into new.event_responses
      from jsonb_each(new.event_responses) where key = any(new.event_ids);
  end if;
  return new;
end $$;
revoke all on function invitation_private.validate_event_responses() from public;
drop trigger if exists guests_validate_event_responses on public.guests;
create trigger guests_validate_event_responses before insert or update of
  event_responses,rsvp_status,event_ids on public.guests
  for each row execute function invitation_private.validate_event_responses();

create or replace function invitation_private.guest_context(p_slug text,p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare g public.guests; i public.invitations; allowed text[]; replies jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then return null; end if;
  select * into i from public.invitations where slug=p_slug and published;
  if not found then return null; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token;
  if not found then return null; end if;
  select coalesce(array_agg(e->>'id'),'{}') into allowed
    from jsonb_array_elements(coalesce(i.theme->'events','[]')) e
    where nullif(btrim(e->>'title'),'') is not null
      and (cardinality(g.event_ids)=0 or e->>'id'=any(g.event_ids));
  select coalesce(jsonb_object_agg(key,value),'{}') into replies
    from jsonb_each(g.event_responses) where key=any(allowed);
  return jsonb_build_object('name',g.name,'invited_count',g.invited_count,'rsvp_status',g.rsvp_status,
    'rsvp_attending_count',g.rsvp_attending_count,'rsvp_message',g.rsvp_message,'dietary',g.dietary,
    'table_name',g.table_name,'checkin_token',g.checkin_token,'event_ids',g.event_ids,
    'event_responses',replies,'version',g.version,'event_rsvp_available',true);
end $$;
revoke all on function invitation_private.guest_context(text,text) from public;
grant execute on function invitation_private.guest_context(text,text) to anon,authenticated;

create or replace function invitation_private.respond_events(
  p_slug text,p_token text,p_attending integer,p_message text,p_dietary text,
  p_selected_events text[],p_event_ids text[],p_version integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare g public.guests; i public.invitations; allowed text[]; selected text[];
  replies jsonb; next_version integer;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'This invitation link is invalid.'; end if;
  select * into i from public.invitations where slug=p_slug and published for share;
  if not found then raise exception 'This invitation is unavailable.'; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token for update;
  if not found then raise exception 'This invitation link is invalid.'; end if;
  if i.theme->'rsvp_events_enabled' is distinct from 'true'::jsonb then raise exception 'RSVP settings changed. Reload your invitation before replying.'; end if;
  if coalesce((i.theme->>'rsvp_closed')::boolean,false) or (nullif(i.theme->>'rsvp_deadline','') is not null and now()>(i.theme->>'rsvp_deadline')::timestamptz) then raise exception 'RSVP has closed. Please contact the couple.'; end if;
  if p_attending is null or p_attending<0 or p_attending>g.invited_count then raise exception 'Please stay within your allocated seats.'; end if;
  if p_version is null or p_version<>g.version then raise exception 'Your invitation changed. Reload to see the latest reply before submitting again.'; end if;
  if length(coalesce(p_message,''))>1000 or length(coalesce(p_dietary,''))>500 then raise exception 'Please shorten your message.'; end if;
  select coalesce(array_agg(e->>'id' order by e->>'id'),'{}') into allowed
    from jsonb_array_elements(coalesce(i.theme->'events','[]')) e
    where nullif(btrim(e->>'title'),'') is not null
      and (cardinality(g.event_ids)=0 or e->>'id'=any(g.event_ids));
  if cardinality(allowed)=0 or cardinality(allowed)>30
     or exists(select 1 from unnest(allowed) id group by id having count(*)>1)
     or exists(select 1 from unnest(allowed) id where id is null or length(id) not between 1 and 80)
     then raise exception 'Event attendance is unavailable. Please contact the couple.'; end if;
  if p_event_ids is null or cardinality(p_event_ids)>30 or array_position(p_event_ids,null) is not null
     or (select coalesce(array_agg(id order by id),'{}') from unnest(p_event_ids) id) is distinct from allowed
     then raise exception 'Wedding events changed. Reload your invitation before replying.'; end if;
  if p_selected_events is null or cardinality(p_selected_events)>30 or array_position(p_selected_events,null) is not null
    or not p_selected_events <@ allowed then raise exception 'Choose only the events on your invitation.'; end if;
  select coalesce(array_agg(distinct id),'{}') into selected from unnest(p_selected_events) id;
  if cardinality(selected)<>cardinality(p_selected_events) then raise exception 'Choose each event once.'; end if;
  if p_attending>0 and cardinality(selected)=0 then raise exception 'Choose at least one event, or select that you cannot attend.'; end if;
  if p_attending=0 and cardinality(selected)>0 then raise exception 'Declined replies cannot include attending events.'; end if;
  if g.responded_at is not null and g.responded_at > timezone('utc',now())-interval '5 seconds' then raise exception 'Please wait a few seconds before updating your reply.'; end if;
  select jsonb_object_agg(id,case when id=any(selected) then 'attending' else 'declined' end)
    into replies from unnest(allowed) id;
  update public.guests set rsvp_status=(case when p_attending=0 then 'declined' else 'attending' end)::public."RsvpStatus",
    rsvp_attending_count=p_attending,rsvp_message=nullif(p_message,''),dietary=case when p_attending=0 then null else nullif(p_dietary,'') end,
    event_responses=replies,responded_at=timezone('utc',now()),version=version+1 where id=g.id
    returning version into next_version;
  return jsonb_build_object('version',next_version,'event_responses',replies);
end $$;
revoke all on function invitation_private.respond_events(text,text,integer,text,text,text[],text[],integer) from public;
grant execute on function invitation_private.respond_events(text,text,integer,text,text,text[],text[],integer) to anon,authenticated;
create or replace function public.respond_to_invitation_events(
  p_slug text,p_token text,p_attending integer,p_message text,p_dietary text,
  p_selected_events text[],p_event_ids text[],p_version integer
) returns jsonb language sql security invoker set search_path = '' as $$
  select invitation_private.respond_events(p_slug,p_token,p_attending,p_message,p_dietary,p_selected_events,p_event_ids,p_version)
$$;
revoke all on function public.respond_to_invitation_events(text,text,integer,text,text,text[],text[],integer) from public;
grant execute on function public.respond_to_invitation_events(text,text,integer,text,text,text[],text[],integer) to anon,authenticated;

-- Preserve the existing endpoint for invitations that have not enabled event RSVP.
-- A stale/legacy form cannot bypass event selection after the setting changes.
create or replace function invitation_private.respond(p_slug text,p_token text,p_attending integer,p_message text,p_dietary text)
returns void language plpgsql security definer set search_path='' as $$
declare g public.guests; i public.invitations;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'This invitation link is invalid.'; end if;
  select * into i from public.invitations where slug=p_slug and published for share;
  if not found then raise exception 'This invitation is unavailable.'; end if;
  select * into g from public.guests where invitation_id=i.id and public_token=p_token for update;
  if not found then raise exception 'This invitation link is invalid.'; end if;
  if i.theme->'rsvp_events_enabled'='true'::jsonb then raise exception 'RSVP settings changed. Reload your invitation before replying.'; end if;
  if coalesce((i.theme->>'rsvp_closed')::boolean,false) or (nullif(i.theme->>'rsvp_deadline','') is not null and now()>(i.theme->>'rsvp_deadline')::timestamptz) then raise exception 'RSVP has closed. Please contact the couple.'; end if;
  if p_attending is null or p_attending<0 or p_attending>g.invited_count then raise exception 'Please stay within your allocated seats.'; end if;
  if length(coalesce(p_message,''))>1000 or length(coalesce(p_dietary,''))>500 then raise exception 'Please shorten your message.'; end if;
  if g.responded_at is not null and g.responded_at > timezone('utc',now())-interval '5 seconds' then raise exception 'Please wait a few seconds before updating your reply.'; end if;
  update public.guests set rsvp_status=(case when p_attending=0 then 'declined' else 'attending' end)::public."RsvpStatus",
    rsvp_attending_count=p_attending,rsvp_message=nullif(p_message,''),dietary=nullif(p_dietary,''),
    event_responses='{}',responded_at=timezone('utc',now()),version=version+1 where id=g.id;
end $$;
revoke all on function invitation_private.respond(text,text,integer,text,text) from public;
grant execute on function invitation_private.respond(text,text,integer,text,text) to anon,authenticated;

notify pgrst, 'reload schema';
commit;
