-- Add expire_at column to advertisements
ALTER TABLE public.advertisements ADD COLUMN expire_at timestamp with time zone DEFAULT NULL;

-- Create a function to deactivate expired ads
CREATE OR REPLACE FUNCTION public.deactivate_expired_ads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.advertisements
  SET is_active = false
  WHERE expire_at IS NOT NULL
    AND expire_at < now()
    AND is_active = true;
END;
$$;

-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;