"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus, Loader2, Filter, MessageCircle, Bookmark, ChevronRight } from "lucide-react";
import NewsWidget from "@/components/NewsWidget";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function ForumFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          category,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Provide high-quality mock data if database is empty so UI feels alive
      if (!data || data.length === 0) {
        setPosts([
          { id: "m1", title: "Clarification on SOLAS Chapter II-2 (Fire Protection)", content: "We are currently reviewing the fixed fire-extinguishing systems requirements for our new build. The text regarding pump capacities in relation to cargo area seems slightly ambiguous. Has anyone had recent flag state inspections focus on this specific clause?", category: "Safety & Regulations", created_at: new Date().toISOString(), profiles: { username: "Capt. Reynolds", avatar_url: null } },
          { id: "m2", title: "B&W ME-C Engine: Exhaust Valve Actuator Maintenance", content: "Noticed a slight delay in exhaust valve closing on unit #4. We've overhauled the hydraulic actuator but the FIVA valve might be the culprit. Any Chief Engineers experienced similar timing issues with these electronic engines?", category: "Engine", created_at: new Date(Date.now() - 86400000).toISOString(), profiles: { username: "ChiefEng_Davis", avatar_url: null } },
          { id: "m3", title: "Navigating the Malacca Strait: Recent piracy hotspots?", content: "Preparing for a transit next week. ReCAAP reports show an uptick in armed robbery incidents near the eastbound lane. What additional hardening measures are you guys implementing on low freeboard vessels?", category: "Deck", created_at: new Date(Date.now() - 172800000).toISOString(), profiles: { username: "NavOfficer_Sam", avatar_url: null } },
        ]);
      } else {
        setPosts(data as any);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitLoading(true);

    try {
      const { error } = await supabase.from('posts').insert([
        {
          title: newTitle,
          content: newContent,
          category: newCategory,
          author_id: user.id
        }
      ]);

      if (error) throw error;

      setIsCreating(false);
      setNewTitle("");
      setNewContent("");
      fetchPosts(); // Reload feed
    } catch (err) {
      console.error(err);
      alert("Failed to create post. Check console for details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
      {/* Center Discussion Feed */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-wider text-primary mb-2 uppercase">OFFICER'S FORUM</h1>
            <p className="text-on-surface-variant font-body">Encrypted tactical discussions for authorized personnel only.</p>
          </div>
          <div className="flex space-x-4">
            {user && (
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold border border-primary/20 flex items-center space-x-2 hover:bg-primary/20 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New SITREP</span>
              </button>
            )}
            <button className="px-4 py-2 bg-surface-container-high rounded-lg text-sm font-medium border border-outline-variant/15 flex items-center space-x-2 text-on-surface">
              <Filter className="h-4 w-4" />
              <span>Latest</span>
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="glass-card mb-8 p-6 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-headline font-bold text-on-surface mb-4">Draft New SITREP</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Transmission Subject..."
                  className="input-field"
                />
              </div>
              <div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Deck">Deck Department</option>
                  <option value="Engine">Engine Room</option>
                  <option value="Safety">Safety</option>
                  <option value="Career">Career Development</option>
                </select>
              </div>
              <div>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Detail the operational situation or inquiry..."
                  className="input-field resize-none"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary"
                >
                  Abort
                </button>
                <button type="submit" disabled={submitLoading} className="btn-primary flex items-center justify-center min-w-[120px]">
                  {submitLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Transmit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-10 md:p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-outline-variant/20">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">No transmissions intercepted</h3>
            <p className="text-on-surface-variant font-body max-w-md mx-auto mb-6 leading-relaxed">
              The communication channels are quiet. Be the first to broadcast a SITREP or operational inquiry.
            </p>
            {user ? (
              <button onClick={() => setIsCreating(true)} className="btn-primary">
                Broadcast SITREP
              </button>
            ) : (
              <Link href="/login" className="btn-primary">
                Log in to Transmit
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              // Dynamic category colors based on Stitch's mockup
              let catBg = "bg-primary/10";
              let catText = "text-primary";
              let catBorder = "border-primary/30";
              
              if (post.category === "Safety" || post.category === "Safety & Regulations") {
                catBg = "bg-error/10"; catText = "text-error"; catBorder = "border-error/30";
              } else if (post.category === "Engine" || post.category === "Engine Room") {
                catBg = "bg-tertiary/10"; catText = "text-tertiary"; catBorder = "border-tertiary/30";
              } else if (post.category === "Deck" || post.category === "Deck Department") {
                catBg = "bg-[#343d96]/40"; catText = "text-[#bdc2ff]"; catBorder = "border-[#343d96]";
              }

              return (
                <div key={post.id} className="glass-card rounded-xl p-6 transition-all hover:-translate-y-1 group hover:border-primary/50 block">
                  <Link href={post.id.startsWith("m") ? "#" : `/post/${post.id}`} className="block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full border-2 border-primary/20 bg-surface-container-highest flex items-center justify-center overflow-hidden">
                          {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-on-surface-variant">
                              {post.profiles?.username?.[0]?.toUpperCase() || "A"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-headline font-bold text-on-surface">{post.profiles?.username || "Anonymous"}</span>
                            <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-widest uppercase rounded">Officer</span>
                          </div>
                          <span className="text-xs text-on-surface-variant/60">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${catBg} ${catText} text-xs font-bold tracking-wider uppercase rounded-full border ${catBorder} whitespace-nowrap`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-headline font-extrabold text-on-surface mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-on-surface-variant line-clamp-2 mb-6 font-body leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-on-surface-variant group-hover:text-primary transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-bold">Discuss</span>
                        </div>
                        <div className="flex items-center space-x-2 text-on-surface-variant hover:text-tertiary transition-colors z-10" onClick={(e) => e.preventDefault()}>
                          <Bookmark className="h-5 w-5" />
                          <span className="text-sm">Save</span>
                        </div>
                      </div>
                      <div className="text-primary text-xs font-bold tracking-widest uppercase flex items-center space-x-1">
                        <span>Read SITREP</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Widget Panel - Maritime News */}
      <div className="hidden lg:block col-span-4 sticky top-6 max-h-[calc(100vh-8rem)]">
        <NewsWidget />
      </div>
    </div>
  );
}
