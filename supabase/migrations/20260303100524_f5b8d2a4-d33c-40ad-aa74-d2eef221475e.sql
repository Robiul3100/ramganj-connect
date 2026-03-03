
-- Create police_stations table for both stations and officers
CREATE TABLE public.police_stations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'station', -- 'station' or 'officer'
  name text NOT NULL,
  rank text DEFAULT NULL, -- for officers: OC, SI, Inspector, SP etc
  assigned_station text DEFAULT NULL, -- for officers
  station_image_url text DEFAULT NULL,
  profile_image_url text DEFAULT NULL,
  thana text DEFAULT NULL,
  district text DEFAULT NULL,
  division text DEFAULT NULL,
  service_area text DEFAULT NULL,
  location text DEFAULT NULL,
  phone text DEFAULT NULL,
  emergency_phone text DEFAULT NULL,
  duty_time text DEFAULT NULL,
  website_url text DEFAULT NULL,
  map_link text DEFAULT NULL,
  officer_count text DEFAULT NULL,
  service_types text[] DEFAULT '{}'::text[],
  badges text[] DEFAULT '{}'::text[],
  description text DEFAULT NULL,
  full_description text DEFAULT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  is_verified boolean DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.police_stations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin manage police" ON public.police_stations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit police" ON public.police_stations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read approved police" ON public.police_stations FOR SELECT USING (is_approved = true);

-- Trigger for updated_at
CREATE TRIGGER update_police_stations_updated_at
  BEFORE UPDATE ON public.police_stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
