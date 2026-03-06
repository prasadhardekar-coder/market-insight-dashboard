import { useState, useEffect } from "react";
import { fetchNews, NewsItem } from "@/services/newsApi";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsFeedProps {
  symbol: string;
}

const sentimentStyles = {
  positive: "bg-bullish/10 text-bullish border-bullish/20",
  neutral: "bg-neutral/10 text-neutral border-neutral/20",
  negative: "bg-bearish/10 text-bearish border-bearish/20",
};

export default function NewsFeed({ symbol }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchNews(symbol);
        if (!isMounted) return;
        setNews(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setNews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Financial News
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : news.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            No news available
          </div>
        ) : (
          news.map((item, index) => (
            <div
              key={item?.id ?? `${item?.headline}-${index}`}
              className="bg-secondary rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                  {item?.headline}
                </h4>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {item?.source}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {timeAgo(item?.timestamp)}
                </span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${
                    sentimentStyles[item?.sentiment ?? "neutral"]
                  }`}
                >
                  {item?.sentiment ?? "neutral"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}