"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ship, MessageSquare, Bot, FolderLock, User as UserIcon, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar({ isCollapsed = false, setIsCollapsed }: { isCollapsed?: boolean; setIsCollapsed?: (val: boolean) => void }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: "Forum", href: "/forum", icon: MessageSquare },
    { name: "AI Chatbot", href: "/chat", icon: Bot },
    { name: "Document Vault", href: "/vault", icon: FolderLock },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout error:", error);
    
    // Clear any local storage/cookies forcefully
    localStorage.clear();
    sessionStorage.clear();
    
    // Force a hard redirect
    window.location.replace("/");
  };

  const SidebarContent = ({ mobile = false }) => {
    const collapsed = !mobile && isCollapsed;
    
    return (
      <div className={`flex h-full flex-col bg-[#f5f5f5] dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-300 w-full`}>
        <div className={`flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-800 ${collapsed ? 'justify-center px-0' : ''}`}>
          <Link href="/" className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${collapsed ? "hidden" : ""}`}>
            <Ship className="h-6 w-6 text-blue-500 shrink-0" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              M-Navy<span className="text-blue-500">.</span>
            </span>
          </Link>
          {collapsed && (
            <Ship className="h-6 w-6 text-blue-500 shrink-0" />
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 py-3 sm:py-2.5 rounded-lg transition-all font-medium ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    : "hover:bg-gray-200 dark:hover:bg-[#1A1A1D] hover:text-gray-900 dark:hover:text-white text-gray-600 dark:text-gray-400"
                } ${collapsed ? "justify-center px-0" : "px-4"}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-3 mt-auto space-y-2">
          {!mobile && setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title="Toggle Sidebar"
              className={`flex w-full items-center gap-3 py-2 rounded-lg transition-all font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ${collapsed ? 'justify-center px-0' : 'px-4'}`}
            >
              {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <ChevronLeft className="h-5 w-5 shrink-0" />}
              {!collapsed && <span>Collapse</span>}
            </button>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-3 py-3 rounded-lg transition-all font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 ${collapsed ? "justify-center px-0" : "px-4"}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 text-gray-300 bg-[#121214] border border-gray-800 rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left-full duration-300">
            <SidebarContent mobile={true} />
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
