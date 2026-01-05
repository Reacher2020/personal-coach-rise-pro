import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, MessageCircle, User } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  is_from_coach: boolean;
  created_at: string;
  read: boolean;
}

interface CoachProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('invited_by')
        .eq('user_id', user.id)
        .single();

      if (!profile?.invited_by) {
        setLoading(false);
        return;
      }

      setCoachId(profile.invited_by);

      // Get coach profile
      const { data: coach } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', profile.invited_by)
        .single();

      if (coach) {
        setCoachProfile(coach);
      }

      // Get client ID
      const { data: clients } = await supabase
        .from('clients')
        .select('id')
        .eq('coach_id', profile.invited_by)
        .limit(1);

      if (clients && clients.length > 0) {
        setClientId(clients[0].id);

        // Fetch messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('client_id', clients[0].id)
          .eq('coach_id', profile.invited_by)
          .order('created_at', { ascending: true });

        if (messagesData) {
          setMessages(messagesData);
        }
      }

      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return `Dzisiaj, ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `Wczoraj, ${format(date, "HH:mm")}`;
    }
    return format(date, "d MMM, HH:mm", { locale: pl });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !coachId || !clientId) return;

    setSending(true);

    // Note: Messages from client need different handling - 
    // For now we show a message that this feature needs backend support
    toast.info("Wysyłanie wiadomości wymaga konfiguracji po stronie trenera");
    
    setSending(false);
    setNewMessage("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-12rem)]">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wiadomości</h1>
          <p className="text-muted-foreground mt-1">Komunikacja z Twoim trenerem</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : !coachId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nie masz jeszcze przypisanego trenera</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col h-full">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={coachProfile?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {coachProfile?.full_name || "Twój trener"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Trener personalny</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-4" />
                  <p>Brak wiadomości</p>
                  <p className="text-sm">Rozpocznij rozmowę z trenerem</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.is_from_coach ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        message.is_from_coach
                          ? "bg-muted text-foreground rounded-bl-md"
                          : "bg-primary text-primary-foreground rounded-br-md"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          message.is_from_coach
                            ? "text-muted-foreground"
                            : "text-primary-foreground/70"
                        )}
                      >
                        {formatMessageDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
