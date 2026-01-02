import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Client = Tables<'clients'>;
export type ClientInsert = TablesInsert<'clients'>;
export type ClientUpdate = TablesUpdate<'clients'>;

export const useClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać klientów',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (client: Omit<ClientInsert, 'coach_id'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          coach_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setClients((prev) => [data, ...prev]);
      toast({
        title: 'Klient dodany',
        description: `${client.name} został dodany do Twoich klientów`,
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const updateClient = async (id: string, updates: ClientUpdate) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients((prev) =>
        prev.map((client) => (client.id === id ? data : client))
      );
      toast({
        title: 'Klient zaktualizowany',
        description: 'Dane klienta zostały zaktualizowane',
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) throw error;

      setClients((prev) => prev.filter((client) => client.id !== id));
      toast({
        title: 'Klient usunięty',
        description: 'Klient został usunięty',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const getClientStats = () => {
    const activeCount = clients.filter((c) => c.status === 'active').length;
    const newCount = clients.filter((c) => c.status === 'new').length;
    const inactiveCount = clients.filter((c) => c.status === 'inactive').length;
    return { activeCount, newCount, inactiveCount, total: clients.length };
  };

  return {
    clients,
    loading,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    getClientStats,
  };
};
