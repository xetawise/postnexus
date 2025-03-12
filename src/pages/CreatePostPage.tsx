
import { useState } from "react";
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
    if (!user) {
      toast.error("You must be logged in to upload files");
      throw new Error("User not authenticated");
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
      
    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      throw error;
    }
    
    return filePath;
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
          const imagePath = await uploadFile(image, 'images');
          uploadedImageUrls.push(imagePath);
        }
      }
      
      // Upload video if any
      let uploadedVideoUrl: string | null = null;
      if (selectedVideo) {
        const videoPath = await uploadFile(selectedVideo, 'videos');
        uploadedVideoUrl = videoPath;
      }
      
      // Create post in Supabase
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
        throw error;
      }
      
      toast.success("Post created successfully!");
      navigate("/feed");
    } catch (error: any) {
      toast.error("Failed to create post: " + error.message);
      console.error(error);
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
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden">
                      <img 
                        src={image} 
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
              
              {selectedVideo && (
                <div className="relative mt-4 rounded-xl overflow-hidden">
                  <video 
                    src={selectedVideo} 
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
