
import React from "react";
import { MainNavigation, MobileNavigation } from "../navigation/MainNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigation />
      <main className="flex-1 container mx-auto py-6 px-4 mb-16 md:mb-0">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
