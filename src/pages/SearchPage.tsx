
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast-utils";
import PostCard from "@/components/posts/PostCard";
import { users, posts } from "@/utils/mockData";
import { Link } from "react-router-dom";
import { Post, Profile } from "@/lib/supabase";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
  );

  // Transform the mock posts to match the Supabase Post type
  const transformedPosts: Post[] = posts.map(post => ({
    id: post.id,
    user_id: post.userId,
    text: post.text,
    images: post.images,
    video: post.video,
    created_at: post.createdAt,
    is_private: post.isPrivate,
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    profile: {
      id: post.userId,
      username: users.find(u => u.id === post.userId)?.username || '',
      full_name: users.find(u => u.id === post.userId)?.fullName || '',
      avatar: users.find(u => u.id === post.userId)?.avatar || null,
      bio: users.find(u => u.id === post.userId)?.bio || null,
      is_private: false,
      created_at: '',
      followers: 0,
      following: 0,
      posts: 0
    }
  }));

  const filteredPosts = transformedPosts.filter(
    (post) =>
      post.text.toLowerCase().includes(query.toLowerCase()) ||
      post.profile?.full_name.toLowerCase().includes(query.toLowerCase()) ||
      post.profile?.username.toLowerCase().includes(query.toLowerCase())
  );

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
          {query && filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`You are now following ${user.fullName}`)}
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
          {query && filteredPosts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts found</p>
          ) : (
            filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default SearchPage;
