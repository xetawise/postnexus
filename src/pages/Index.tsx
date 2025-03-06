
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "./LoginPage";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your session...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return <LoginPage />;
};

export default Index;
