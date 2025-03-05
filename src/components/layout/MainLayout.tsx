
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full bg-background">
      {!isMobile && (
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      )}
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl animate-fade-in">
          <Outlet />
        </div>
      </main>
      
      {isMobile && <MobileNavbar />}
    </div>
  );
};

export default MainLayout;
