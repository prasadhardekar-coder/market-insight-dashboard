import { useState, useEffect } from "react";
import { fetchSocial, SocialPost, SentimentSummary } from "@/services/socialApi";
import { MessageCircle, Heart, MessageSquare, Twitter } from "lucide-react";

interface SocialFeedProps {
  symbol: string;
}

const sentimentStyles = {
  positive: "bg-bullish/10 text-bullish border-bullish/20",
  neutral: "bg-neutral/10 text-neutral border-neutral/20",
  negative: "bg-bearish/10 text-bearish border-bearish/20",
};

export default function SocialFeed({ symbol }: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [summary, setSummary] = useState<SentimentSummary>({ positive: 0, neutral: 0, negative: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSocial(symbol).then((d) => {
      setPosts(d.posts);
      setSummary(d.summary);
      setLoading(false);
    });
  }, [symbol]);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social Sentiment</span>
      </div>

      {/* Summary bar */}
      <div className="bg-secondary rounded-lg p-3 mb-3">
        <div className="flex gap-1 h-2.5 rounded-full overflow-hidden mb-2">
          <div className="bg-bullish transition-all" style={{ width: `${summary.positive}%` }} />
          <div className="bg-neutral transition-all" style={{ width: `${summary.neutral}%` }} />
          <div className="bg-bearish transition-all" style={{ width: `${summary.negative}%` }} />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-bullish">Positive {summary.positive}%</span>
          <span className="text-neutral">Neutral {summary.neutral}%</span>
          <span className="text-bearish">Negative {summary.negative}%</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-secondary rounded-lg p-3 animate-slide-up">
              <div className="flex items-center gap-2 mb-1.5">
                {post.platform === "Twitter" ? (
                  <Twitter className="w-3 h-3 text-chart-accent" />
                ) : (
                  <MessageSquare className="w-3 h-3 text-bearish" />
                )}
                <span className="text-xs font-medium text-muted-foreground">{post.author}</span>
                <span className="text-xs text-muted-foreground font-mono ml-auto">{timeAgo(post.timestamp)}</span>
              </div>
              <p className="text-sm leading-relaxed mb-2">{post.content}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" /> {post.engagement.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3 h-3" /> {post.engagement.comments}
                </span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${sentimentStyles[post.sentiment]}`}>
                  {post.sentiment}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
