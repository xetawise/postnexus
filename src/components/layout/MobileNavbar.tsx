
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileNavbar = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: PlusSquare, label: "Create", path: "/create" },
    { icon: Heart, label: "Activity", path: "/notifications" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50 animate-fade-in">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-4 py-1",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
        <Link
          to={`/profile/${profile?.username}`}
          className={cn(
            "flex flex-col items-center justify-center space-y-1 px-4 py-1",
            location.pathname === `/profile/${profile?.username}` ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile?.avatar || ''} alt={profile?.username} />
            <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavbar;
