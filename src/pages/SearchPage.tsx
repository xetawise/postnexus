
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast-utils";
import PostCard from "@/components/posts/PostCard";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Post, Profile } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { user } = useAuth(); // Use the Auth context to get the current user

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fetch users based on search query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${debouncedQuery}%,full_name.ilike.%${debouncedQuery}%`)
        .limit(20);
        
      if (error) {
        console.error("Error searching users:", error);
        toast.error("Failed to search users");
        return [];
      }
      
      return data as Profile[];
    },
    enabled: debouncedQuery.length > 0
  });

  // Fetch posts based on search query
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['searchPosts', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*)
        `)
        .or(`text.ilike.%${debouncedQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error("Error searching posts:", error);
        toast.error("Failed to search posts");
        return [];
      }
      
      return data as Post[];
    },
    enabled: debouncedQuery.length > 0
  });

  const handleFollowUser = async (userId: string) => {
    try {
      if (!user) {
        toast.error("You must be logged in to follow users");
        return;
      }
      
      const { error } = await supabase
        .from('user_relationships')
        .insert({ follower_id: user.id, following_id: userId });
        
      if (error) {
        console.error("Error following user:", error);
        toast.error("Failed to follow user");
        return;
      }
      
      toast.success("You are now following this user");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-4">
      <div className="sticky top-0 bg-background z-10 pb-2">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users and posts..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Tabs defaultValue="users" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4">
        <TabsContent value="users" className="space-y-4">
          {usersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item} 
                  className="h-24 glass-card animate-pulse rounded-xl"
                ></div>
              ))}
            </div>
          ) : debouncedQuery && users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || ''} alt={user.full_name} />
                        <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollowUser(user.id)}
                    >
                      Follow
                    </Button>
                  </div>
                  {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div 
                  key={item} 
                  className="h-64 glass-card animate-pulse rounded-xl"
                ></div>
              ))}
            </div>
          ) : debouncedQuery && posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts found</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default SearchPage;
