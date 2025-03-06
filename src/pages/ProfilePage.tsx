
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/user/ProfileHeader";
import PostCard from "@/components/posts/PostCard";
import RecommendedUsers from "@/components/user/RecommendedUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Post, Profile } from "@/lib/supabase";
import { toast } from "@/components/ui/toast-utils";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  
  // Fetch user profile data
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
        throw error;
      }
      
      return data as Profile | null;
    },
    enabled: !!username
  });
  
  // Fetch user posts
  const { 
    data: userPosts = [], 
    isLoading: postsLoading
  } = useQuery({
    queryKey: ['userPosts', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
        return [];
      }
      
      return data as Post[];
    },
    enabled: !!userProfile?.id
  });

  // Fetch posts liked by user
  const { 
    data: likedPosts = [], 
    isLoading: likedPostsLoading 
  } = useQuery({
    queryKey: ['likedPosts', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      // Get liked post IDs first
      const { data: likedPostsData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userProfile.id);
        
      if (likesError) {
        console.error("Error fetching liked posts:", likesError);
        return [];
      }
      
      // If no liked posts, return empty array
      if (!likedPostsData.length) return [];
      
      // Get the actual posts
      const postIds = likedPostsData.map(like => like.post_id);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching liked posts details:", error);
        return [];
      }
      
      return data as Post[];
    },
    enabled: activeTab === 'likes' && !!userProfile?.id
  });

  // Fetch posts with media
  const { 
    data: mediaPosts = [], 
    isLoading: mediaPostsLoading 
  } = useQuery({
    queryKey: ['mediaPosts', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('user_id', userProfile.id)
        .or('array_length(images,1).gt.0,video.is.not.null')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching media posts:", error);
        return [];
      }
      
      return data as Post[];
    },
    enabled: activeTab === 'media' && !!userProfile?.id
  });
  
  if (profileError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Error loading profile</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  if (!username) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">User not found</h2>
      </div>
    );
  }
  
  const isLoading = profileLoading || 
    (activeTab === 'posts' && postsLoading) || 
    (activeTab === 'media' && mediaPostsLoading) || 
    (activeTab === 'likes' && likedPostsLoading);

  return (
    <div className="max-w-2xl mx-auto">
      {profileLoading ? (
        <div className="h-64 glass-card animate-pulse rounded-xl mb-6"></div>
      ) : userProfile ? (
        <ProfileHeader profile={userProfile} />
      ) : (
        <div className="text-center py-10 glass-card mb-6">
          <h2 className="text-xl font-semibold">User not found</h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full rounded-xl mb-4">
              <TabsTrigger value="posts" className="flex-1 rounded-lg">Posts</TabsTrigger>
              <TabsTrigger value="media" className="flex-1 rounded-lg">Media</TabsTrigger>
              <TabsTrigger value="likes" className="flex-1 rounded-lg">Likes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              {isLoading ? (
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
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div 
                      key={item} 
                      className="h-64 glass-card animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  {mediaPosts.length > 0 ? (
                    mediaPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-muted-foreground">No media posts yet.</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="likes">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div 
                      key={item} 
                      className="h-64 glass-card animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  {likedPosts.length > 0 ? (
                    likedPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="glass-card p-6 text-center">
                      <p className="text-muted-foreground">No liked posts yet.</p>
                    </div>
                  )}
                </>
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
