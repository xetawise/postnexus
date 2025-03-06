
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast-utils";
import { Profile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

interface ProfileHeaderProps {
  profile: Profile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Check if current user is following this profile
  const { data: followStatus } = useQuery({
    queryKey: ['isFollowing', currentUser?.id, profile.id],
    queryFn: async () => {
      if (!currentUser || !profile || currentUser.id === profile.id) return false;
      
      const { data, error } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking follow status:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!currentUser && !!profile && currentUser.id !== profile.id
  });
  
  useEffect(() => {
    if (followStatus !== undefined) {
      setIsFollowing(followStatus);
    }
  }, [followStatus]);
  
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to follow users");
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow user
        const { error } = await supabase
          .from('user_relationships')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);
          
        if (error) {
          console.error("Error unfollowing user:", error);
          toast.error("Failed to unfollow user");
          return;
        }
        
        setIsFollowing(false);
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        // Follow user
        const { error } = await supabase
          .from('user_relationships')
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });
          
        if (error) {
          console.error("Error following user:", error);
          toast.error("Failed to follow user");
          return;
        }
        
        setIsFollowing(true);
        toast.success(`Now following @${profile.username}`);
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("An error occurred");
    }
  };
  
  const isCurrentUser = currentUser?.id === profile.id;

  return (
    <Card className="mb-6 overflow-hidden glass-card">
      <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
      
      <CardContent className="relative p-6">
        <div className="absolute -top-16 left-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={profile.avatar || ''} alt={profile.username} />
            <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-2 text-sm">{profile.bio}</p>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0">
            {isCurrentUser ? (
              <Button variant="outline" className="rounded-full">
                Edit Profile
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full"
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex space-x-6">
          <div className="flex flex-col items-center">
            <span className="font-semibold">{profile.posts}</span>
            <span className="text-sm text-muted-foreground">Posts</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="font-semibold">{profile.followers}</span>
            <span className="text-sm text-muted-foreground">Followers</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="font-semibold">{profile.following}</span>
            <span className="text-sm text-muted-foreground">Following</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
