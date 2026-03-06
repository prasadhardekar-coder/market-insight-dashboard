import { useEffect, useState } from "react";
import { fetchSocial, SocialPost, SentimentSummary } from "@/services/socialApi";
import { MessageCircle, Twitter } from "lucide-react";

interface SocialFeedProps {
  symbol: string;
}

const sentimentStyles: Record<
  "positive" | "neutral" | "negative",
  string
> = {
  positive: "bg-bullish/10 text-bullish border-bullish/20",
  neutral: "bg-neutral/10 text-neutral border-neutral/20",
  negative: "bg-bearish/10 text-bearish border-bearish/20",
};

const defaultSummary: SentimentSummary = {
  positive: 0,
  neutral: 0,
  negative: 0,
};

export default function SocialFeed({ symbol }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [summary, setSummary] = useState<SentimentSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchSocial(symbol);
        if (!isMounted) return;

        setPosts(Array.isArray(data?.posts) ? data.posts : []);
        setSummary(data?.summary ?? defaultSummary);
      } catch {
        if (isMounted) {
          setPosts([]);
          setSummary(defaultSummary);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [symbol]);

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Social Sentiment
        </span>
      </div>

      {/* Summary */}
      <div className="bg-secondary rounded-lg p-3 mb-3">
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mb-2">
          <div className="bg-bullish" style={{ width: `${summary.positive}%` }} />
          <div className="bg-neutral" style={{ width: `${summary.neutral}%` }} />
          <div className="bg-bearish" style={{ width: `${summary.negative}%` }} />
        </div>

        <div className="flex justify-between text-xs font-mono">
          <span className="text-bullish">Positive {summary.positive}%</span>
          <span className="text-neutral">Neutral {summary.neutral}%</span>
          <span className="text-bearish">Negative {summary.negative}%</span>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            No social posts available
          </div>
        ) : (
          posts.map((post, index) => {
            const totalEngagement =
              (post?.engagement?.likes ?? 0) +
              (post?.engagement?.comments ?? 0);

            return (
              <div
                key={post?.id ?? `${post?.author}-${index}`}
                className="bg-secondary rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  {post?.platform === "Twitter" && (
                    <Twitter className="w-3 h-3 text-chart-accent" />
                  )}

                  <span className="text-xs text-muted-foreground font-mono ml-auto">
                    {totalEngagement.toLocaleString()} engagements
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-1">
                  {post?.content}
                </p>

                <div className="text-xs text-muted-foreground mb-2">
                  {post?.author}
                </div>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    sentimentStyles[post?.sentiment ?? "neutral"]
                  }`}
                >
                  {post?.sentiment ?? "neutral"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}