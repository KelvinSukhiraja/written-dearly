-- Written Dearly schema (already applied to the Supabase project).
-- Future changes should be new SQL files in this folder, then run in the Supabase SQL editor.

CREATE TYPE "GuestSide" AS ENUM ('bride', 'groom');
CREATE TYPE "RsvpStatus" AS ENUM ('pending', 'attending', 'declined');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "component_key" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "template_id" UUID NOT NULL,
    "groom_name" TEXT,
    "bride_name" TEXT,
    "wedding_date" TIMESTAMP(3),
    "venue_name" TEXT,
    "venue_address" TEXT,
    "story" TEXT,
    "cover_photo_url" TEXT,
    "theme" JSONB NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invitation_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "side" "GuestSide" NOT NULL,
    "group" TEXT,
    "invited_count" INTEGER NOT NULL DEFAULT 1,
    "rsvp_status" "RsvpStatus" NOT NULL DEFAULT 'pending',
    "rsvp_attending_count" INTEGER,
    "rsvp_message" TEXT,
    "responded_at" TIMESTAMP(3),
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "checked_in_at" TIMESTAMP(3),
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "templates_component_key_key" ON "templates"("component_key");
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");
CREATE INDEX "invitations_user_id_idx" ON "invitations"("user_id");
CREATE INDEX "guests_invitation_id_idx" ON "guests"("invitation_id");
CREATE INDEX "guests_rsvp_status_idx" ON "guests"("rsvp_status");

ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guests" ADD CONSTRAINT "guests_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users"
  ADD CONSTRAINT "users_id_fkey"
  FOREIGN KEY ("id") REFERENCES auth.users ("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "templates_select_active" ON public.templates FOR SELECT USING (is_active = true);
CREATE POLICY "invitations_select_own_or_published" ON public.invitations FOR SELECT USING (published = true OR user_id = auth.uid());
CREATE POLICY "invitations_insert_own" ON public.invitations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "invitations_update_own" ON public.invitations FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "invitations_delete_own" ON public.invitations FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "guests_select_own_or_published" ON public.guests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id
        AND (i.published = true OR i.user_id = auth.uid())
    )
  );

CREATE POLICY "guests_insert_own" ON public.guests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "guests_insert_rsvp_on_published" ON public.guests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id AND i.published = true
    )
  );

CREATE POLICY "guests_update_own_or_published" ON public.guests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id
        AND (i.published = true OR i.user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id
        AND (i.published = true OR i.user_id = auth.uid())
    )
  );

CREATE POLICY "guests_delete_own" ON public.guests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = guests.invitation_id AND i.user_id = auth.uid()
    )
  );

INSERT INTO public.templates (id, name, component_key, is_active)
VALUES (gen_random_uuid(), 'Classic', 'classic', true)
ON CONFLICT (component_key) DO NOTHING;
