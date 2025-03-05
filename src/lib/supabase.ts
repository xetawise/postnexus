
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cosyqmkvzvdlkzaxmdkd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvc3lxbWt2enZkbGt6YXhtZGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTg0MzcsImV4cCI6MjA1NjczNDQzN30.pB8Js9Yx7ZHhjKnPhN5cd2o8ly5hlN7-DGnUXLclKpQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
  bio: string | null;
  is_private: boolean;
  created_at: string;
  followers: number;
  following: number;
  posts: number;
};

export type Post = {
  id: string;
  user_id: string;
  text: string;
  images: string[];
  video: string | null;
  created_at: string;
  is_private: boolean;
  likes: number;
  comments: number;
  shares: number;
  profile?: Profile;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
  likes: number;
  profile?: Profile;
};
