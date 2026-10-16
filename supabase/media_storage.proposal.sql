-- Approved and applied 12 October 2026 as invitation_media_storage.
-- Historical scoped SQL; do not reapply. Matches MediaUpload's unique-file upload flow.
-- Public media URLs allow invitation guests to view photos and play music.
-- Public downloads do not require a public SELECT/listing policy.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-media', 'invitation-media', true, 6291456,
  array['image/jpeg','image/png','image/webp','audio/mpeg','audio/mp4','audio/ogg']);

create policy "Invitation media owner upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
-- No overwrite, listing or deletion permissions are needed by the current UI.
commit;
