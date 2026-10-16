-- Allow guests to RSVP on a published invitation (insert if they are not already on the list).
-- Updates for published invitations are already allowed by guests_update_own_or_published.

DROP POLICY IF EXISTS "guests_insert_rsvp_on_published" ON public.guests;
CREATE POLICY "guests_insert_rsvp_on_published" ON public.guests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id AND i.published = true
    )
  );
