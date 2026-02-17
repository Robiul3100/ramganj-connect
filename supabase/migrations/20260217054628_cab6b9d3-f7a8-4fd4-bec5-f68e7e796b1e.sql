
-- Create service_categories table
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Tag',
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.service_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create unified services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  phone text,
  whatsapp text,
  address text,
  area text,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  submitted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved services" ON public.services FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit service" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_categories;

-- Seed categories
INSERT INTO public.service_categories (name, slug, icon, sort_order) VALUES
  ('ডক্টর তালিকা', 'doctors', 'Stethoscope', 1),
  ('হাসপাতাল', 'hospitals', 'Building2', 2),
  ('ফার্মেসি', 'pharmacy', 'Pill', 3),
  ('শিক্ষা প্রতিষ্ঠান', 'education', 'GraduationCap', 4),
  ('দোকান', 'shops', 'Store', 5),
  ('মার্কেটপ্লেস', 'marketplace', 'Tag', 6),
  ('চাকরি', 'jobs', 'Briefcase', 7),
  ('হারানো ও পাওয়া', 'lost-found', 'MapPin', 8),
  ('ইভেন্ট', 'events', 'Calendar', 9),
  ('প্রবাসী কর্নার', 'expatriate', 'Globe', 10),
  ('অ্যাম্বুলেন্স', 'ambulance', 'Ambulance', 11),
  ('পুলিশ', 'police', 'Shield', 12),
  ('ফায়ার সার্ভিস', 'fire', 'Flame', 13),
  ('যাতায়াত', 'transport', 'Bus', 14),
  ('বিদ্যুৎ অফিস', 'electricity', 'Zap', 15),
  ('আইনি সহায়তা', 'legal', 'Scale', 16),
  ('ব্যাংক', 'bank', 'Landmark', 17),
  ('সংগঠন', 'organizations', 'Users', 18),
  ('পর্যটন', 'tourism', 'Umbrella', 19),
  ('কুরিয়ার ও পার্সেল', 'courier', 'Package', 20),
  ('কৃষি ও খামার', 'agriculture', 'Sprout', 21),
  ('বাসা ভাড়া', 'rent', 'Home', 22),
  ('টিউশন মিডিয়া', 'tuition', 'BookOpenCheck', 23),
  ('খাবার ডেলিভারি', 'food', 'UtensilsCrossed', 24),
  ('মেরামতি সেবা', 'repair', 'Wrench', 25),
  ('দলিল লেখক', 'deed-writer', 'PenTool', 26),
  ('বিবাহ মিডিয়া', 'marriage', 'Heart', 27);

-- Migrate existing data into unified services table
-- Doctors
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT d.name, NULL, d.phone, d.location, NULL,
  CASE WHEN d.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'doctors'),
  jsonb_build_object('specialty', d.specialty)
FROM public.doctors d;

-- Shops
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT s.name, NULL, s.phone, s.location, NULL,
  CASE WHEN s.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'shops'),
  jsonb_build_object('shop_category', s.category)
FROM public.shops s;

-- Marketplace
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT m.title, m.description, m.phone, m.location, NULL,
  CASE WHEN m.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'marketplace'),
  jsonb_build_object('price', m.price, 'tags', m.tags, 'item_category', m.category)
FROM public.marketplace m;

-- Education
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT e.name, NULL, e.phone, e.location, NULL,
  CASE WHEN e.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'education'),
  jsonb_build_object('edu_category', e.category)
FROM public.education_institutes e;

-- Lost & Found
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT lf.item_name, lf.description, lf.phone, lf.location, NULL,
  CASE WHEN lf.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'lost-found'),
  jsonb_build_object('type', lf.type, 'item_date', lf.item_date)
FROM public.lost_found lf;

-- Events
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT ev.title, ev.description, NULL, ev.location, NULL,
  CASE WHEN ev.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'events'),
  jsonb_build_object('event_category', ev.category, 'event_date', ev.event_date)
FROM public.events ev;

-- Jobs
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT j.title, j.description, j.phone, NULL, NULL,
  CASE WHEN j.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'jobs'),
  jsonb_build_object('company', j.company, 'salary_range', j.salary_range, 'deadline', j.deadline, 'job_category', j.category)
FROM public.jobs j;

-- Expatriate
INSERT INTO public.services (title, description, phone, address, area, status, category_id, metadata)
SELECT ef.name, ef.description, ef.phone, ef.location, NULL,
  CASE WHEN ef.is_approved THEN 'approved' ELSE 'pending' END,
  (SELECT id FROM public.service_categories WHERE slug = 'expatriate'),
  jsonb_build_object('country', ef.country, 'expat_category', ef.category)
FROM public.expatriate_forums ef;

-- Create indexes for performance
CREATE INDEX idx_services_category ON public.services(category_id);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_services_featured ON public.services(is_featured) WHERE is_featured = true;
CREATE INDEX idx_services_search ON public.services USING gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, '')));
