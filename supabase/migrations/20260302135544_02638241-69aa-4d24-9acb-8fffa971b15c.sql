
CREATE TABLE public.developer_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'ডেভেলপার',
  designation text NOT NULL DEFAULT 'ফুল স্ট্যাক ডেভেলপার',
  avatar_url text,
  cover_url text,
  phone text,
  messenger_url text,
  facebook_url text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  bio text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.developer_profile (name, designation) VALUES ('ডেভেলপার', 'ফুল স্ট্যাক ডেভেলপার');

-- Public read
ALTER TABLE public.developer_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read developer profile" ON public.developer_profile FOR SELECT USING (true);
CREATE POLICY "Admin manage developer profile" ON public.developer_profile FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
