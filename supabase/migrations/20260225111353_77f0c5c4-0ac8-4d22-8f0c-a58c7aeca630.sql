
-- Create client onboarding survey responses table
CREATE TABLE public.client_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  gender TEXT,
  height_cm NUMERIC,
  starting_weight_kg NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_surveys ENABLE ROW LEVEL SECURITY;

-- Users can view their own survey
CREATE POLICY "Users can view their own survey"
ON public.client_surveys FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own survey
CREATE POLICY "Users can insert their own survey"
ON public.client_surveys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own survey
CREATE POLICY "Users can update their own survey"
ON public.client_surveys FOR UPDATE
USING (auth.uid() = user_id);

-- Coaches can view surveys of their clients
CREATE POLICY "Coaches can view client surveys"
ON public.client_surveys FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.user_id = client_surveys.user_id
      AND c.coach_id = auth.uid()
  )
);

-- Admins can view all surveys
CREATE POLICY "Admins can view all surveys"
ON public.client_surveys FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Require authentication
CREATE POLICY "Require authentication for client_surveys access"
ON public.client_surveys FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
