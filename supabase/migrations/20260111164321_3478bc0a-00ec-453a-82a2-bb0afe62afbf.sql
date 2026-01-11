
-- Update accept_invitation function to save email from invitation to profile
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    inv RECORD;
BEGIN
    -- Get invitation
    SELECT * INTO inv FROM public.invitations 
    WHERE token = invitation_token 
    AND status = 'pending' 
    AND expires_at > now();
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Assign role to user
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), inv.role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update invitation status
    UPDATE public.invitations 
    SET status = 'accepted', accepted_at = now()
    WHERE id = inv.id;
    
    -- Update profile with invited_by and email from invitation
    UPDATE public.profiles 
    SET 
        invited_by = inv.invited_by,
        email = COALESCE(email, inv.email)
    WHERE user_id = auth.uid();
    
    RETURN TRUE;
END;
$$;
