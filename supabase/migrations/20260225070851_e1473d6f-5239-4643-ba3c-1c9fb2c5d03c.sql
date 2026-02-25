
-- Create storage bucket for slider images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('slider-images', 'slider-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read slider images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read slider images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'slider-images');
  END IF;
END $$;
