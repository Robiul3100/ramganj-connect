
-- Add new columns to events table for the redesigned event card system
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tagline text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'upcoming';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date timestamp with time zone;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_time text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_name text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_image_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS organizer_location text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT true;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS capacity text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_open boolean DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_link text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS map_link text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS full_description text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS phone text;
