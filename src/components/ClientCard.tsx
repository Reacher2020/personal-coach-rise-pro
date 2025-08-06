import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Calendar, TrendingUp } from "lucide-react";

interface ClientCardProps {
  name: string;
  email: string;
  status: "active" | "inactive" | "new";
  nextSession?: string;
  progress: number;
}

export const ClientCard = ({ name, email, status, nextSession, progress }: ClientCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "new":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-primary text-hero-foreground font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            {status === "active" ? "Aktywny" : status === "new" ? "Nowy" : "Nieaktywny"}
          </Badge>
        </div>
        
        {nextSession && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            <span>Następna sesja: {nextSession}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <TrendingUp className="h-4 w-4" />
          <span>Postęp: {progress}%</span>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Wiadomość
          </Button>
          <Button size="sm" className="flex-1 bg-primary text-primary-foreground">
            Zobacz profil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};