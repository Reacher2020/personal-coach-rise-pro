import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Coach {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  created_at: string;
}

export const useCoaches = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'coach');

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) {
        setCoaches([]);
        return;
      }

      const userIds = roles.map(r => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      setCoaches(profiles || []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load coaches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  return {
    coaches,
    loading,
    error,
    refetch: fetchCoaches,
  };
};
