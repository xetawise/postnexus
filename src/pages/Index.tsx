
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "./LoginPage";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-xl font-bold text-primary">SocialApp</div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </Link>
            </Button>
            <Button asChild>
              <Link to="/signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <LoginPage />
      </main>
    </div>
  );
};

export default Index;
