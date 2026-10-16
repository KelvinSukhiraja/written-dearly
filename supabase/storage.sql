-- Public cover photos for invitations.
insert into storage.buckets (id, name, public)
values ('invitation-media', 'invitation-media', true)
on conflict (id) do nothing;

create policy "Public read invitation media"
  on storage.objects for select
  using (bucket_id = 'invitation-media');

create policy "Couples upload invitation media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invitation-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Couples update invitation media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'invitation-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
