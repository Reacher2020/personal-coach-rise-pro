import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  CreditCard,
  MessageCircle,
  Settings,
  X,
  Shield,
  UserCog,
  User
} from "lucide-react";

interface RoleBasedSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

// Menu items for each role
const adminMenuItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Użytkownicy", path: "/admin/users" },
  { icon: MessageCircle, label: "Wiadomości", path: "/admin/messages" },
  { icon: Settings, label: "Ustawienia", path: "/admin/settings" },
];

const coachMenuItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/coach" },
  { icon: Users, label: "Klienci", path: "/coach/clients" },
  { icon: Calendar, label: "Kalendarz", path: "/coach/calendar" },
  { icon: Dumbbell, label: "Plany treningowe", path: "/coach/workouts" },
  { icon: TrendingUp, label: "Postępy", path: "/coach/progress" },
  { icon: CreditCard, label: "Płatności", path: "/coach/payments" },
  { icon: MessageCircle, label: "Wiadomości", path: "/coach/messages" },
  { icon: Settings, label: "Ustawienia", path: "/coach/settings" },
];

const clientMenuItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/client" },
  { icon: Calendar, label: "Moje sesje", path: "/client/sessions" },
  { icon: Dumbbell, label: "Moje treningi", path: "/client/workouts" },
  { icon: TrendingUp, label: "Mój postęp", path: "/client/progress" },
  { icon: MessageCircle, label: "Wiadomości", path: "/client/messages" },
  { icon: Settings, label: "Ustawienia", path: "/client/settings" },
];

// Role-specific branding
const roleBranding = {
  admin: {
    icon: Shield,
    title: "Admin Panel",
    color: "bg-red-500",
    iconColor: "text-red-400",
  },
  coach: {
    icon: UserCog,
    title: "Coach Pro",
    color: "bg-primary",
    iconColor: "text-primary",
  },
  client: {
    icon: Dumbbell,
    title: "FitCoach",
    color: "bg-primary",
    iconColor: "text-primary",
  },
};

export const RoleBasedSidebar = ({ isOpen, onClose }: RoleBasedSidebarProps) => {
  const { role, isAdmin, isCoach, isClient } = useUserRole();

  // Determine menu items based on role
  let menuItems: NavItem[] = [];
  if (isAdmin) {
    menuItems = adminMenuItems;
  } else if (isCoach) {
    menuItems = coachMenuItems;
  } else if (isClient) {
    menuItems = clientMenuItems;
  }

  // Get branding based on role
  const branding = roleBranding[role || 'client'];
  const BrandIcon = branding.icon;

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
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border",
        "transform transition-transform duration-200 ease-in-out",
        "flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-hero-foreground font-bold text-sm">CR</span>
            </div>
            <span className="font-bold text-lg text-foreground">CoachRaise PRO</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === "/coach" || item.path === "/admin" || item.path === "/client"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-muted",
                  isActive && "bg-primary/10 text-primary font-medium shadow-sm"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer - Quick links for coaches/admins */}
        {(isAdmin || isCoach) && (
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Szybki dostęp</div>
            <div className="flex gap-2">
              {isCoach && (
                <NavLink 
                  to="/coach/clients" 
                  className="flex-1 text-xs text-center py-2 rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  +Klient
                </NavLink>
              )}
              {isAdmin && (
                <NavLink 
                  to="/admin/users" 
                  className="flex-1 text-xs text-center py-2 rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  Zarządzaj
                </NavLink>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
