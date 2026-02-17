
-- Create lost_found table for হারানো বিজ্ঞপ্তি
CREATE TABLE public.lost_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'lost', -- 'lost' or 'found'
  item_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  phone TEXT,
  item_date DATE DEFAULT CURRENT_DATE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Public read approved lost_found"
ON public.lost_found FOR SELECT
USING (is_approved = true);

CREATE POLICY "Anyone can submit lost_found"
ON public.lost_found FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin manage lost_found"
ON public.lost_found FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_lost_found_updated_at
BEFORE UPDATE ON public.lost_found
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found;
