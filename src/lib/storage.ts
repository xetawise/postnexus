import { supabase } from "./supabase";

export const ensureBucketExists = async (bucketName: string) => {
  try {
    // First check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} not found, attempting to create it`);
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
  if (!userId) {
    throw new Error('User ID is required for file upload');
  }
  
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
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
    
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
  
  // If it's already a full URL but not a blob URL, just return it
  if (filePath.startsWith('http') && !filePath.includes('blob:')) {
    return filePath;
  }
  
  // If it starts with blob:, it means it's a temporary URL that hasn't been saved to Supabase yet
  if (filePath.startsWith('blob:')) {
    console.warn('Attempted to use blob URL that may not persist:', filePath);
    return '/placeholder.svg'; // Return a placeholder instead of the blob URL
  }
  
  // Handle data URLs (e.g., base64 encoded images)
  if (filePath.startsWith('data:')) {
    return filePath;
  }
  
  // Otherwise, get the public URL from Supabase
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error(`Error getting public URL for ${bucket}/${filePath}:`, error);
    return '/placeholder.svg';
  }
};

export const deleteFile = async (filePath: string, bucket: string) => {
  if (!filePath) return false;
  
  // Don't try to delete blob URLs or placeholders
  if (filePath.startsWith('blob:') || filePath.startsWith('data:') || filePath === '/placeholder.svg') {
    return true;
  }
  
  // If it's already a URL, extract just the path
  if (filePath.startsWith('http')) {
    try {
      const url = new URL(filePath);
      const pathParts = url.pathname.split('/');
      // Remove the bucket name and 'object' from the path
      pathParts.splice(0, 3);
      filePath = pathParts.join('/');
    } catch (error) {
      console.error('Error parsing file URL:', error);
      return false;
    }
  }
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    if (error) {
      console.error(`Error deleting file ${filePath} from ${bucket}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath} from ${bucket}:`, error);
    return false;
  }
};
