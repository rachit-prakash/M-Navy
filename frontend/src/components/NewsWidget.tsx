"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, Loader2 } from "lucide-react";

interface NewsArticle {
  title: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note to User: To use a LIVE API, replace this mock function with a fetch call.
    // Recommended free APIs:
    // 1. GNews.io (Free tier allows 100 requests/day): https://gnews.io/
    //    fetch(`https://gnews.io/api/v4/search?q=maritime+OR+navy&lang=en&apikey=YOUR_API_KEY`)
    // 2. NewsAPI.org (Free for development/localhost): https://newsapi.org/
    //    fetch(`https://newsapi.org/v2/everything?q="merchant navy" OR maritime&apiKey=YOUR_API_KEY`)

    const fetchNews = async () => {
      // Simulating API call for demonstration
      setTimeout(() => {
        setNews([
          {
            title: "IMO Adopts New Regulations on Maritime Autonomous Surface Ships (MASS)",
            url: "https://www.imo.org/",
            source: { name: "Maritime Executive" },
            publishedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            title: "Global Supply Chains Stabilize as Red Sea Rerouting Becomes the New Normal",
            url: "#",
            source: { name: "Shipping Watch" },
            publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            title: "Breakthrough in Alternative Zero-Carbon Fuels for Ultra Large Container Vessels",
            url: "#",
            source: { name: "Lloyd's List" },
            publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          }
        ]);
        setLoading(false);
      }, 1500);
    };

    fetchNews();
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col h-full border-t-4 border-t-primary">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline text-sm font-bold tracking-wider uppercase text-on-surface flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          Maritime Intel Feed
        </h3>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant h-full">
            <Loader2 className="h-6 w-6 animate-spin mb-2" />
            <span className="text-xs uppercase tracking-widest">Intercepting signals...</span>
          </div>
        ) : (
          news.map((item, idx) => (
            <a 
              key={idx} 
              href={item.url} 
              target="_blank" 
              rel="noreferrer"
              className="block p-3 bg-surface-container-highest hover:bg-surface-bright rounded-xl border border-outline-variant/10 transition-colors group cursor-pointer"
            >
              <h4 className="text-xs font-semibold text-on-surface line-clamp-2 leading-relaxed mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                <span>{item.source.name}</span>
                <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Read</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-outline-variant/10 text-center">
        <p className="text-[9px] text-on-surface-variant/70 uppercase tracking-widest font-mono">
          Powered by GNews API (Mocked for Dev)
        </p>
      </div>
    </div>
  );
}
