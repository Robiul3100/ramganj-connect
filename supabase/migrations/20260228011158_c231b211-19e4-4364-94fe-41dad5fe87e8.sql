
-- Page views tracking table
CREATE TABLE public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  visitor_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can track page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Insert default maintenance mode settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('maintenance_mode', 'false'),
  ('maintenance_message', 'সাইটটি রক্ষণাবেক্ষণের জন্য সাময়িকভাবে বন্ধ রয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।')
ON CONFLICT (key) DO NOTHING;

-- Enable realtime for page_views
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;
