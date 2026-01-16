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
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { useState } from "react";
import { MessageCircle, Shield, Dumbbell, User } from "lucide-react";

export const MessageNotifications = () => {
  const { isAdmin, isCoach, isClient } = useUserRole();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useMessageNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification);
    setIsOpen(false);
    
    if (notification.type === 'admin') {
      navigate(isAdmin ? '/admin/messages' : '/messages');
    } else {
      if (isClient) {
        navigate('/client/messages');
      } else {
        navigate('/messages');
      }
    }
  };

  const getMessagesPath = () => {
    if (isAdmin) return '/admin/messages';
    if (isClient) return '/client/messages';
    return '/messages';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationIcon = (type: 'admin' | 'client') => {
    if (type === 'admin') {
      return <Shield className="h-3 w-3 text-amber-500" />;
    }
    return <User className="h-3 w-3 text-primary" />;
  };

  const getNotificationLabel = (type: 'admin' | 'client') => {
    if (type === 'admin') {
      return isAdmin ? 'Od trenera' : 'Od administratora';
    }
    return isCoach ? 'Od klienta' : 'Od trenera';
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
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Brak nowych wiadomości</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-primary/5"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {getInitials(notification.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {notification.senderName}
                          </p>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {getNotificationLabel(notification.type)}
                      </p>
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
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsOpen(false);
              navigate(getMessagesPath());
            }}
          >
            Zobacz wszystkie wiadomości
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
