-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'client');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create invitations table
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role app_role NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for invitations: Admins can manage all invitations
CREATE POLICY "Admins can manage all invitations"
ON public.invitations FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Coaches can create client invitations
CREATE POLICY "Coaches can create client invitations"
ON public.invitations FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'coach') 
    AND role = 'client'
    AND auth.uid() = invited_by
);

-- Coaches can view their own invitations
CREATE POLICY "Coaches can view their own invitations"
ON public.invitations FOR SELECT
USING (
    public.has_role(auth.uid(), 'coach') 
    AND auth.uid() = invited_by
);

-- Anyone can view invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
ON public.invitations FOR SELECT
USING (true);

-- Add coach_id to clients table to link clients with their coach
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Update profiles to track who invited the user
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Function to handle invitation acceptance and role assignment
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    
    -- Update profile with invited_by
    UPDATE public.profiles 
    SET invited_by = inv.invited_by
    WHERE user_id = auth.uid();
    
    RETURN TRUE;
END;
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'coach' THEN 2 
      WHEN 'client' THEN 3 
    END
  LIMIT 1
$$;