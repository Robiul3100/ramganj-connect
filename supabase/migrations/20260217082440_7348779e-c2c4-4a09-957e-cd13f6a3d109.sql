
-- Add view_count column to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_news_view(news_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.news SET view_count = view_count + 1 WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
