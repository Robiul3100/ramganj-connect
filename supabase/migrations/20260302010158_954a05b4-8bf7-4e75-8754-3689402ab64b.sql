
-- Push subscriptions table for FCM tokens
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  fcm_token text NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  UNIQUE(fcm_token)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert subscription" ON public.push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own subscription" ON public.push_subscriptions
  FOR UPDATE USING (true);

CREATE POLICY "Admin read subscriptions" ON public.push_subscriptions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read own subscription" ON public.push_subscriptions
  FOR SELECT USING (true);

-- Add new columns to admin_notifications for enhanced system
ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS redirect_url text,
  ADD COLUMN IF NOT EXISTS target_type text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS target_value text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_draft boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sent_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS failed_count integer NOT NULL DEFAULT 0;

-- Enable realtime for push_subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.push_subscriptions;
