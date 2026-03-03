
-- Add new columns to lost_found table for enhanced card system
ALTER TABLE public.lost_found 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS person_name TEXT,
ADD COLUMN IF NOT EXISTS person_image_url TEXT,
ADD COLUMN IF NOT EXISTS reward TEXT,
ADD COLUMN IF NOT EXISTS detail_description TEXT;
