import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminMessages, Conversation, Participant } from "@/hooks/useAdminMessages";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  Search, 
  Send,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  UserPlus,
  Dumbbell,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminMessages = () => {
  const { 
    conversations, 
    participants, 
    loading, 
    sendMessage, 
    markAsRead,
    startConversation 
  } = useAdminMessages();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);

  // Update selected conversation when conversations change (for realtime updates)
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(
        c => c.participant.user_id === selectedConversation.participant.user_id
      );
      if (updated) {
        setSelectedConversation(updated);
      }
    }
  }, [conversations]);

  // Auto-select first conversation when loaded
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0 && !loading) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, loading]);

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      const unreadIds = selectedConversation.messages
        .filter(m => !m.read && m.recipient_id !== selectedConversation.participant.user_id)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv =>
    (conv.participant.full_name || conv.participant.email || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const result = await sendMessage(selectedConversation.participant.user_id, newMessage);
    if (result) {
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartNewConversation = (participant: Participant) => {
    const existing = conversations.find(c => c.participant.user_id === participant.user_id);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      const newConvo = startConversation(participant.user_id);
      if (newConvo) {
        setSelectedConversation(newConvo);
      }
    }
    setShowNewConversationDialog(false);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'HH:mm', { locale: pl });
    } else if (diffDays === 1) {
      return 'Wczoraj';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: pl });
    } else {
      return format(date, 'dd.MM.yyyy', { locale: pl });
    }
  };

  const availableParticipants = participants.filter(
    p => !conversations.some(c => c.participant.user_id === p.user_id)
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Conversations List */}
            <Card className="w-full md:w-80 lg:w-96 bg-card border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">Wiadomości</h2>
                  <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserPlus className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nowa konwersacja z trenerem</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        {availableParticipants.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            Nie ma dostępnych trenerów do rozpoczęcia konwersacji.
                          </p>
                        ) : (
                          <ScrollArea className="max-h-[300px]">
                            <div className="space-y-2">
                              {availableParticipants.map((participant) => (
                                <button
                                  key={participant.user_id}
                                  onClick={() => handleStartNewConversation(participant)}
                                  className="w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={participant.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                      {getInitials(participant.full_name, participant.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {participant.full_name || participant.email}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Dumbbell className="h-3 w-3" />
                                      Trener
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj konwersacji..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <p className="text-muted-foreground mb-2">
                      Brak konwersacji z trenerami
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowNewConversationDialog(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Rozpocznij konwersację
                    </Button>
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.participant.user_id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "w-full p-3 rounded-lg flex items-start gap-3 transition-colors text-left",
                          selectedConversation?.participant.user_id === conv.participant.user_id
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conv.participant.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary font-medium">
                              {getInitials(conv.participant.full_name, conv.participant.email)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground truncate">
                                {conv.participant.full_name || conv.participant.email}
                              </span>
                              <Dumbbell className="h-3 w-3 text-primary" />
                            </div>
                            {conv.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(conv.lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage?.content || 'Brak wiadomości'}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            {selectedConversation ? (
              <Card className="hidden md:flex flex-1 bg-card border-border flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.participant.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {getInitials(
                          selectedConversation.participant.full_name, 
                          selectedConversation.participant.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {selectedConversation.participant.full_name || selectedConversation.participant.email}
                        </h3>
                        <Badge variant="outline" className="text-primary border-primary">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          Trener
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.participant.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                        <p className="text-muted-foreground">
                          Rozpocznij konwersację z {selectedConversation.participant.full_name || selectedConversation.participant.email}
                        </p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((msg) => {
                        const isOwn = msg.sender_id !== selectedConversation.participant.user_id;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={cn(
                                "flex items-center gap-1 mt-1",
                                isOwn ? "justify-end" : "justify-start"
                              )}>
                                <span className={cn(
                                  "text-xs",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {format(new Date(msg.created_at), 'HH:mm', { locale: pl })}
                                </span>
                                {isOwn && (
                                  msg.read ? (
                                    <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                  ) : (
                                    <Check className="h-3 w-3 text-primary-foreground/70" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Napisz wiadomość..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-background border-border"
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="hidden md:flex flex-1 bg-card border-border items-center justify-center flex-col gap-4">
                <p className="text-muted-foreground">Wybierz konwersację lub rozpocznij nową</p>
                <Button 
                  variant="outline"
                  onClick={() => setShowNewConversationDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nowa konwersacja
                </Button>
              </Card>
            )}
        </div>
      </DashboardLayout>
  );
};

export default AdminMessages;
