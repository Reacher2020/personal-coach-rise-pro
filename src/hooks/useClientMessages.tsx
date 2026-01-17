import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ClientMessage {
  id: string;
  client_id: string;
  coach_id: string;
  content: string;
  is_from_coach: boolean;
  read: boolean;
  created_at: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}

export interface ClientInfo {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
}

export interface ClientConversation {
  client: ClientInfo;
  messages: ClientMessage[];
  lastMessage: ClientMessage | null;
  unreadCount: number;
}

export const useClientMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ClientConversation[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all clients for the coach
  const fetchClients = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, user_id')
        .eq('coach_id', user.id);

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, [user]);

  // Fetch all messages and build conversations
  const fetchMessages = useCallback(async () => {
    if (!user || clients.length === 0) return;

    try {
      setLoading(true);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group messages by client
      const conversationMap = new Map<string, ClientMessage[]>();
      
      (messages || []).forEach((msg: ClientMessage) => {
        if (!conversationMap.has(msg.client_id)) {
          conversationMap.set(msg.client_id, []);
        }
        conversationMap.get(msg.client_id)!.push(msg);
      });

      // Build conversation objects
      const convos: ClientConversation[] = [];
      
      for (const client of clients) {
        const msgs = conversationMap.get(client.id) || [];
        const unreadCount = msgs.filter(m => !m.is_from_coach && !m.read).length;
        const lastMessage = msgs[msgs.length - 1] || null;
        
        convos.push({
          client,
          messages: msgs,
          lastMessage,
          unreadCount
        });
      }

      // Sort by last message time (conversations with messages first)
      convos.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return b.lastMessage.created_at.localeCompare(a.lastMessage.created_at);
      });

      setConversations(convos);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Nie udało się pobrać wiadomości');
    } finally {
      setLoading(false);
    }
  }, [user, clients]);

  // Send a message
  const sendMessage = async (
    clientId: string, 
    content: string,
    attachment?: { url: string; name: string; type: string } | null
  ) => {
    if (!user || (!content.trim() && !attachment)) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          coach_id: user.id,
          client_id: clientId,
          content: content.trim() || (attachment ? `📎 ${attachment.name}` : ''),
          is_from_coach: true,
          read: false,
          attachment_url: attachment?.url || null,
          attachment_name: attachment?.name || null,
          attachment_type: attachment?.type || null,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Nie udało się wysłać wiadomości');
      return null;
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('client-messages-coach')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `coach_id=eq.${user.id}`
        },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchMessages]);

  // Initial fetch
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (clients.length > 0) {
      fetchMessages();
    } else if (user) {
      setLoading(false);
    }
  }, [clients, fetchMessages, user]);

  return {
    conversations,
    clients,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages
  };
};
