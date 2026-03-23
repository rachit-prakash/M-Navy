"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Home, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single()
          .then(({ data }) => setAvatar(data?.avatar_url || session.user.user_metadata?.avatar_url || null));
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen abyssal-gradient dark:bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 w-full max-w-full ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        <div className="h-16 border-b border-outline-variant/15 bg-surface/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-end md:justify-between px-4 md:px-8 shadow-sm">
          <div className="hidden md:flex flex-1">
            <span className="text-sm tracking-wider font-bold uppercase text-on-surface-variant/80 font-headline">M-NAVY Command System</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            <Link href="/forum" className="text-on-surface-variant hover:text-primary transition-colors p-2 flex items-center justify-center rounded-full hover:bg-surface-container-high" title="Home Dashboard">
              <Home className="h-5 w-5" />
            </Link>
            <ThemeToggle />
            <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors shrink-0 flex items-center justify-center bg-surface-container-highest">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-on-surface-variant" />
              )}
            </Link>
          </div>
        </div>
        <div className="p-4 md:px-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
