
import { useState } from "react";
import { users, isUserFollowing } from "@/utils/mockData";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

interface ProfileHeaderProps {
  username: string;
}

const ProfileHeader = ({ username }: ProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState(false);
  
  // Find the user profile
  const userProfile = users.find(user => user.username === username);
  
  if (!userProfile) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">User not found</h2>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === userProfile.id;
  
  const handleFollowToggle = () => {
    setFollowing(!following);
    toast.success(following ? "Unfollowed successfully" : "Followed successfully");
  };

  return (
    <Card className="mb-6 overflow-hidden glass-card">
      <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
      
      <CardContent className="relative p-6">
        <div className="absolute -top-16 left-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={userProfile.avatar} alt={userProfile.username} />
            <AvatarFallback>{userProfile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">{userProfile.fullName}</h2>
            <p className="text-muted-foreground">@{userProfile.username}</p>
            {userProfile.bio && (
              <p className="mt-2 text-sm">{userProfile.bio}</p>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0">
            {isCurrentUser ? (
              <Button variant="outline" className="rounded-full">
                Edit Profile
              </Button>
            ) : (
              <Button 
                variant={following ? "outline" : "default"}
                className="rounded-full"
                onClick={handleFollowToggle}
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex space-x-6">
          <div className="flex flex-col items-center">
            <span className="font-semibold">{userProfile.posts}</span>
            <span className="text-sm text-muted-foreground">Posts</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="font-semibold">{userProfile.followers}</span>
            <span className="text-sm text-muted-foreground">Followers</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="font-semibold">{userProfile.following}</span>
            <span className="text-sm text-muted-foreground">Following</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
