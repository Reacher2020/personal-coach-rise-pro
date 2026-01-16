-- Drop the overly permissive policy that allows any authenticated user to access session_reminders
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which automatically bypasses RLS
DROP POLICY IF EXISTS "Service role can manage reminders" ON public.session_reminders;