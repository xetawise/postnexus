
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast-utils";
import { supabase, type Profile } from "@/lib/supabase";

const RecommendedUsers = () => {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecommendedUsers();
  }, [user]);
  
  const fetchRecommendedUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get users I'm not already following
      const { data: relationships, error: relError } = await supabase
        .from('user_relationships')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (relError) {
        console.error("Error fetching relationships:", relError);
        return;
      }
      
      const followingIds = relationships ? relationships.map(r => r.following_id) : [];
      
      // Add current user to the exclusion list
      const excludeIds = [...followingIds, user.id];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(5);
      
      if (error) {
        console.error("Error fetching recommended users:", error);
        return;
      }
      
      setRecommendedUsers(data as Profile[]);
    } catch (error) {
      console.error("Error fetching recommended users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFollow = async (followingId: string, username: string) => {
    if (!user) {
      toast.error("You must be logged in to follow users");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          follower_id: user.id,
          following_id: followingId
        });
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error("You're already following this user");
        } else {
          toast.error("Failed to follow user");
        }
        return;
      }
      
      // Create a notification for the followed user
      await supabase
        .from('notifications')
        .insert({
          user_id: followingId,
          type: 'follow',
          initiator_id: user.id
        });
      
      toast.success(`You are now following @${username}`);
      fetchRecommendedUsers();
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  if (recommendedUsers.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <User size={18} className="mr-2" />
          Suggested for you
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendedUsers.map((recommendedUser) => (
              <div key={recommendedUser.id} className="flex items-center justify-between">
                <Link to={`/profile/${recommendedUser.username}`} className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={recommendedUser.avatar || undefined} alt={recommendedUser.username} />
                    <AvatarFallback>
                      {recommendedUser.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{recommendedUser.full_name}</p>
                    <p className="text-xs text-muted-foreground">@{recommendedUser.username}</p>
                  </div>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => handleFollow(recommendedUser.id, recommendedUser.username)}
                >
                  <UserPlus size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedUsers;
