import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type InvitationRole = 'coach' | 'client';

interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

// Extended invitation with token - only used when creating new invitations
interface InvitationWithToken extends Invitation {
  token: string;
}

export const useInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createInvitation = async (email: string, role: InvitationRole) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    setLoading(true);
    try {
      // When creating, we need the token to share with the invitee
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          invited_by: user.id,
        })
        .select('id, email, role, status, token, expires_at, created_at, accepted_at')
        .single();

      if (error) throw error;

      toast({
        title: 'Zaproszenie wysłane',
        description: `Zaproszenie zostało utworzone dla ${email}`,
      });

      return { data: data as InvitationWithToken, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // List invitations with tokens - creators need tokens to share invite links
  // RLS ensures only the creator (or admin) can see their own invitations
  const getMyInvitations = async () => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('invitations')
      .select('id, email, role, status, token, expires_at, created_at, accepted_at')
      .eq('invited_by', user.id)
      .order('created_at', { ascending: false });

    return { data: data as InvitationWithToken[] | null, error };
  };

  // List all invitations with tokens - admin needs tokens to share invite links
  // RLS ensures only admins can access all invitations
  const getAllInvitations = async () => {
    const { data, error } = await supabase
      .from('invitations')
      .select('id, email, role, status, token, expires_at, created_at, accepted_at')
      .order('created_at', { ascending: false });

    return { data: data as InvitationWithToken[] | null, error };
  };

  const acceptInvitation = async (token: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('accept_invitation', { invitation_token: token });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Zaproszenie zaakceptowane',
          description: 'Twoje konto zostało aktywowane',
        });
        return { success: true, error: null };
      } else {
        throw new Error('Zaproszenie nieważne lub wygasło');
      }
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getInvitationByToken = async (token: string) => {
    const { data, error } = await supabase
      .rpc('get_invitation_by_token', { invitation_token: token });

    // RPC returns array, get first item
    const invitation = data && data.length > 0 ? data[0] : null;
    return { data: invitation as Pick<Invitation, 'id' | 'email' | 'role' | 'status' | 'expires_at'> | null, error };
  };

  const deleteInvitation = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Zaproszenie usunięte',
        description: 'Zaproszenie zostało usunięte',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createInvitation,
    getMyInvitations,
    getAllInvitations,
    acceptInvitation,
    getInvitationByToken,
    deleteInvitation,
  };
};
