
import { useState, useRef } from "react";
import { Image, X, File, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/toast-utils";
import { supabase } from "@/lib/supabase";

interface PostFormProps {
  onPostCreated?: () => void;
}

const PostForm = ({ onPostCreated }: PostFormProps) => {
  const { user, profile } = useAuth();
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
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
  
  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (error) {
      throw error;
    }
    
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl.publicUrl;
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
        // Create images bucket if it doesn't exist
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('images');
        
        if (bucketError && bucketError.message.includes('does not exist')) {
          await supabase.storage.createBucket('images', {
            public: true
          });
        }
        
        for (const image of selectedImages) {
          const imageUrl = await uploadFile(image, 'images');
          uploadedImageUrls.push(imageUrl);
        }
      }
      
      // Upload video if any
      let uploadedVideoUrl: string | null = null;
      if (selectedVideo) {
        // Create videos bucket if it doesn't exist
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('videos');
        
        if (bucketError && bucketError.message.includes('does not exist')) {
          await supabase.storage.createBucket('videos', {
            public: true
          });
        }
        
        uploadedVideoUrl = await uploadFile(selectedVideo, 'videos');
      }
      
      // Create post
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
      setPostText("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setSelectedVideo(null);
      setVideoPreviewUrl(null);
      setIsPrivate(false);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      toast.error("Failed to create post: " + error.message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 glass-card overflow-hidden">
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
            />
            
            {imagePreviewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imagePreviewUrls.map((image, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={image} 
                      alt={`Preview ${index}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X size={14} />
                    </Button>
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
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  onClick={removeVideo}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
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
              <Send size={16} className="mr-1" /> Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostForm;
