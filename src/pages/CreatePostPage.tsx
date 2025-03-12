
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Image, X, File, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast-utils";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/lib/storage";
import { useEffect as useEffectImport } from "react"; // Dummy import to avoid linting error

const CreatePostPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  // Ensure user is authenticated on mount and when auth state changes
  useEffect(() => {
    console.log("Auth check - Current user:", user);
    if (!user) {
      toast.error("You must be logged in to create a post");
      navigate("/login");
    }
  }, [user, navigate]);
  
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
  
  const handleSubmit = async () => {
    if (!postText && selectedImages.length === 0 && !selectedVideo) {
      toast.error("Your post cannot be empty");
      return;
    }
    
    if (!user) {
      console.error("No authenticated user found");
      toast.error("You must be logged in to create a post");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Debug auth information
      console.log("Creating post as user:", user.id);
      console.log("User profile:", profile);
      
      // Upload images if any
      const uploadedImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        console.log(`Uploading ${selectedImages.length} images`);
        for (const image of selectedImages) {
          try {
            const imageUrl = await uploadFile(image, 'images', user.id);
            console.log("Image uploaded successfully:", imageUrl);
            uploadedImageUrls.push(imageUrl);
          } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            toast.error(`Failed to upload image: ${image.name}`);
          }
        }
      }
      
      // Upload video if any
      let uploadedVideoUrl: string | null = null;
      if (selectedVideo) {
        console.log("Uploading video");
        try {
          uploadedVideoUrl = await uploadFile(selectedVideo, 'videos', user.id);
          console.log("Video uploaded successfully:", uploadedVideoUrl);
        } catch (uploadError) {
          console.error("Video upload error:", uploadError);
          toast.error(`Failed to upload video: ${selectedVideo.name}`);
        }
      }
      
      // Create post in Supabase with explicit user_id
      console.log("Creating post with data:", {
        user_id: user.id,
        text: postText,
        images: uploadedImageUrls,
        video: uploadedVideoUrl,
        is_private: isPrivate
      });
      
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
        console.error("Supabase post creation error:", error);
        throw error;
      }
      
      console.log("Post created successfully:", data);
      toast.success("Post created successfully!");
      navigate("/feed");
    } catch (error: any) {
      toast.error("Failed to create post: " + error.message);
      console.error("Post creation error details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full mr-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            <CardTitle className="text-lg">Create New Post</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={profile?.avatar || ''} alt={profile?.username} />
              <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-sm">{profile?.full_name}</span>
                <span className="text-xs text-muted-foreground">@{profile?.username}</span>
              </div>
              
              <Textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="min-h-[150px] glass-input resize-none text-sm"
              />
              
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {imagePreviewUrls.map((imageUrl, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Preview ${index}`} 
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {videoPreviewUrl && (
                <div className="relative mt-4 rounded-xl overflow-hidden">
                  <video 
                    src={videoPreviewUrl}
                    controls 
                    className="w-full h-auto"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={removeVideo}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="image-upload"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Label 
                      htmlFor="image-upload" 
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Button variant="outline" size="icon" className="rounded-full">
                        <Image size={18} />
                      </Button>
                      <span>Add Images</span>
                    </Label>
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      id="video-upload"
                      className="hidden"
                      onChange={handleVideoSelect}
                      disabled={selectedVideo !== null}
                    />
                    <Label 
                      htmlFor="video-upload" 
                      className={`flex items-center space-x-2 ${selectedVideo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full"
                        disabled={selectedVideo !== null}
                      >
                        <File size={18} />
                      </Button>
                      <span>Add Video</span>
                    </Label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="privacy-toggle"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="privacy-toggle">Private Post</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end border-t border-border p-4">
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full px-6"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spinner"></div>
            ) : (
              "Post"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreatePostPage;
