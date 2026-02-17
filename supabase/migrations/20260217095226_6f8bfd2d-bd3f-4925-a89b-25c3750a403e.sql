INSERT INTO public.service_categories (name, slug, icon, sort_order, is_active) VALUES
('ডায়াগনস্টিক', 'diagnostic', 'Activity', 28, true),
('গাড়ি ভাড়া', 'car-rental', 'Car', 29, true),
('পৌর সেবা', 'municipal', 'Building', 30, true),
('উদ্যোক্তা', 'entrepreneur', 'TrendingUp', 31, true),
('হোটেল', 'hotel', 'BedDouble', 32, true),
('রেস্টুরেন্ট', 'restaurant', 'Coffee', 33, true),
('ভিডিও', 'video', 'Video', 34, true),
('নার্সারি', 'nursery', 'TreePine', 35, true)
ON CONFLICT DO NOTHING;