
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "@/components/ui/toast-utils";
import { useAuth } from "@/context/AuthContext";
import { supabase, type Post } from "@/lib/supabase";

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
}

const PostCard = ({ post, onPostUpdated }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  
  useEffect(() => {
    // Check if user has liked this post
    const checkIfLiked = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking like status:", error);
        return;
      }
      
      setLiked(!!data);
    };
    
    checkIfLiked();
  }, [post.id, user]);
  
  const formattedDate = formatDistance(
    new Date(post.created_at),
    new Date(),
    { addSuffix: true }
  );
  
  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like posts");
      return;
    }
    
    try {
      if (liked) {
        // Unlike post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setLikeCount(prev => prev - 1);
        setLiked(false);
      } else {
        // Like post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        if (error) throw error;
        
        setLikeCount(prev => prev + 1);
        setLiked(true);
        toast.success("Post liked!");
        
        // Update the post's like count
        await supabase
          .from('posts')
          .update({ likes: likeCount + 1 })
          .eq('id', post.id);
        
        // Create notification for the post owner
        if (user.id !== post.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'like',
              initiator_id: user.id,
              content_id: post.id
            });
        }
      }
      
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error: any) {
      toast.error("Failed to update like: " + error.message);
      console.error(error);
    }
  };
  
  const handleComment = () => {
    setShowComments(!showComments);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
    toast.success("Post link copied to clipboard!");
  };

  if (!post.profile) return null;

  return (
    <Card className="mb-6 overflow-hidden glass-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <Link to={`/profile/${post.profile.username}`} className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={post.profile.avatar || undefined} alt={post.profile.username} />
              <AvatarFallback>{post.profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{post.profile.full_name}</span>
              <span className="text-xs text-muted-foreground">@{post.profile.username}</span>
            </div>
          </Link>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="mb-4 text-sm whitespace-pre-line">{post.text}</p>
        
        {post.images && post.images.length > 0 && (
          <div className="overflow-hidden rounded-xl mb-2">
            {post.images.length === 1 ? (
              <img 
                src={post.images[0]} 
                alt="Post" 
                className="w-full h-auto max-h-96 object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {post.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <img 
                        src={image} 
                        alt={`Post image ${index + 1}`} 
                        className="w-full h-auto max-h-96 object-cover rounded-xl"
                        loading="lazy"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            )}
          </div>
        )}
        
        {post.video && (
          <div className="overflow-hidden rounded-xl mb-2">
            <video 
              src={post.video} 
              controls 
              className="w-full h-auto max-h-96 object-cover rounded-xl"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          className="flex items-center space-x-1 rounded-full px-4"
        >
          {liked ? (
            <Heart size={18} className="text-red-500 fill-current" />
          ) : (
            <Heart size={18} />
          )}
          <span>{likeCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleComment}
          className="flex items-center space-x-1 rounded-full px-4"
        >
          <MessageCircle size={18} />
          <span>{post.comments}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="flex items-center space-x-1 rounded-full px-4"
        >
          <Share2 size={18} />
          <span>{post.shares}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
