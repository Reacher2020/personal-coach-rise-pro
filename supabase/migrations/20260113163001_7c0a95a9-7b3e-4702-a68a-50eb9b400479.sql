-- Add SELECT policy allowing clients to view their own record via user_id
CREATE POLICY "Clients can view their own record"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);