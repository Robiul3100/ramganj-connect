
-- Add new columns to lost_found table for enhanced card UI
ALTER TABLE public.lost_found
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'সাধারণ',
  ADD COLUMN IF NOT EXISTS item_time text,
  ADD COLUMN IF NOT EXISTS identification_marks text,
  ADD COLUMN IF NOT EXISTS map_link text,
  ADD COLUMN IF NOT EXISTS is_high_priority boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expire_at timestamp with time zone;
