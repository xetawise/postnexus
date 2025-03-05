
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserById, getPostsByUserId } from "@/utils/mockData";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/user/ProfileHeader";
import PostCard from "@/components/posts/PostCard";
import RecommendedUsers from "@/components/user/RecommendedUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!username) return;
      
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = users.find(u => u.username === username);
        if (user) {
          const posts = getPostsByUserId(user.id);
          // Sort posts by date (newest first)
          const sortedPosts = [...posts].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setUserPosts(sortedPosts);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPosts();
  }, [username]);
  
  if (!username) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">User not found</h2>
      </div>
    );
  }
  
  // Find the user from the mock data
  const users = Object.values(getUserById).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader username={username} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full rounded-xl mb-4">
              <TabsTrigger value="posts" className="flex-1 rounded-lg">Posts</TabsTrigger>
              <TabsTrigger value="media" className="flex-1 rounded-lg">Media</TabsTrigger>
              <TabsTrigger value="likes" className="flex-1 rounded-lg">Likes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div 
                      key={item} 
                      className="h-64 glass-card animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  {userPosts.length > 0 ? (
                    userPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-10 glass-card p-6">
                      <p className="text-muted-foreground">No posts yet.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="media">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div 
                      key={item} 
                      className="h-64 glass-card animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground">Media posts will be displayed here.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="likes">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div 
                      key={item} 
                      className="h-64 glass-card animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="glass-card p-6 text-center">
                  <p className="text-muted-foreground">Liked posts will be displayed here.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden md:block">
          <div className="sticky top-4">
            {currentUser && <RecommendedUsers />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
