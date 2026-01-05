import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Calendar, Clock, CheckCircle } from "lucide-react";
import { format, isToday, isTomorrow, addDays, isWithinInterval } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  type: string;
}

interface Notification {
  id: string;
  type: "today" | "tomorrow" | "upcoming";
  session: Session;
  read: boolean;
}

export function ClientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("invited_by")
        .eq("user_id", user.id)
        .single();

      if (!profile?.invited_by) return;

      const now = new Date();
      const weekFromNow = addDays(now, 7);

      const { data: sessions } = await supabase
        .from("training_sessions")
        .select("id, title, scheduled_at, duration_minutes, type")
        .eq("coach_id", profile.invited_by)
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", weekFromNow.toISOString())
        .order("scheduled_at", { ascending: true });

      if (sessions) {
        const notifs: Notification[] = sessions.map((session) => {
          const sessionDate = new Date(session.scheduled_at);
          let type: "today" | "tomorrow" | "upcoming" = "upcoming";

          if (isToday(sessionDate)) {
            type = "today";
          } else if (isTomorrow(sessionDate)) {
            type = "tomorrow";
          }

          return {
            id: session.id,
            type,
            session,
            read: readIds.has(session.id),
          };
        });

        setNotifications(notifs);
      }
    };

    fetchSessions();

    // Set up realtime subscription for new sessions
    const channel = supabase
      .channel("client-sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "training_sessions",
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, readIds]);

  const unreadCount = notifications.filter((n) => !n.read && !readIds.has(n.id)).length;
  const todayCount = notifications.filter((n) => n.type === "today").length;
  const tomorrowCount = notifications.filter((n) => n.type === "tomorrow").length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const getNotificationIcon = (type: "today" | "tomorrow" | "upcoming") => {
    switch (type) {
      case "today":
        return <Clock className="h-4 w-4 text-red-500" />;
      case "tomorrow":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationLabel = (type: "today" | "tomorrow" | "upcoming") => {
    switch (type) {
      case "today":
        return "Dzisiaj";
      case "tomorrow":
        return "Jutro";
      default:
        return "Nadchodzące";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h4 className="font-semibold">Powiadomienia</h4>
            <p className="text-xs text-muted-foreground">
              {todayCount > 0 && `${todayCount} dzisiaj`}
              {todayCount > 0 && tomorrowCount > 0 && ", "}
              {tomorrowCount > 0 && `${tomorrowCount} jutro`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Oznacz wszystkie
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Brak nadchodzących sesji</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const isRead = readIds.has(notification.id);
                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      !isRead && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              notification.type === "today"
                                ? "destructive"
                                : notification.type === "tomorrow"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {getNotificationLabel(notification.type)}
                          </Badge>
                          {!isRead && (
                            <span className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="font-medium text-sm truncate">
                          {notification.session.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(notification.session.scheduled_at),
                            "EEEE, d MMM • HH:mm",
                            { locale: pl }
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.session.type} •{" "}
                          {notification.session.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                window.location.href = "/client/sessions";
              }}
            >
              Zobacz wszystkie sesje
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
