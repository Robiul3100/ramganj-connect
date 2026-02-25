
ALTER TABLE public.advertisements ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_ad_click(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.advertisements SET click_count = click_count + 1 WHERE id = ad_id;
END;
$$;
