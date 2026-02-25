
-- Add view_count to service_categories
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Function to increment category view count
CREATE OR REPLACE FUNCTION public.increment_category_view(cat_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.service_categories SET view_count = view_count + 1 WHERE id = cat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
