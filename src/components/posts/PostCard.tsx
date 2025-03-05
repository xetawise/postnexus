
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistance } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal, HeartFill } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { getUserById } from "@/utils/mockData";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";

interface PostCardProps {
  post: {
    id: string;
    userId: string;
    text: string;
    images: string[];
    video: string | null;
    createdAt: string;
    isPrivate: boolean;
    likes: number;
    comments: number;
    shares: number;
  };
}

const PostCard = ({ post }: PostCardProps) => {
  const { user: currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  
  const user = getUserById(post.userId);
  
  if (!user) return null;
  
  const formattedDate = formatDistance(
    new Date(post.createdAt),
    new Date(),
    { addSuffix: true }
  );
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
      toast.success("Post liked!");
    }
    setLiked(!liked);
  };
  
  const handleComment = () => {
    setShowComments(!showComments);
  };
  
  const handleShare = () => {
    toast.success("Post shared!");
  };

  return (
    <Card className="mb-6 overflow-hidden glass-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.fullName}</span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
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
            <HeartFill size={18} className="text-red-500" />
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
