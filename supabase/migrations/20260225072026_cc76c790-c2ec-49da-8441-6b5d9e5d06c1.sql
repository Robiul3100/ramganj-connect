
-- Allow authenticated users to upload to slider-images bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload slider images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth upload slider images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'slider-images');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth update slider images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth update slider images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'slider-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth delete slider images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth delete slider images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'slider-images');
  END IF;
END $$;
