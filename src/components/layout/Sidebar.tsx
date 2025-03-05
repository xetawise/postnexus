
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, Search, PlusSquare, Heart, User, Settings, 
  LogOut, ChevronLeft, ChevronRight, BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: PlusSquare, label: "Create", path: "/create" },
    { icon: Heart, label: "Activity", path: "/activity" },
    { icon: BellRing, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: profile ? `/profile/${profile.username}` : "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div 
      className={cn(
        "h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out flex flex-col",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4">
        <Link to="/feed" className={cn("flex items-center", !open && "justify-center")}>
          {open ? (
            <h1 className="font-bold text-2xl text-primary">Nexus</h1>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setOpen(!open)}
          className="rounded-full"
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-8">
        <TooltipProvider>
          <nav className="space-y-2 px-3">
            {navItems.map((item) => (
              <Tooltip key={item.path} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all hover:bg-sidebar-accent",
                      location.pathname === item.path ? "bg-sidebar-accent" : "",
                      !open && "justify-center px-0"
                    )}
                  >
                    <item.icon size={22} />
                    {open && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {!open && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </div>

      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center",
          open ? "justify-between" : "flex-col space-y-4"
        )}>
          {open && profile && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar || ''} alt={profile.username} />
                <AvatarFallback>{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{profile.full_name}</span>
                <span className="text-xs text-muted-foreground">@{profile.username}</span>
              </div>
            </div>
          )}

          <div className={cn("flex items-center space-x-1", !open && "flex-col space-y-4 space-x-0")}>
            <ThemeToggle />
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={signOut}
                  className="rounded-full"
                >
                  <LogOut size={18} />
                </Button>
              </TooltipTrigger>
              {!open && (
                <TooltipContent side="right">
                  <p>Sign Out</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
