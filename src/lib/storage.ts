
import { supabase } from "./supabase";

export const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      // Create the bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
    
    console.log(`Bucket ${bucketName} already exists`);
    return true;
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    return false;
  }
};

export const uploadFile = async (file: File, bucket: string, userId: string) => {
  // First ensure the bucket exists
  const bucketExists = await ensureBucketExists(bucket);
  if (!bucketExists) {
    throw new Error(`Failed to ensure bucket ${bucket} exists`);
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;
  
  console.log(`Uploading file to ${bucket}/${filePath}`);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
    
  if (error) {
    console.error(`Error uploading file to ${bucket}/${filePath}:`, error);
    throw error;
  }
  
  console.log(`File uploaded successfully to ${bucket}/${filePath}`);
  
  // Get and return the public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return publicUrlData.publicUrl;
};

export const getFileUrl = (filePath: string, bucket: string) => {
  if (!filePath) return null;
  
  if (filePath.startsWith('http') || filePath.startsWith('data:')) {
    return filePath;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};
