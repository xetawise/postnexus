
import { Link } from "react-router-dom";
import { User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getRecommendedUsers } from "@/utils/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const RecommendedUsers = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const recommendedUsers = getRecommendedUsers(user.id);
  
  if (recommendedUsers.length === 0) {
    return null;
  }
  
  const handleFollow = (username: string) => {
    toast.success(`You are now following @${username}`);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <User size={18} className="mr-2" />
          Suggested for you
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="space-y-4">
          {recommendedUsers.map((recommendedUser) => (
            <div key={recommendedUser.id} className="flex items-center justify-between">
              <Link to={`/profile/${recommendedUser.username}`} className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={recommendedUser.avatar} alt={recommendedUser.username} />
                  <AvatarFallback>
                    {recommendedUser.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">{recommendedUser.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{recommendedUser.username}</p>
                </div>
              </Link>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full"
                onClick={() => handleFollow(recommendedUser.username)}
              >
                <UserPlus size={16} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedUsers;
