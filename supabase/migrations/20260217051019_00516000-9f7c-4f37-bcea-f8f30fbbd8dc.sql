
-- Marketplace table
CREATE TABLE public.marketplace (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  location TEXT,
  phone TEXT,
  category TEXT NOT NULL DEFAULT 'সাধারণ',
  tags TEXT[] DEFAULT '{}',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage marketplace" ON public.marketplace FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit marketplace" ON public.marketplace FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved marketplace" ON public.marketplace FOR SELECT USING (is_approved = true);

-- Doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'সাধারণ',
  location TEXT,
  phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage doctors" ON public.doctors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit doctor" ON public.doctors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved doctors" ON public.doctors FOR SELECT USING (is_approved = true);

-- Education institutes table
CREATE TABLE public.education_institutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'স্কুল',
  location TEXT,
  phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.education_institutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage education" ON public.education_institutes FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit education" ON public.education_institutes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved education" ON public.education_institutes FOR SELECT USING (is_approved = true);

-- Shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'সাধারণ',
  location TEXT,
  phone TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage shops" ON public.shops FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit shop" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved shops" ON public.shops FOR SELECT USING (is_approved = true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.education_institutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
