-- Drop the overly permissive policy that exposes all invitation data
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.invitations;

-- Create a secure RPC function to get invitation by token (for registration flow)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(invitation_token text)
RETURNS TABLE (
  id uuid,
  email text,
  role app_role,
  status text,
  expires_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.email,
    i.role,
    i.status,
    i.expires_at
  FROM public.invitations i
  WHERE i.token = invitation_token
    AND i.status = 'pending'
    AND i.expires_at > now();
END;
$$;