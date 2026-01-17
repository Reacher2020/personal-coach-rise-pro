import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessageAttachments } from "@/hooks/useMessageAttachments";
import { MessageAttachment, AttachmentPreview } from "@/components/MessageAttachment";
import { Send, MessageCircle, User, Check, CheckCheck, Paperclip, Loader2 } from "lucide-react";
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
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}

interface CoachProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const { uploadAttachment, uploading } = useMessageAttachments();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const { data: clientRecord } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (clientRecord) {
      setClientId(clientRecord.id);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('client_id', clientRecord.id)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);

        // Mark unread messages from coach as read
        const unreadFromCoach = messagesData
          .filter(m => m.is_from_coach && !m.read)
          .map(m => m.id);

        if (unreadFromCoach.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadFromCoach);
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel('client-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup file preview URL
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeSelectedFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedFile) || !coachId || !clientId) return;

    setSending(true);

    try {
      let attachmentData = null;

      // Upload attachment if present
      if (selectedFile) {
        attachmentData = await uploadAttachment(selectedFile);
        if (!attachmentData && !newMessage.trim()) {
          setSending(false);
          return;
        }
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          client_id: clientId,
          coach_id: coachId,
          content: newMessage.trim() || (attachmentData ? `📎 ${attachmentData.name}` : ''),
          is_from_coach: false,
          read: false,
          attachment_url: attachmentData?.url || null,
          attachment_name: attachmentData?.name || null,
          attachment_type: attachmentData?.type || null,
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error("Nie udało się wysłać wiadomości");
      } else {
        setNewMessage("");
        removeSelectedFile();
        toast.success("Wiadomość wysłana");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Nie udało się wysłać wiadomości");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
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
                      {message.attachment_url && message.attachment_name && message.attachment_type && (
                        <div className="mb-2">
                          <MessageAttachment
                            url={message.attachment_url}
                            name={message.attachment_name}
                            type={message.attachment_type}
                            isOwn={!message.is_from_coach}
                          />
                        </div>
                      )}
                      {message.content && !message.content.startsWith('📎') && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        message.is_from_coach ? "justify-start" : "justify-end"
                      )}>
                        <span
                          className={cn(
                            "text-xs",
                            message.is_from_coach
                              ? "text-muted-foreground"
                              : "text-primary-foreground/70"
                          )}
                        >
                          {formatMessageDate(message.created_at)}
                        </span>
                        {!message.is_from_coach && (
                          message.read ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Attachment Preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t bg-muted/30">
                <AttachmentPreview
                  file={selectedFile}
                  previewUrl={filePreview || undefined}
                  onRemove={removeSelectedFile}
                />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napisz wiadomość..."
                  disabled={sending || uploading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={sending || uploading || (!newMessage.trim() && !selectedFile)}
                >
                  {sending || uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
