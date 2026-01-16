import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { playNotificationSound } from '@/lib/notificationSound';

export interface MessageNotification {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: 'admin' | 'client';
  clientId?: string;
}

export const useMessageNotifications = () => {
  const { user } = useAuth();
  const { isAdmin, isCoach, isClient } = useUserRole();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const allNotifications: MessageNotification[] = [];

      // Fetch admin/coach messages for admins and coaches
      if (isAdmin || isCoach) {
        const { data: adminMessages, error: adminError } = await supabase
          .from('admin_messages')
          .select(`
            id,
            content,
            created_at,
            read,
            sender_id,
            profiles!admin_messages_sender_id_fkey(full_name)
          `)
          .eq('recipient_id', user.id)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!adminError && adminMessages) {
          const mapped = adminMessages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.profiles?.full_name || 'Nieznany użytkownik',
            content: msg.content,
            createdAt: msg.created_at,
            read: msg.read,
            type: 'admin' as const,
          }));
          allNotifications.push(...mapped);
        }
      }

      // Fetch client messages for coaches
      if (isCoach) {
        const { data: clientMessages, error: clientError } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            read,
            is_from_coach,
            client_id,
            clients!inner(name)
          `)
          .eq('coach_id', user.id)
          .eq('is_from_coach', false)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!clientError && clientMessages) {
          const mapped = clientMessages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.client_id,
            senderName: msg.clients?.name || 'Klient',
            content: msg.content,
            createdAt: msg.created_at,
            read: msg.read,
            type: 'client' as const,
            clientId: msg.client_id,
          }));
          allNotifications.push(...mapped);
        }
      }

      // Fetch messages from coach for clients
      if (isClient) {
        // First get the client's profile to find their coach
        const { data: profile } = await supabase
          .from('profiles')
          .select('invited_by')
          .eq('user_id', user.id)
          .single();

        if (profile?.invited_by) {
          // Get client record
          const { data: clientRecord } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (clientRecord) {
            const { data: coachMessages, error: coachError } = await supabase
              .from('messages')
              .select(`
                id,
                content,
                created_at,
                read,
                is_from_coach,
                coach_id,
                profiles!messages_coach_id_fkey(full_name)
              `)
              .eq('client_id', clientRecord.id)
              .eq('is_from_coach', true)
              .eq('read', false)
              .order('created_at', { ascending: false })
              .limit(10);

            if (!coachError && coachMessages) {
              const mapped = coachMessages.map((msg: any) => ({
                id: msg.id,
                senderId: msg.coach_id,
                senderName: msg.profiles?.full_name || 'Trener',
                content: msg.content,
                createdAt: msg.created_at,
                read: msg.read,
                type: 'client' as const,
              }));
              allNotifications.push(...mapped);
            }
          }
        }
      }

      // Sort by date
      allNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Check for new notifications and play sound
      const currentIds = new Set(allNotifications.map(n => n.id));
      const previousIds = previousNotificationIdsRef.current;

      if (!isInitialLoadRef.current) {
        const hasNewNotifications = allNotifications.some(n => !previousIds.has(n.id));
        if (hasNewNotifications) {
          playNotificationSound();
        }
      }

      isInitialLoadRef.current = false;
      previousNotificationIdsRef.current = currentIds;

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, isCoach, isClient]);

  // Mark notification as read
  const markAsRead = async (notification: MessageNotification) => {
    const table = notification.type === 'admin' ? 'admin_messages' : 'messages';
    
    await supabase
      .from(table)
      .update({ read: true })
      .eq('id', notification.id);

    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const adminIds = notifications.filter(n => n.type === 'admin').map(n => n.id);
    const clientIds = notifications.filter(n => n.type === 'client').map(n => n.id);

    if (adminIds.length > 0) {
      await supabase
        .from('admin_messages')
        .update({ read: true })
        .in('id', adminIds);
    }

    if (clientIds.length > 0) {
      await supabase
        .from('messages')
        .update({ read: true })
        .in('id', clientIds);
    }

    setNotifications([]);
  };

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channels: any[] = [];

    // Admin messages subscription
    if (isAdmin || isCoach) {
      const adminChannel = supabase
        .channel('admin-message-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'admin_messages',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => fetchNotifications()
        )
        .subscribe();
      channels.push(adminChannel);
    }

    // Client messages subscription for coaches
    if (isCoach) {
      const clientChannel = supabase
        .channel('client-message-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `coach_id=eq.${user.id}`,
          },
          () => fetchNotifications()
        )
        .subscribe();
      channels.push(clientChannel);
    }

    // Client receiving coach messages
    if (isClient) {
      const coachChannel = supabase
        .channel('coach-message-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => fetchNotifications()
        )
        .subscribe();
      channels.push(coachChannel);
    }

    fetchNotifications();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, isAdmin, isCoach, isClient, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount: notifications.length,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
