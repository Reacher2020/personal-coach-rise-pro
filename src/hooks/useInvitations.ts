import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invitation, InvitationRole } from '@/types/invitation';

interface UseInvitationsResult {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;

  fetchInvitations: () => Promise<void>;
  createInvitation: (email: string, role: InvitationRole) => Promise<void>;
  resendInvitation: (id: string) => Promise<void>;
  deleteInvitation: (id: string) => Promise<void>;
}

export const useInvitations = (): UseInvitationsResult => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Błąd pobierania zaproszeń');
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvitation = async (
    email: string,
    role: InvitationRole
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('create_invitation', {
        p_email: email,
        p_role: role,
      });

      if (error) throw error;

      await fetchInvitations();
    } catch (err: any) {
      setError(err.message ?? 'Błąd tworzenia zaproszenia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('resend_invitation', {
        p_invitation_id: id,
      });

      if (error) throw error;

      await fetchInvitations();
    } catch (err: any) {
      setError(err.message ?? 'Błąd ponownego wysłania');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvitations(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err.message ?? 'Błąd usuwania zaproszenia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    createInvitation,
    resendInvitation,
    deleteInvitation,
  };
};
