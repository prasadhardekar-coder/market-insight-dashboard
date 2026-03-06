const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  sentiment: "positive" | "neutral" | "negative";
  url?: string;
}

const mockHeadlines: { headline: string; source: string; sentiment: NewsItem["sentiment"] }[] = [
  { headline: "Tech stocks rally as AI demand surges", source: "Bloomberg", sentiment: "positive" },
  { headline: "Federal Reserve signals potential rate cuts", source: "Reuters", sentiment: "positive" },
  { headline: "Market volatility increases amid geopolitical tensions", source: "CNBC", sentiment: "negative" },
  { headline: "Quarterly earnings beat expectations across sectors", source: "WSJ", sentiment: "positive" },
  { headline: "Regulatory concerns weigh on semiconductor sector", source: "FT", sentiment: "negative" },
  { headline: "New trade agreements boost market confidence", source: "Bloomberg", sentiment: "positive" },
  { headline: "Oil prices stabilize after recent decline", source: "Reuters", sentiment: "neutral" },
  { headline: "Tech layoffs continue but hiring in AI accelerates", source: "TechCrunch", sentiment: "neutral" },
  { headline: "Record high consumer spending reported", source: "CNBC", sentiment: "positive" },
  { headline: "Supply chain disruptions ease globally", source: "WSJ", sentiment: "positive" },
];

function generateMockNews(): NewsItem[] {
  return mockHeadlines.map((item, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i * 2);
    return { ...item, id: `news-${i}`, timestamp: date.toISOString() };
  });
}

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE}/news/${symbol}`);
    if (res.ok) return res.json();
  } catch {}
  return generateMockNews();
}
