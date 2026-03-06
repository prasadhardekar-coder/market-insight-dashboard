const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export interface SocialPost {
  id: string;
  content: string;
  platform: "Twitter" | "Reddit";
  sentiment: "positive" | "neutral" | "negative";
  engagement: { likes: number; comments: number };
  timestamp: string;
  author: string;
}

export interface SentimentSummary {
  positive: number;
  neutral: number;
  negative: number;
}

const mockPosts: Omit<SocialPost, "id" | "timestamp">[] = [
  { content: "Just loaded up on more shares. The AI catalyst is real! 🚀", platform: "Twitter", sentiment: "positive", engagement: { likes: 342, comments: 45 }, author: "@TechTrader99" },
  { content: "Earnings report looking solid. Holding long.", platform: "Reddit", sentiment: "positive", engagement: { likes: 1205, comments: 189 }, author: "u/WallStBets" },
  { content: "Worried about the valuation at these levels tbh", platform: "Twitter", sentiment: "negative", engagement: { likes: 87, comments: 23 }, author: "@BearishAnalyst" },
  { content: "Charts showing a classic breakout pattern 📈", platform: "Twitter", sentiment: "positive", engagement: { likes: 567, comments: 78 }, author: "@ChartMaster" },
  { content: "Mixed signals from the options flow today", platform: "Reddit", sentiment: "neutral", engagement: { likes: 445, comments: 92 }, author: "u/OptionsFlow" },
  { content: "This is going to $0. Total bubble.", platform: "Twitter", sentiment: "negative", engagement: { likes: 23, comments: 156 }, author: "@DoomGloom" },
  { content: "Institutional investors increasing positions significantly", platform: "Reddit", sentiment: "positive", engagement: { likes: 892, comments: 134 }, author: "u/SmartMoney" },
  { content: "Volume is insane today. Something is brewing.", platform: "Twitter", sentiment: "positive", engagement: { likes: 234, comments: 67 }, author: "@VolumeWatch" },
];

function generateMockSocial(): { posts: SocialPost[]; summary: SentimentSummary } {
  const posts = mockPosts.map((p, i) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - i * 37);
    return { ...p, id: `social-${i}`, timestamp: date.toISOString() };
  });
  return { posts, summary: { positive: 63, neutral: 16, negative: 21 } };
}

export async function fetchSocial(symbol: string): Promise<{ posts: SocialPost[]; summary: SentimentSummary }> {
  try {
    const res = await fetch(`${API_BASE}/social/${symbol}`);
    if (res.ok) return res.json();
  } catch {}
  return generateMockSocial();
}
