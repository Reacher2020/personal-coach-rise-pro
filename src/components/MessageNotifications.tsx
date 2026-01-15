import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { playNotificationSound } from "@/lib/notificationSound";

interface MessageNotification {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export const MessageNotifications = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      const { data, error } = await supabase
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

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const mappedNotifications: MessageNotification[] = (data || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.profiles?.full_name || 'Nieznany użytkownik',
        content: msg.content,
        createdAt: msg.created_at,
        read: msg.read,
      }));

      // Check for new notifications and play sound
      const currentIds = new Set(mappedNotifications.map(n => n.id));
      const previousIds = previousNotificationIdsRef.current;
      
      // Only play sound if this is not the initial load and there are new notifications
      if (!isInitialLoadRef.current) {
        const hasNewNotifications = mappedNotifications.some(n => !previousIds.has(n.id));
        if (hasNewNotifications) {
          playNotificationSound();
        }
      }
      
      isInitialLoadRef.current = false;
      previousNotificationIdsRef.current = currentIds;

      setNotifications(mappedNotifications);
    };

    fetchUnreadMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAsRead = async (id: string) => {
    setReadIds(prev => new Set([...prev, id]));
    
    await supabase
      .from('admin_messages')
      .update({ read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !readIds.has(n.id)).map(n => n.id);
    setReadIds(prev => new Set([...prev, ...unreadIds]));
    
    await supabase
      .from('admin_messages')
      .update({ read: true })
      .in('id', unreadIds);
  };

  const handleNotificationClick = (notification: MessageNotification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    navigate(isAdmin ? '/admin/messages' : '/messages');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Wiadomości</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Oznacz jako przeczytane
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Brak nowych wiadomości
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const isRead = readIds.has(notification.id);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !isRead ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(notification.senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {notification.senderName}
                          </p>
                          {!isRead && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: pl,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsOpen(false);
              navigate(isAdmin ? '/admin/messages' : '/messages');
            }}
          >
            Zobacz wszystkie wiadomości
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
