const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export interface Prediction {
  direction: "Bullish" | "Bearish" | "Neutral";
  predictedPrice: number;
  currentPrice: number;
  confidence: number;
  factors: { text: string; positive: boolean }[];
  probability: { bullish: number; bearish: number; neutral: number };
}

function generateMockPrediction(symbol: string): Prediction {
  const prices: Record<string, number> = {
    AAPL: 178.5, TSLA: 249.2, NVDA: 892.4, RELIANCE: 2460, TCS: 3835,
  };
  const current = prices[symbol] || 100;
  const dirs: Prediction["direction"][] = ["Bullish", "Bearish", "Neutral"];
  const dir = dirs[Math.floor(Math.random() * 2)]; // bias toward bullish/bearish
  const change = dir === "Bullish" ? current * 0.03 : dir === "Bearish" ? -current * 0.02 : current * 0.002;

  return {
    direction: dir,
    predictedPrice: +(current + change).toFixed(2),
    currentPrice: current,
    confidence: Math.floor(Math.random() * 25) + 65,
    factors: [
      { text: "Positive news sentiment", positive: true },
      { text: "High trading volume", positive: true },
      { text: "Strong institutional buying", positive: true },
      { text: "Slight market volatility", positive: false },
      { text: "Sector rotation concerns", positive: false },
    ],
    probability: {
      bullish: Math.floor(Math.random() * 30) + 40,
      bearish: Math.floor(Math.random() * 20) + 10,
      neutral: Math.floor(Math.random() * 20) + 10,
    },
  };
}

export async function fetchPrediction(symbol: string): Promise<Prediction> {
  try {
    const res = await fetch(`${API_BASE}/predict/${symbol}`);
    if (res.ok) return res.json();
  } catch {}
  return generateMockPrediction(symbol);
}
