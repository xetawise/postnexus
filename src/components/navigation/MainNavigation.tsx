
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Bell, UserCircle, PlusSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function MainNavigation() {
  const location = useLocation();
  const { profile } = useAuth();
  
  const navItems = [
    {
      name: "Feed",
      path: "/feed",
      icon: Home
    },
    {
      name: "Search",
      path: "/search",
      icon: Search
    },
    {
      name: "Create",
      path: "/create",
      icon: PlusSquare
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell
    },
    {
      name: "Profile",
      path: `/profile/${profile?.username || ''}`,
      icon: UserCircle
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }
  ];

  return (
    <nav className="py-4 px-6 border-b border-border">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/feed" className="text-xl font-bold text-primary">SocialApp</Link>
        
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path.includes('/profile/') && location.pathname.includes('/profile/'));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="md:hidden">
          {/* Mobile menu toggle can go here if needed */}
        </div>
      </div>
    </nav>
  );
}

// Bottom navigation for mobile
export function MobileNavigation() {
  const location = useLocation();
  const { profile } = useAuth();
  
  const navItems = [
    {
      name: "Feed",
      path: "/feed",
      icon: Home
    },
    {
      name: "Search",
      path: "/search",
      icon: Search
    },
    {
      name: "Create",
      path: "/create",
      icon: PlusSquare
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell
    },
    {
      name: "Profile",
      path: `/profile/${profile?.username || ''}`,
      icon: UserCircle
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path.includes('/profile/') && location.pathname.includes('/profile/'));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
