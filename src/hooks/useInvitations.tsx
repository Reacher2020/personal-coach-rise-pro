import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

export type InvitationRole = 'coach' | 'client' | 'admin';

type DbInvitation = Database['public']['Tables']['invitations']['Row'];

interface Invitation extends Omit<DbInvitation, 'role'> {
  role: InvitationRole;
}

export const useInvitations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createInvitation = async (email: string, role: InvitationRole): Promise<{ data: Invitation | null; error: Error | null }> => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    
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

      return { data: data as Invitation, error: null };
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

  const getMyInvitations = async (): Promise<{ data: Invitation[] | null; error: Error | null }> => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_by', user.id)
      .order('created_at', { ascending: false });

    return { data: data as Invitation[] | null, error: error as Error | null };
  };

  const getAllInvitations = async (): Promise<{ data: Invitation[] | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    return { data: data as Invitation[] | null, error: error as Error | null };
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

  const getInvitationByToken = async (token: string): Promise<{ data: Invitation | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    return { data: data as Invitation | null, error: error as Error | null };
  };

  const deleteInvitation = async (id: string): Promise<{ error: Error | null }> => {
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
