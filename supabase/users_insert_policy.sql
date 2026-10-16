-- Allow a couple to create their profile if the Auth trigger did not.
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());
