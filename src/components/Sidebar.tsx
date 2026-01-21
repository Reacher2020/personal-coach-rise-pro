import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  CreditCard,
  MessageCircle,
  Settings,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/"
  },
  {
    icon: Users,
    label: "Klienci",
    path: "/clients"
  },
  {
    icon: Calendar,
    label: "Kalendarz",
    path: "/calendar"
  },
  {
    icon: Dumbbell,
    label: "Plany treningowe",
    path: "/workouts"
  },
  {
    icon: TrendingUp,
    label: "Postępy",
    path: "/progress"
  },
  {
    icon: CreditCard,
    label: "Płatności",
    path: "/payments"
  },
  {
    icon: MessageCircle,
    label: "Wiadomości",
    path: "/messages"
  },
  {
    icon: Settings,
    label: "Ustawienia",
    path: "/settings"
  }
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-border lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-hero-foreground font-bold text-sm">PT</span>
            </div>
            <span className="font-semibold text-foreground">Personal Trainer Pro</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary text-primary-foreground shadow-glow"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};