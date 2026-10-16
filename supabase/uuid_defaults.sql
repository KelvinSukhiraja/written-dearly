ALTER TABLE public.templates ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.invitations ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.guests ALTER COLUMN id SET DEFAULT gen_random_uuid();
