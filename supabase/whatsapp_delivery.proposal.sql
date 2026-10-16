-- LOCAL PROPOSAL ONLY. Requires separate live schema/security approval.
-- One immutable automated invitation attempt per guest. No automatic retry.
begin;
create table public.whatsapp_deliveries (
  id uuid primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  guest_id uuid not null unique references public.guests(id) on delete cascade,
  recipient text not null check (recipient ~ '^[1-9][0-9]{6,14}$'),
  template_name text not null,
  template_language text not null,
  consent_confirmed_by uuid not null references auth.users(id),
  consent_confirmed_at timestamptz not null default now(),
  status text not null default 'sending' check(status in ('sending','unknown','accepted','sent','failed','delivered','read')),
  provider_id text unique,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.whatsapp_deliveries enable row level security;
create index whatsapp_delivery_invitation on public.whatsapp_deliveries(invitation_id);
create index whatsapp_delivery_owner_recent on public.whatsapp_deliveries(consent_confirmed_by,created_at);
revoke all on public.whatsapp_deliveries from public, anon, authenticated;
grant select on public.whatsapp_deliveries to authenticated;
grant select, insert, update on public.whatsapp_deliveries to service_role;
create policy whatsapp_owner_read on public.whatsapp_deliveries for select to authenticated
using (exists(select 1 from public.invitations i where i.id=invitation_id and i.user_id=(select auth.uid())));

-- Called only from the authenticated server after authoritative guest lookup.
-- Recheck owner, recipient, publication and version atomically under a row lock.
create function public.reserve_whatsapp_invitation(p_id uuid,p_guest uuid,p_owner uuid,p_version integer,p_recipient text,p_template text,p_language text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare g public.guests;
begin
  select guests.* into g from public.guests join public.invitations i on i.id=guests.invitation_id
  where guests.id=p_guest and i.user_id=p_owner and i.published for update of guests;
  if not found or g.version<>p_version or regexp_replace(g.phone,'[^0-9]','','g') is distinct from p_recipient then return false; end if;
  -- Per-owner burst cap; serialize reservations so concurrent clicks cannot bypass it.
  perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
  if (select count(*) from public.whatsapp_deliveries where consent_confirmed_by=p_owner and created_at>now()-interval '1 minute')>=20 then return false; end if;
  insert into public.whatsapp_deliveries(id,invitation_id,guest_id,recipient,template_name,template_language,consent_confirmed_by)
  values(p_id,g.invitation_id,g.id,p_recipient,p_template,p_language,p_owner) on conflict(guest_id) do nothing;
  return found;
end $$;
revoke all on function public.reserve_whatsapp_invitation(uuid,uuid,uuid,integer,text,text,text) from public,anon,authenticated;
grant execute on function public.reserve_whatsapp_invitation(uuid,uuid,uuid,integer,text,text,text) to service_role;

-- Shared by provider response and signed receipts. Higher states never regress.
create function public.record_whatsapp_status(p_attempt uuid,p_provider text,p_recipient text,p_status text,p_code text)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_status not in ('unknown','accepted','sent','failed','delivered','read') then raise exception 'Invalid status'; end if;
  update public.whatsapp_deliveries d set
    provider_id=coalesce(d.provider_id,p_provider),
    status=case when array_position(array['sending','unknown','accepted','sent','failed','delivered','read'],p_status)>
      array_position(array['sending','unknown','accepted','sent','failed','delivered','read'],d.status) then p_status else d.status end,
    error_code=case when p_status='failed' and d.status not in ('delivered','read') then p_code else d.error_code end,
    updated_at=now()
  where ((p_attempt is not null and d.id=p_attempt) or (p_attempt is null and d.provider_id=p_provider))
    and d.recipient=p_recipient and (d.provider_id is null or d.provider_id=p_provider or p_provider is null);
end $$;
revoke all on function public.record_whatsapp_status(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_whatsapp_status(uuid,text,text,text,text) to service_role;
commit;
