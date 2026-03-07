const BASE_URL = "http://127.0.0.1:8000";

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  impact: string;
}

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const res = await fetch(`${BASE_URL}/news/${symbol}`);

  if (!res.ok) throw new Error(`News fetch failed: ${res.status}`);

  const data = await res.json();

  // Backend returns { symbol, articles: [...] }
  const articles = Array.isArray(data.articles) ? data.articles : [];

  return articles.map((item: any, index: number): NewsItem => ({
    id: `${symbol}-news-${index}`,
    headline: item.headline ?? "No headline",
    summary: item.summary ?? "",
    source: item.category ?? "Financial News",
    timestamp: item.published_at ?? new Date().toISOString(),
    sentiment: normalizeImpact(item.impact),
    category: item.category ?? "General",
    impact: item.impact ?? "Neutral",
  }));
}

function normalizeImpact(impact: string): "positive" | "neutral" | "negative" {
  if (!impact) return "neutral";
  const lower = impact.toLowerCase();
  if (lower === "positive") return "positive";
  if (lower === "negative") return "negative";
  return "neutral";
}






