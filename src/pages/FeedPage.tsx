
import { useState, useEffect } from "react";
import { posts, getUserById } from "@/utils/mockData";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/posts/PostCard";
import PostForm from "@/components/posts/PostForm";
import RecommendedUsers from "@/components/user/RecommendedUsers";

const FeedPage = () => {
  const { user } = useAuth();
  const [feedPosts, setFeedPosts] = useState<typeof posts>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching posts
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFeedPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <PostForm />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Your Feed</h2>
          
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
              {feedPosts.length > 0 ? (
                feedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No posts yet. Follow some users to see their posts.</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="hidden md:block">
          <div className="sticky top-4">
            <RecommendedUsers />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
