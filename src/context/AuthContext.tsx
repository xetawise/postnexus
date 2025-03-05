import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/toast-utils";

type User = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  isPrivate: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration (will be replaced by Supabase)
const mockUsers = [
  {
    id: "1",
    email: "john@example.com",
    username: "johndoe",
    fullName: "John Doe",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Software developer passionate about UX/UI design",
    isPrivate: false,
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    email: "jane@example.com",
    username: "janesmith",
    fullName: "Jane Smith",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop&q=80",
    bio: "Digital artist and photographer",
    isPrivate: true,
    createdAt: "2023-02-20T00:00:00Z",
  },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUser = localStorage.getItem("nexus-user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication (will be replaced by Supabase)
      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("nexus-user", JSON.stringify(foundUser));
        toast.success("Signed in successfully");
        navigate("/feed");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string,
    username: string,
    fullName: string
  ) => {
    try {
      setLoading(true);
      
      // Mock signup (will be replaced by Supabase)
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username,
        fullName,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem("nexus-user", JSON.stringify(newUser));
      toast.success("Account created successfully");
      navigate("/feed");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      localStorage.removeItem("nexus-user");
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("nexus-user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
