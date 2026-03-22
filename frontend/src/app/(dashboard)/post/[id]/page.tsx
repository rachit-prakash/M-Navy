"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

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
  replies: Reply[];
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [newReply, setNewReply] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, content, category, created_at,
          profiles (username, avatar_url),
          replies (
            id, content, created_at,
            profiles (username, avatar_url)
          )
        `)
        .eq('id', params.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.replies) {
        data.replies.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
      
      setPost(data as any);
    } catch (err) {
      console.error(err);
      router.push("/forum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [params.id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReply.trim()) return;
    setSubmitLoading(true);

    try {
      const { error } = await supabase.from('replies').insert([
        {
          post_id: params.id,
          content: newReply,
          author_id: user.id
        }
      ]);

      if (error) throw error;
      setNewReply("");
      fetchPost(); // Reload to get new reply
    } catch (err) {
      console.error(err);
      alert("Failed to post reply. Please check console.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 animate-in fade-in duration-300">
      <button 
        onClick={() => router.push("/forum")}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold uppercase tracking-wider">Back to Discussions</span>
      </button>

      {/* Main Post */}
      <div className="glass-card p-6 md:p-8 mb-8 border-t-4 border-primary/50">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
          <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-primary/10 text-primary uppercase">
            {post.category}
          </span>
          <span className="text-sm text-on-surface-variant">
            Posted by <span className="text-on-surface font-headline font-bold">{post.profiles?.username || "Anonymous"}</span>
          </span>
          <span className="text-sm text-outline-variant">•</span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" title={new Date(post.created_at).toLocaleString()}>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface mb-6 leading-tight uppercase tracking-wider">
          {post.title}
        </h1>
        <div className="prose prose-invert max-w-none text-on-surface font-body leading-relaxed text-lg whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      {/* Replies Section */}
      <div className="mb-8">
        <h3 className="text-xl font-headline font-bold text-on-surface mb-6 flex items-center gap-2 tracking-widest uppercase">
          <MessageCircle className="h-5 w-5 text-primary" />
          {post.replies?.length || 0} Replies
        </h3>
        
        <div className="space-y-4">
          {post.replies?.map((reply) => (
            <div key={reply.id} className="glass-card p-6 border-l-2 border-l-tertiary shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                <span className="text-sm font-headline font-bold text-on-surface">
                  {reply.profiles?.username || "Anonymous"}
                </span>
                <span className="text-xs text-outline-variant">•</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-on-surface-variant font-body whitespace-pre-wrap leading-relaxed">
                {reply.content}
              </p>
            </div>
          ))}

          {post.replies?.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant bg-surface-container-highest/30 rounded-2xl border border-dashed border-outline-variant/30">
              No replies yet. Be the first to advise.
            </div>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {user ? (
        <div className="glass-card p-6 sticky bottom-4 shadow-2xl">
          <form onSubmit={handleReply}>
            <label className="block text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant mb-2">Leave a reply</label>
            <textarea
              required
              rows={3}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share your knowledge or operational protocols..."
              className="input-field resize-none mb-4 focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitLoading || !newReply.trim()} 
                className="btn-primary min-w-[150px] flex justify-center text-xs tracking-widest uppercase"
              >
                {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transmit Reply"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card p-6 text-center border-dashed border-outline-variant/30">
          <p className="text-on-surface-variant text-sm font-body">
            <button onClick={() => router.push("/login")} className="text-primary hover:text-primary/80 font-bold hover:underline">
              Sign in
            </button>{" "}
            to join the discussion network and transmit replies.
          </p>
        </div>
      )}
    </div>
  );
}
