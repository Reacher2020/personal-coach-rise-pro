
-- Add new columns to client_surveys for sections 2-7
ALTER TABLE public.client_surveys
  ADD COLUMN primary_goal text,
  ADD COLUMN motivation_reason text,
  ADD COLUMN motivation_level integer,
  ADD COLUMN training_experience text,
  ADD COLUMN quit_reasons text[],
  ADD COLUMN health_issues text[],
  ADD COLUMN health_description text,
  ADD COLUMN sleep_hours text,
  ADD COLUMN work_type text,
  ADD COLUMN stress_level text,
  ADD COLUMN weekly_availability text;
