const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export interface MarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20: number;
  predicted: number;
}

// Mock data generator
function generateMockMarketData(symbol: string, timeframe: string): MarketData[] {
  const basePrice: Record<string, number> = {
    AAPL: 178, TSLA: 248, NVDA: 890,  GOOGL: 142.3, MSFT: 415.8     
  };
  const base = basePrice[symbol] || 100;
  const count = timeframe === "1m" ? 60 : timeframe === "5m" ? 48 : timeframe === "1h" ? 24 : timeframe === "1d" ? 30 : 12;
  const data: MarketData[] = [];
  let price = base;

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * (base * 0.02);
    price += change;
    const high = price + Math.random() * (base * 0.01);
    const low = price - Math.random() * (base * 0.01);
    const open = price - change * 0.5;
    const ma20 = price + (Math.random() - 0.5) * (base * 0.005);
    const predicted = price + (Math.random() - 0.3) * (base * 0.015);

    const date = new Date();
    if (timeframe === "1d") date.setDate(date.getDate() - (count - i));
    else if (timeframe === "1w") date.setDate(date.getDate() - (count - i) * 7);
    else date.setMinutes(date.getMinutes() - (count - i) * (timeframe === "1m" ? 1 : timeframe === "5m" ? 5 : 60));

    data.push({
      timestamp: date.toISOString(),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +price.toFixed(2),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      ma20: +ma20.toFixed(2),
      predicted: +predicted.toFixed(2),
    });
  }
  return data;
}

export async function fetchMarketData(symbol: string, timeframe: string = "1d"): Promise<MarketData[]> {
  try {
    const res = await fetch(`${API_BASE}/market/${symbol}?timeframe=${timeframe}`);
    if (res.ok) return res.json();
  } catch {}
  return generateMockMarketData(symbol, timeframe);
}
