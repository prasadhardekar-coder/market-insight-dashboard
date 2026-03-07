const BASE_URL = "http://127.0.0.1:8000";

export interface SocialPost {
  id: string;
  author: string;
  content: string;
  platform: string;
  sentiment: "positive" | "neutral" | "negative";
  engagement: {
    likes: number;
    comments: number;
  };
  timestamp: string;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SocialData {
  posts: SocialPost[];
  summary: SentimentSummary;
}

export async function fetchSocial(symbol: string): Promise<SocialData> {
  const res = await fetch(`${BASE_URL}/social/${symbol}`);

  if (!res.ok) throw new Error(`Social fetch failed: ${res.status}`);

  const data = await res.json();

  // Backend returns agent data: { overall_sentiment, positive_percentage,
  // neutral_percentage, negative_percentage, key_topics, summary, posts }
  const summary: SentimentSummary = {
    positive: data.positive_percentage ?? 0,
    neutral: data.neutral_percentage ?? 0,
    negative: data.negative_percentage ?? 0,
  };

  const posts: SocialPost[] = Array.isArray(data.posts)
    ? data.posts.map((p: any, i: number): SocialPost => ({
        id: `${symbol}-post-${i}`,
        author: p.author ?? "Anonymous",
        content: p.content ?? p.text ?? "",
        platform: p.platform ?? "Twitter",
        sentiment: normalizeSentiment(p.sentiment),
        engagement: {
          likes: p.engagement?.likes ?? p.likes ?? 0,
          comments: p.engagement?.comments ?? p.comments ?? 0,
        },
        timestamp: p.timestamp ?? new Date().toISOString(),
      }))
    : buildPostsFromTopics(data.key_topics ?? [], data.overall_sentiment, symbol);

  return { posts, summary };
}

function normalizeSentiment(s: string): "positive" | "neutral" | "negative" {
  if (!s) return "neutral";
  const lower = s.toLowerCase();
  if (lower.includes("positive")) return "positive";
  if (lower.includes("negative")) return "negative";
  return "neutral";
}

// Fallback: if no posts array, build synthetic posts from key_topics
function buildPostsFromTopics(
  topics: string[],
  overallSentiment: string,
  symbol: string
): SocialPost[] {
  return topics.map((topic: string, i: number): SocialPost => ({
    id: `${symbol}-topic-${i}`,
    author: `@${symbol.toLowerCase()}_analyst`,
    content: topic,
    platform: "Twitter",
    sentiment: normalizeSentiment(overallSentiment),
    engagement: { likes: Math.floor(Math.random() * 500), comments: Math.floor(Math.random() * 50) },
    timestamp: new Date().toISOString(),
  }));
}






