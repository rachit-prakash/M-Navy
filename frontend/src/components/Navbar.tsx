"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Ship, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0A0A0B]/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Ship className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold tracking-tight text-white">
            M-Navy<span className="text-blue-500">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/forum" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <ThemeToggle />
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-800">
                <span className="text-sm text-gray-400 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                href="/login"
                className="ml-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
