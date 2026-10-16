-- REVIEW ONLY: user approval required before applying to the live catalog.
-- No changes to existing invitations or their selected template.
insert into public.templates (name, component_key, thumbnail_url, is_active)
values ('Coastal', 'coastal', '/invitation-art/coastal/cover.png', true)
on conflict (component_key) do nothing;
