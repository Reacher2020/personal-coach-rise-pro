import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type InvitationRole = 'coach' | 'client' | 'admin';

interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  invited_by: string;
}

export const useInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data as Invitation[] ?? []);
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createInvitation = async (email: string, role: InvitationRole) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invitations')
        .insert({
          email,
          role,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Zaproszenie wysłane',
        description: `Zaproszenie zostało utworzone dla ${email}`,
      });

      await fetchInvitations();
      return { data, error: null };
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

  const getMyInvitations = async () => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_by', user.id)
      .order('created_at', { ascending: false });

    return { data: data as Invitation[] | null, error };
  };

  const getAllInvitations = async () => {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data as Invitation[] | null, error };
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
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    return { data: data as Invitation | null, error };
  };

  const deleteInvitation = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvitations(prev => prev.filter(i => i.id !== id));
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
    invitations,
    fetchInvitations,
    createInvitation,
    getMyInvitations,
    getAllInvitations,
    acceptInvitation,
    getInvitationByToken,
    deleteInvitation,
  };
};
