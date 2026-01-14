-- Allow coaches to view admin profiles for messaging
CREATE POLICY "Coaches can view admin profiles for messaging"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'coach'::app_role) AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = profiles.user_id 
    AND user_roles.role = 'admin'
  )
);

-- Allow coaches to view admin user_roles for listing
CREATE POLICY "Users can view roles for messaging"
ON public.user_roles
FOR SELECT
USING (
  (has_role(auth.uid(), 'coach'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);