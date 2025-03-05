
import { supabase } from "./supabase";

export const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    return false;
  }
};

export const uploadFile = async (file: File, bucket: string, userId: string) => {
  await ensureBucketExists(bucket);
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
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
