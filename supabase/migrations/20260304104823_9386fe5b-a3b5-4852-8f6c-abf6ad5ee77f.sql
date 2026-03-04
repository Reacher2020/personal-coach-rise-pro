
CREATE TABLE public.user_app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text NOT NULL DEFAULT 'dark',
  time_format text NOT NULL DEFAULT '24h',
  language text NOT NULL DEFAULT 'pl',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Require auth for user_app_settings" ON public.user_app_settings
  FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own settings" ON public.user_app_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_app_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_app_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
