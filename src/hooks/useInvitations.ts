// hooks/useInvitations.ts
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Invitation, InvitationRole } from '@/types/invitation';

interface UseInvitationsResult {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;

  fetchInvitations: () => Promise<void>;
  createInvitation: (email: string, role: InvitationRole) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  deleteInvitation: (invitationId: string) => Promise<void>;
}

export const useInvitations = (): UseInvitationsResult => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Fetch Invitations */
  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations((data ?? []) as Invitation[]);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Create Invitation */
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
      setError(err.message ?? 'Failed to create invitation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* Resend Invitation */
  const resendInvitation = async (invitationId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.rpc('resend_invitation', {
        p_invitation_id: invitationId,
      });

      if (error) throw error;

      await fetchInvitations();
    } catch (err: any) {
      setError(err.message ?? 'Failed to resend invitation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* Delete Invitation */
  const deleteInvitation = async (invitationId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      setInvitations(prev =>
        prev.filter(inv => inv.id !== invitationId)
      );
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete invitation');
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
