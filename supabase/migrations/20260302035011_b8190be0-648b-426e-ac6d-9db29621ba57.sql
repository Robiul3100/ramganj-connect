ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS svg_icon TEXT DEFAULT NULL;
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT NULL;