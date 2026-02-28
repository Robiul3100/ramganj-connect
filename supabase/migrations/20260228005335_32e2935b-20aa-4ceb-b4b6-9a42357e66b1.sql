
-- Create offices table for government/important offices directory
CREATE TABLE public.offices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  phone TEXT,
  address TEXT,
  category TEXT NOT NULL DEFAULT 'সরকারি',
  description TEXT,
  visiting_hours TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- Public read active offices
CREATE POLICY "Public read active offices" ON public.offices
  FOR SELECT USING (is_active = true);

-- Admin manage offices
CREATE POLICY "Admin manage offices" ON public.offices
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.offices;
