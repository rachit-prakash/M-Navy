"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Ship, Loader2, Bot, User as UserIcon, Lock, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{
    role: "model",
    content: "Greetings Officer. I am the M-Navy AI Assistant, specialized in Merchant Navy operations, safety protocols, and regulations. How can I assist you today?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        // Fetch true DB avatar to bypass Google OAuth override
        supabase.from('profiles').select('avatar_url').eq('id', currentUser.id).single()
          .then(({ data }) => setDbAvatar(data?.avatar_url || null));

        try {
          // Cross-device Cloud Sync: Load history from Supabase Vault
          const { data, error } = await supabase.storage.from('vault').download(`${currentUser.id}/chat_history.json`);
          if (data) {
            const text = await data.text();
            setMessages(JSON.parse(text));
          }
        } catch (e) {
          console.error("Failed to load cloud chat history", e);
        }
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Save to cloud storage whenever messages change
  useEffect(() => {
    if (user && messages.length > 1) {
      const uploadHistory = async () => {
        try {
          const blob = new Blob([JSON.stringify(messages)], { type: 'application/json' });
          await supabase.storage.from('vault').upload(`${user.id}/chat_history.json`, blob, { upsert: true });
        } catch (e) {
          console.error("Failed to sync history to cloud", e);
        }
      };
      
      // Debounce slightly by just firing async
      uploadHistory();
    }
  }, [messages, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Failed to get AI response");

      setLoading(false); // Stop thinking spinner when stream starts
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";

      // Add placeholder for the streaming response
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep the last incomplete chunk in the buffer
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                aiMessage += parsed.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = aiMessage;
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Stream parse error chunks:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "⚠️ System Error: Unable to communicate with M-Navy AI servers. Please check your connection." },
      ]);
    } finally {
      // setLoading(false) already handled above for successful stream start
      setLoading(false);
    }
  };


  if (authChecked && !user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md w-full">
          <Lock className="h-12 w-12 text-outline mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Authentication Required</h2>
          <p className="text-on-surface-variant mb-6">You must be logged in to use the M-Navy AI Assistant.</p>
          <Link href="/login" className="btn-primary inline-block">
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

   return (
    <div className="flex h-[calc(100vh-6rem)] lg:h-[calc(100vh-7rem)] max-w-[1600px] mx-auto overflow-hidden">
      {/* Center: Main Chat Interface */}
      <section className="flex-1 flex flex-col relative px-4 lg:px-8 py-6 h-full">
        {/* Chat Header */}
        <div className="mb-6 flex shrink-0 items-end justify-between">
          <div className="max-w-xl">
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-wider text-primary uppercase flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              Mission Intel
            </h1>
            <p className="text-on-surface-variant font-body mt-2 text-sm md:text-base">Active Strategic Analysis Hub • OPERATIONAL AI</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={async () => {
                if (confirm("Purge conversational memory?")) {
                  setMessages([{ role: "model", content: "Memory purged. Secure comms channel re-established. How can I assist you today?" }]);
                  if (user) {
                    await supabase.storage.from('vault').remove([`${user.id}/chat_history.json`]);
                  }
                }
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors px-3 py-1.5 border border-outline-variant/10 rounded-lg bg-surface-container-high/50"
            >
              Purge Memory
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-label uppercase tracking-widest text-primary">System Online</span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4" style={{scrollbarWidth: 'thin'}}>
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-4 items-start max-w-3xl ${msg.role === "user" ? "flex-row-reverse ml-auto" : ""}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${msg.role === "user" ? "border-outline-variant/30 overflow-hidden" : "bg-primary primary-glow border-primary-fixed"}`}>
                {msg.role === "user" ? (
                  <img className="w-full h-full object-cover" alt="Officer Profile Avatar" src={dbAvatar || user?.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=Officer&background=random"}/>
                ) : (
                  <Bot className="h-5 w-5 text-on-primary" />
                )}
              </div>
              <div className={`p-5 md:p-6 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-surface-container-high rounded-tr-none border border-outline-variant/20" 
                  : "glass-card rounded-tl-none"
              }`}>
                <div className="flex justify-between items-center mb-2 gap-4">
                  <span className={`text-xs font-bold tracking-widest uppercase ${msg.role === "user" ? "text-on-surface" : "text-primary"}`}>
                    {msg.role === "user" ? (user?.user_metadata?.full_name || "OFFICER") : "M-Navy AI"}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} UTC
                  </span>
                </div>
                <div className="text-on-surface leading-relaxed font-body text-sm">
                  {msg.role === "model" ? (
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-800/50">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-4 items-start max-w-3xl">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center primary-glow shrink-0 border border-primary-fixed">
                <Bot className="h-5 w-5 text-on-primary" />
              </div>
              <div className="glass-card px-6 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse opacity-40"></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse opacity-70" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="shrink-0 pt-2">
          <form onSubmit={handleSubmit} className="glass-card p-2 rounded-2xl flex items-center gap-2 md:gap-4 border-primary/20">
            <div className="hidden sm:flex items-center gap-3 px-4 py-3 bg-surface-container-highest rounded-xl cursor-default transition-colors">
              <Shield className="h-5 w-5 text-tertiary" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant font-black">Protocols</span>
                <span className="text-[10px] font-bold text-tertiary">ENCRYPTED</span>
              </div>
              <div className="w-6 h-3 bg-tertiary/20 rounded-full relative ml-2">
                <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-tertiary rounded-full"></div>
              </div>
            </div>
            <input
              className="flex-1 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 focus:ring-0 text-sm font-body px-2 focus:outline-none"
              placeholder="Transcribe operational request..." 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-primary to-on-primary-container p-3 rounded-xl primary-glow active:scale-95 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-on-primary"
            >
              <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </form>
          <div className="text-center mt-3 text-[10px] text-on-surface-variant uppercase tracking-widest">
            M-Navy AI can make mistakes. Verify critical actions with your ship's official SMS manuals.
          </div>
        </div>
      </section>

      {/* Right Column: Fake Widget Panel Removed for MVP Simplicity */}
    </div>
  );
}
