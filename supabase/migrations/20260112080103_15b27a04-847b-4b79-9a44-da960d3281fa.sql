-- Allow coaches to view profiles of clients they invited
CREATE POLICY "Coaches can view profiles of their clients"
ON public.profiles
FOR SELECT
USING (auth.uid() = invited_by);