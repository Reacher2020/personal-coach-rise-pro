import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAdminMessages, Conversation, Participant } from "@/hooks/useAdminMessages";
import { useClientMessages, ClientConversation } from "@/hooks/useClientMessages";
import { useMessageAttachments } from "@/hooks/useMessageAttachments";
import { MessageAttachment, AttachmentPreview } from "@/components/MessageAttachment";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  Search, 
  Send,
  MoreVertical,
  Paperclip,
  Check,
  CheckCheck,
  UserPlus,
  Shield,
  Dumbbell,
  Loader2,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Messages = () => {
  const { role, isAdmin, isCoach } = useUserRole();
  const adminMessages = useAdminMessages();
  const clientMessages = useClientMessages();
  const { uploadAttachment, uploading } = useMessageAttachments();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdminConversation, setSelectedAdminConversation] = useState<Conversation | null>(null);
  const [selectedClientConversation, setSelectedClientConversation] = useState<ClientConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"admin" | "clients">(isCoach ? "clients" : "admin");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selected conversation when conversations change (for realtime updates)
  useEffect(() => {
    if (selectedAdminConversation) {
      const updated = adminMessages.conversations.find(
        c => c.participant.user_id === selectedAdminConversation.participant.user_id
      );
      if (updated) {
        setSelectedAdminConversation(updated);
      }
    }
  }, [adminMessages.conversations]);

  useEffect(() => {
    if (selectedClientConversation) {
      const updated = clientMessages.conversations.find(
        c => c.client.id === selectedClientConversation.client.id
      );
      if (updated) {
        setSelectedClientConversation(updated);
      }
    }
  }, [clientMessages.conversations]);

  // Auto-select first conversation when loaded
  useEffect(() => {
    if (activeTab === 'admin' && !selectedAdminConversation && adminMessages.conversations.length > 0 && !adminMessages.loading) {
      setSelectedAdminConversation(adminMessages.conversations[0]);
    }
  }, [adminMessages.conversations, adminMessages.loading, activeTab]);

  useEffect(() => {
    if (activeTab === 'clients' && !selectedClientConversation && clientMessages.conversations.length > 0 && !clientMessages.loading) {
      setSelectedClientConversation(clientMessages.conversations[0]);
    }
  }, [clientMessages.conversations, clientMessages.loading, activeTab]);

  // Mark messages as read when selecting a conversation
  useEffect(() => {
    if (selectedAdminConversation) {
      const unreadIds = selectedAdminConversation.messages
        .filter(m => !m.read && m.recipient_id !== selectedAdminConversation.participant.user_id)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        adminMessages.markAsRead(unreadIds);
      }
    }
  }, [selectedAdminConversation]);

  useEffect(() => {
    if (selectedClientConversation) {
      const unreadIds = selectedClientConversation.messages
        .filter(m => !m.is_from_coach && !m.read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        clientMessages.markAsRead(unreadIds);
      }
    }
  }, [selectedClientConversation]);

  // Cleanup file preview URL
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const filteredAdminConversations = adminMessages.conversations.filter(conv =>
    (conv.participant.full_name || conv.participant.email || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredClientConversations = clientMessages.conversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile)) return;

    setSending(true);

    try {
      let attachmentData = null;

      if (selectedFile) {
        attachmentData = await uploadAttachment(selectedFile);
        if (!attachmentData && !newMessage.trim()) {
          setSending(false);
          return;
        }
      }

      if (activeTab === 'admin' && selectedAdminConversation) {
        const result = await adminMessages.sendMessage(selectedAdminConversation.participant.user_id, newMessage);
        if (result) {
          setNewMessage("");
          removeSelectedFile();
        }
      } else if (activeTab === 'clients' && selectedClientConversation) {
        const result = await clientMessages.sendMessage(
          selectedClientConversation.client.id,
          newMessage,
          attachmentData
        );
        if (result) {
          setNewMessage("");
          removeSelectedFile();
        }
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartNewConversation = (participant: Participant) => {
    const existing = adminMessages.conversations.find(c => c.participant.user_id === participant.user_id);
    if (existing) {
      setSelectedAdminConversation(existing);
    } else {
      const newConvo = adminMessages.startConversation(participant.user_id);
      if (newConvo) {
        setSelectedAdminConversation(newConvo);
      }
    }
    setShowNewConversationDialog(false);
  };

  const getInitials = (name: string | null, email?: string | null) => {
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

  const availableParticipants = adminMessages.participants.filter(
    p => !adminMessages.conversations.some(c => c.participant.user_id === p.user_id)
  );

  const targetRoleLabel = role === 'admin' ? 'trenerami' : 'administratorem';

  const currentLoading = activeTab === 'admin' ? adminMessages.loading : clientMessages.loading;
  const currentConversations = activeTab === 'admin' ? filteredAdminConversations : filteredClientConversations;
  const hasSelectedConversation = activeTab === 'admin' ? selectedAdminConversation : selectedClientConversation;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Conversations List */}
        <Card className="w-full md:w-80 lg:w-96 bg-card border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Wiadomości</h2>
              {activeTab === 'admin' && (
                <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserPlus className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nowa konwersacja</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {availableParticipants.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          Nie ma dostępnych użytkowników do rozpoczęcia konwersacji.
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
                                    {participant.role === 'admin' ? (
                                      <>
                                        <Shield className="h-3 w-3" />
                                        Administrator
                                      </>
                                    ) : (
                                      <>
                                        <Dumbbell className="h-3 w-3" />
                                        Trener
                                      </>
                                    )}
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
              )}
            </div>

            {/* Tabs for Coach */}
            {isCoach && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "admin" | "clients")} className="mb-3">
                <TabsList className="w-full">
                  <TabsTrigger value="clients" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Klienci
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex-1">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

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
            {currentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : currentConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <p className="text-muted-foreground mb-2">
                  {activeTab === 'admin' ? `Brak konwersacji z ${targetRoleLabel}` : 'Brak konwersacji z klientami'}
                </p>
                {activeTab === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewConversationDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Rozpocznij konwersację
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-2">
                {activeTab === 'admin' ? (
                  filteredAdminConversations.map((conv) => (
                    <button
                      key={conv.participant.user_id}
                      onClick={() => setSelectedAdminConversation(conv)}
                      className={cn(
                        "w-full p-3 rounded-lg flex items-start gap-3 transition-colors text-left",
                        selectedAdminConversation?.participant.user_id === conv.participant.user_id
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
                            {conv.participant.role === 'admin' ? (
                              <Shield className="h-3 w-3 text-amber-500" />
                            ) : (
                              <Dumbbell className="h-3 w-3 text-primary" />
                            )}
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
                  ))
                ) : (
                  filteredClientConversations.map((conv) => (
                    <button
                      key={conv.client.id}
                      onClick={() => setSelectedClientConversation(conv)}
                      className={cn(
                        "w-full p-3 rounded-lg flex items-start gap-3 transition-colors text-left",
                        selectedClientConversation?.client.id === conv.client.id
                          ? "bg-primary/10"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/20 text-primary font-medium">
                            {getInitials(conv.client.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground truncate">
                            {conv.client.name}
                          </span>
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
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        {hasSelectedConversation ? (
          <Card className="hidden md:flex flex-1 bg-card border-border flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {activeTab === 'admin' && selectedAdminConversation ? (
                    <>
                      <AvatarImage src={selectedAdminConversation.participant.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {getInitials(
                          selectedAdminConversation.participant.full_name, 
                          selectedAdminConversation.participant.email
                        )}
                      </AvatarFallback>
                    </>
                  ) : selectedClientConversation && (
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {getInitials(selectedClientConversation.client.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">
                      {activeTab === 'admin' && selectedAdminConversation
                        ? (selectedAdminConversation.participant.full_name || selectedAdminConversation.participant.email)
                        : selectedClientConversation?.client.name
                      }
                    </h3>
                    {activeTab === 'admin' && selectedAdminConversation && (
                      selectedAdminConversation.participant.role === 'admin' ? (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-primary border-primary">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          Trener
                        </Badge>
                      )
                    )}
                    {activeTab === 'clients' && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <User className="h-3 w-3 mr-1" />
                        Klient
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === 'admin' && selectedAdminConversation
                      ? selectedAdminConversation.participant.email
                      : selectedClientConversation?.client.email
                    }
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
                {activeTab === 'admin' && selectedAdminConversation && (
                  selectedAdminConversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                      <p className="text-muted-foreground">
                        Rozpocznij konwersację z {selectedAdminConversation.participant.full_name || selectedAdminConversation.participant.email}
                      </p>
                    </div>
                  ) : (
                    selectedAdminConversation.messages.map((msg) => {
                      const isOwn = msg.sender_id !== selectedAdminConversation.participant.user_id;
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
                  )
                )}
                {activeTab === 'clients' && selectedClientConversation && (
                  selectedClientConversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                      <p className="text-muted-foreground">
                        Rozpocznij konwersację z {selectedClientConversation.client.name}
                      </p>
                    </div>
                  ) : (
                    selectedClientConversation.messages.map((msg) => {
                      const isOwn = msg.is_from_coach;
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
                            {msg.attachment_url && msg.attachment_name && msg.attachment_type && (
                              <div className="mb-2">
                                <MessageAttachment
                                  url={msg.attachment_url}
                                  name={msg.attachment_name}
                                  type={msg.attachment_type}
                                  isOwn={isOwn}
                                />
                              </div>
                            )}
                            {msg.content && !msg.content.startsWith('📎') && (
                              <p className="text-sm">{msg.content}</p>
                            )}
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
                  )
                )}
              </div>
            </ScrollArea>

            {/* Attachment Preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t border-border bg-muted/30">
                <AttachmentPreview
                  file={selectedFile}
                  previewUrl={filePreview || undefined}
                  onRemove={removeSelectedFile}
                />
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                {activeTab === 'clients' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sending}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                )}
                <Input
                  placeholder="Napisz wiadomość..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-background border-border"
                  disabled={sending || uploading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {sending || uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="hidden md:flex flex-1 bg-card border-border items-center justify-center flex-col gap-4">
            <p className="text-muted-foreground">Wybierz konwersację lub rozpocznij nową</p>
            {activeTab === 'admin' && (
              <Button 
                variant="outline"
                onClick={() => setShowNewConversationDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nowa konwersacja
              </Button>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
