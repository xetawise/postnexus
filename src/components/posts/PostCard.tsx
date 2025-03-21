
import React, { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast-utils";
import { useAuth } from "@/context/AuthContext";
import { supabase, type Post } from "@/lib/supabase";
import { getFileUrl } from "@/lib/storage";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
}

const PostCard = ({ post, onPostUpdated }: PostCardProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const handleLikeToggle = async () => {
    if (!user) {
      toast.error("You must be logged in to like a post");
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike post
        await supabase
          .from('post_likes')
          .delete()
          .match({ post_id: post.id, user_id: user.id });
          
        post.likes = Math.max(0, post.likes - 1);
      } else {
        // Like post
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
          
        post.likes = post.likes + 1;
      }
      
      setIsLiked(!isLiked);
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };
  
  React.useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('post_likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        setIsLiked(data && data.length > 0);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    
    checkLikeStatus();
  }, [post.id, user]);
  
  const handleSharePost = () => {
    // For now just show a toast, in the future could implement actual sharing
    toast.success("Share feature coming soon!");
  };
  
  const handleDeletePost = async () => {
    if (!user || user.id !== post.user_id) {
      toast.error("You can only delete your own posts");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
        
      if (error) throw error;
      
      toast.success("Post deleted successfully");
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };
  
  const formatPostTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };
  
  const MAX_TEXT_LENGTH = 200;
  const hasLongText = post.text && post.text.length > MAX_TEXT_LENGTH;
  const displayText = showFullText || !hasLongText 
    ? post.text 
    : `${post.text.substring(0, MAX_TEXT_LENGTH)}...`;
  
  return (
    <Card className="mb-4 glass-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={post.profile?.avatar} alt={post.profile?.username} />
              <AvatarFallback>
                {post.profile?.username?.substring(0, 2).toUpperCase() || 'NA'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{post.profile?.full_name}</div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <span>@{post.profile?.username}</span>
                <span>•</span>
                <span>{formatPostTime(post.created_at)}</span>
              </div>
            </div>
          </div>
          
          {user && user.id === post.user_id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={handleDeletePost}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {post.text && (
          <div className="mt-3 text-sm">
            <p className="whitespace-pre-wrap">{displayText}</p>
            {hasLongText && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-primary text-xs mt-1"
              >
                {showFullText ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
        
        {post.images && post.images.length > 0 && (
          <div className={`mt-3 grid gap-2 ${post.images.length === 1 ? '' : 'grid-cols-2'}`}>
            {post.images.map((image, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden ${post.images.length === 1 ? 'max-h-96' : 'h-48'}`}
              >
                <img 
                  src={getFileUrl(image, 'images')} 
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Error loading image:", image);
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        {post.video && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <video 
              src={getFileUrl(post.video, 'videos')} 
              controls 
              className="w-full max-h-96"
              onError={(e) => {
                console.error("Error loading video:", post.video);
                const video = e.target as HTMLVideoElement;
                video.poster = '/placeholder.svg';
              }}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center"
          onClick={handleLikeToggle}
        >
          <Heart size={16} className={`mr-1 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          {post.likes || 0}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center"
        >
          <MessageCircle size={16} className="mr-1" />
          {post.comments || 0}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center"
          onClick={handleSharePost}
        >
          <Share size={16} className="mr-1" />
          {post.shares || 0}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
