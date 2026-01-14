import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

export interface AdminMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Participant {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'coach';
}

export interface Conversation {
  participant: Participant;
  messages: AdminMessage[];
  lastMessage: AdminMessage | null;
  unreadCount: number;
}

export const useAdminMessages = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Fetch available participants (admins for coaches, coaches for admins)
  const fetchParticipants = useCallback(async () => {
    if (!user || !role) return;

    try {
      // Get users with the opposite role
      const targetRole = role === 'admin' ? 'coach' : 'admin';
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', targetRole);

      if (roleError) throw roleError;

      if (roleData && roleData.length > 0) {
        const userIds = roleData.map(r => r.user_id);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, avatar_url')
          .in('user_id', userIds);

        if (profileError) throw profileError;

        const participantList: Participant[] = (profiles || []).map(p => ({
          id: p.user_id,
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          avatar_url: p.avatar_url,
          role: targetRole as 'admin' | 'coach'
        }));

        setParticipants(participantList);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }, [user, role]);

  // Fetch all messages and build conversations
  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: messages, error } = await supabase
        .from('admin_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationMap = new Map<string, AdminMessage[]>();
      
      (messages || []).forEach((msg: AdminMessage) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      // Build conversation objects
      const convos: Conversation[] = [];
      
      for (const [partnerId, msgs] of conversationMap) {
        const participant = participants.find(p => p.user_id === partnerId);
        
        if (participant) {
          const unreadCount = msgs.filter(m => m.recipient_id === user.id && !m.read).length;
          const lastMessage = msgs[msgs.length - 1] || null;
          
          convos.push({
            participant,
            messages: msgs,
            lastMessage,
            unreadCount
          });
        }
      }

      // Sort by last message time
      convos.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || '';
        const bTime = b.lastMessage?.created_at || '';
        return bTime.localeCompare(aTime);
      });

      setConversations(convos);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Nie udało się pobrać wiadomości');
    } finally {
      setLoading(false);
    }
  }, [user, participants]);

  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    if (!user || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
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
        .from('admin_messages')
        .update({ read: true })
        .in('id', messageIds)
        .eq('recipient_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `sender_id=eq.${user.id}`
        },
        () => fetchMessages()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${user.id}`
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
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    if (participants.length > 0) {
      fetchMessages();
    }
  }, [participants, fetchMessages]);

  // Start new conversation with a participant
  const startConversation = (participantId: string): Conversation | null => {
    const participant = participants.find(p => p.user_id === participantId);
    if (!participant) return null;

    // Check if conversation already exists
    const existing = conversations.find(c => c.participant.user_id === participantId);
    if (existing) return existing;

    // Create new empty conversation
    const newConvo: Conversation = {
      participant,
      messages: [],
      lastMessage: null,
      unreadCount: 0
    };

    return newConvo;
  };

  return {
    conversations,
    participants,
    loading,
    sendMessage,
    markAsRead,
    startConversation,
    refetch: fetchMessages
  };
};
