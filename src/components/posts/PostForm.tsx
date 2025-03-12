
import { useState, useRef } from "react";
import { Image, X, File, Send, MoreVertical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/toast-utils";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostFormProps {
  onPostCreated?: () => void;
  existingPost?: {
    id: string;
    text: string;
    images: string[];
    video: string | null;
    is_private: boolean;
  };
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
}

const PostForm = ({ 
  onPostCreated, 
  existingPost, 
  onPostUpdated, 
  onPostDeleted 
}: PostFormProps) => {
  const { user, profile } = useAuth();
  const [postText, setPostText] = useState(existingPost?.text || "");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(existingPost?.is_private || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>(
    existingPost?.images || []
  );
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    existingPost?.video || null
  );
  const [isEditing, setIsEditing] = useState(!!existingPost);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...filesArray]);
      
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
    }
  };
  
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviewUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleDelete = async () => {
    if (!existingPost || !user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', existingPost.id);
        
      if (error) {
        toast.error("Failed to delete post: " + error.message);
        return;
      }
      
      toast.success("Post deleted successfully!");
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error: any) {
      toast.error("Failed to delete post: " + error.message);
      console.error(error);
    }
  };
  
  const handleCancel = () => {
    if (existingPost) {
      setPostText(existingPost.text);
      setImagePreviewUrls(existingPost.images);
      setVideoPreviewUrl(existingPost.video);
      setIsPrivate(existingPost.is_private);
      setIsEditing(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!postText && selectedImages.length === 0 && !selectedVideo) {
      toast.error("Your post cannot be empty");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload images if any
      const uploadedImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const imagePath = await uploadFile(image, 'images', user.id);
          uploadedImageUrls.push(imagePath);
        }
      }
      
      // Upload video if any
      let uploadedVideoUrl: string | null = null;
      if (selectedVideo) {
        const videoPath = await uploadFile(selectedVideo, 'videos', user.id);
        uploadedVideoUrl = videoPath;
      }
      
      if (existingPost) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update({
            text: postText,
            images: [...(existingPost.images || []), ...uploadedImageUrls],
            video: uploadedVideoUrl || existingPost.video,
            is_private: isPrivate
          })
          .eq('id', existingPost.id);
          
        if (error) {
          toast.error("Failed to update post: " + error.message);
          return;
        }
        
        toast.success("Post updated successfully!");
        setIsEditing(false);
        
        if (onPostUpdated) {
          onPostUpdated();
        }
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            text: postText,
            images: uploadedImageUrls,
            video: uploadedVideoUrl,
            is_private: isPrivate
          })
          .select();
        
        if (error) {
          toast.error("Failed to create post: " + error.message);
          return;
        }
        
        toast.success("Post created successfully!");
        
        if (onPostCreated) {
          onPostCreated();
        }
      }
      
      // Reset form if creating a new post
      if (!existingPost) {
        setPostText("");
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setSelectedVideo(null);
        setVideoPreviewUrl(null);
        setIsPrivate(false);
      }
    } catch (error: any) {
      toast.error("Failed to " + (existingPost ? "update" : "create") + " post: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPostActions = () => {
    if (!existingPost) return null;
    
    return (
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <Card className="mb-6 glass-card overflow-hidden relative">
      {renderPostActions()}
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={profile?.avatar || undefined} alt={profile?.username} />
            <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <textarea
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="w-full min-h-[100px] bg-transparent border-none focus:outline-none resize-none text-sm placeholder:text-muted-foreground"
              readOnly={existingPost && !isEditing}
            />
            
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imagePreviewUrls.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={imageUrl} 
                      alt={`Preview ${index}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {(!existingPost || isEditing) && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {videoPreviewUrl && (
              <div className="relative mt-2">
                <video 
                  src={videoPreviewUrl} 
                  controls 
                  className="w-full h-auto rounded-lg"
                />
                {(!existingPost || isEditing) && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={removeVideo}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {(!existingPost || isEditing) && (
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex space-x-2">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={imageInputRef}
              onChange={handleImageSelect}
            />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image size={18} />
            </Button>
            
            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              disabled={selectedVideo !== null}
            />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => videoInputRef.current?.click()}
              disabled={selectedVideo !== null}
            >
              <File size={18} />
            </Button>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacy-toggle"
                checked={isPrivate}
                onChange={() => setIsPrivate(!isPrivate)}
                className="mr-1"
              />
              <label htmlFor="privacy-toggle" className="text-xs cursor-pointer">
                Private
              </label>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-4"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-full px-4"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spinner"></div>
              ) : (
                <>
                  <Send size={16} className="mr-1" /> {existingPost ? "Update" : "Post"}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PostForm;
