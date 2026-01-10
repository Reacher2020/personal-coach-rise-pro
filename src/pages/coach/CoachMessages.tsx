import { useState } from "react";
import DashboardLayout from "@/components/Coach_Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Send,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  read: boolean;
}

interface Conversation {
  id: string;
  clientName: string;
  clientInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    clientName: "Anna Kowalska",
    clientInitials: "AK",
    lastMessage: "Dziękuję za dzisiejszy trening!",
    lastMessageTime: "10:30",
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: "1", content: "Cześć! Jak się czujesz po wczorajszym treningu?", timestamp: "09:00", isOwn: true, read: true },
      { id: "2", content: "Hej! Trochę mnie bolą mięśnie, ale czuję się świetnie 💪", timestamp: "09:15", isOwn: false, read: true },
      { id: "3", content: "To normalne po intensywnym treningu. Pamiętaj o rozciąganiu!", timestamp: "09:20", isOwn: true, read: true },
      { id: "4", content: "Dziękuję za dzisiejszy trening!", timestamp: "10:30", isOwn: false, read: false },
    ]
  },
  {
    id: "2",
    clientName: "Jan Nowak",
    clientInitials: "JN",
    lastMessage: "O której jutro trening?",
    lastMessageTime: "Wczoraj",
    unreadCount: 1,
    isOnline: false,
    messages: [
      { id: "1", content: "Cześć Jan! Przypominam o jutrzejszym treningu.", timestamp: "14:00", isOwn: true, read: true },
      { id: "2", content: "O której jutro trening?", timestamp: "18:30", isOwn: false, read: false },
    ]
  },
  {
    id: "3",
    clientName: "Maria Wiśniewska",
    clientInitials: "MW",
    lastMessage: "Super, do zobaczenia!",
    lastMessageTime: "Wczoraj",
    unreadCount: 0,
    isOnline: true,
    messages: [
      { id: "1", content: "Hej Maria! Czy możemy przesunąć trening na 18:00?", timestamp: "10:00", isOwn: true, read: true },
      { id: "2", content: "Tak, pasuje mi!", timestamp: "10:05", isOwn: false, read: true },
      { id: "3", content: "Super, do zobaczenia!", timestamp: "10:06", isOwn: false, read: true },
    ]
  },
  {
    id: "4",
    clientName: "Piotr Zieliński",
    clientInitials: "PZ",
    lastMessage: "Przesyłam nowy plan treningowy",
    lastMessageTime: "2 dni temu",
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: "1", content: "Przesyłam nowy plan treningowy", timestamp: "12:00", isOwn: true, read: true },
      { id: "2", content: "Dzięki! Zaczynam od poniedziałku.", timestamp: "14:30", isOwn: false, read: true },
    ]
  },
  {
    id: "5",
    clientName: "Katarzyna Lewandowska",
    clientInitials: "KL",
    lastMessage: "Czy mogę zmienić godzinę?",
    lastMessageTime: "3 dni temu",
    unreadCount: 0,
    isOnline: false,
    messages: [
      { id: "1", content: "Czy mogę zmienić godzinę?", timestamp: "16:00", isOwn: false, read: true },
      { id: "2", content: "Oczywiście, jaka godzina Ci pasuje?", timestamp: "16:15", isOwn: true, read: true },
    ]
  }
];

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      read: false
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: "Teraz"
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: "Teraz"
    });
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Conversations List */}
        <Card className="w-full md:w-80 lg:w-96 bg-card border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Wiadomości</h2>
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
            <div className="p-2">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full p-3 rounded-lg flex items-start gap-3 transition-colors text-left",
                    selectedConversation?.id === conv.id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {conv.clientInitials}
                      </AvatarFallback>
                    </Avatar>
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">
                        {conv.clientName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
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
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        {selectedConversation ? (
          <Card className="hidden md:flex flex-1 bg-card border-border flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {selectedConversation.clientInitials}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {selectedConversation.clientName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        msg.isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.isOwn ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-xs",
                          msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {msg.timestamp}
                        </span>
                        {msg.isOwn && (
                          msg.read ? (
                            <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="h-3 w-3 text-primary-foreground/70" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
          <Card className="hidden md:flex flex-1 bg-card border-border items-center justify-center">
            <p className="text-muted-foreground">Wybierz konwersację</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
