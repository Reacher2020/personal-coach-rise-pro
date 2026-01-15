-- Create table to track sent session reminders (to avoid duplicates)
CREATE TABLE public.session_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '1h')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, reminder_type)
);

-- Enable RLS
ALTER TABLE public.session_reminders ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert reminders (for edge function)
CREATE POLICY "Service role can manage reminders"
ON public.session_reminders
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;