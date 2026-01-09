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
  User,
  FileText,
  Bell
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
  { icon: Settings, label: "Ustawienia", path: "/admin/settings" },
];

const coachMenuItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Klienci", path: "/clients" },
  { icon: Calendar, label: "Kalendarz", path: "/calendar" },
  { icon: Dumbbell, label: "Plany treningowe", path: "/workouts" },
  { icon: TrendingUp, label: "Postępy", path: "/progress" },
  { icon: CreditCard, label: "Płatności", path: "/payments" },
  { icon: MessageCircle, label: "Wiadomości", path: "/messages" },
  { icon: Settings, label: "Ustawienia", path: "/settings" },
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
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", branding.color)}>
              <BrandIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">{branding.title}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-border">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            isAdmin && "bg-red-500/10",
            isCoach && "bg-primary/10",
            isClient && "bg-blue-500/10"
          )}>
            {isAdmin && <Shield className="h-4 w-4 text-red-400" />}
            {isCoach && <UserCog className="h-4 w-4 text-primary" />}
            {isClient && <User className="h-4 w-4 text-blue-400" />}
            <span className={cn(
              "text-sm font-medium",
              isAdmin && "text-red-400",
              isCoach && "text-primary",
              isClient && "text-blue-400"
            )}>
              {isAdmin && "Administrator"}
              {isCoach && "Trener"}
              {isClient && "Klient"}
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === "/" || item.path === "/admin" || item.path === "/client"}
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
                  to="/clients" 
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
