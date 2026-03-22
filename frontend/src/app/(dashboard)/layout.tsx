"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen abyssal-gradient dark:bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 w-full max-w-full ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <div className="h-16 border-b border-outline-variant/15 bg-surface/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-end md:justify-between px-4 md:px-8 shadow-sm">
          <div className="hidden md:flex flex-1">
            <span className="text-sm tracking-wider font-bold uppercase text-on-surface-variant/80 font-headline">M-NAVY Command System</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="p-4 md:px-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
