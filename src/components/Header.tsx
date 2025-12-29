import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Header = ({ onMenuToggle, isSidebarOpen }: HeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-hero-foreground font-bold text-sm">PT</span>
          </div>
          <h1 className="text-xl font-bold text-foreground hidden sm:block">
            Personal Coach Rise Pro
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
            3
          </span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "rounded-full",
              isProfileOpen && "ring-2 ring-primary"
            )}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};