import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Bar } from "recharts";
import { fetchMarketData, MarketData } from "@/services/marketApi";
import { TrendingUp, Activity } from "lucide-react";

const TIMEFRAMES = ["1m", "5m", "1h", "1d", "1w"];

interface MarketChartProps {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

const SYMBOLS = ["AAPL", "TSLA", "NVDA", "RELIANCE", "TCS"];

export default function MarketChart({ symbol, onSymbolChange }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState("1d");
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMarketData(symbol, timeframe).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [symbol, timeframe]);

  const lastPrice = data[data.length - 1]?.close ?? 0;
  const firstPrice = data[0]?.close ?? 0;
  const change = lastPrice - firstPrice;
  const changePct = firstPrice ? ((change / firstPrice) * 100).toFixed(2) : "0";
  const isUp = change >= 0;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    if (timeframe === "1d" || timeframe === "1w") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Market</span>
          </div>
          <Select value={symbol} onValueChange={onSymbolChange}>
            <SelectTrigger className="w-[130px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold">${lastPrice.toFixed(2)}</span>
          <span className={`font-mono text-sm font-semibold ${isUp ? "text-bullish" : "text-bearish"}`}>
            {isUp ? "+" : ""}{change.toFixed(2)} ({changePct}%)
          </span>
          <div className={`w-2 h-2 rounded-full pulse-dot ${isUp ? "bg-bullish" : "bg-bearish"}`} />
        </div>

        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                timeframe === tf
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="hsl(215 15% 40%)"
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="hsl(215 15% 40%)"
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 12%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: 12,
                }}
                labelFormatter={formatTime}
              />
              <Bar dataKey="volume" fill="hsl(262 60% 50% / 0.2)" yAxisId="volume" />
              <YAxis yAxisId="volume" orientation="right" hide />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isUp ? "hsl(142 70% 45%)" : "hsl(0 72% 51%)"}
                fill={isUp ? "hsl(142 70% 45% / 0.08)" : "hsl(0 72% 51% / 0.08)"}
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="ma20" stroke="hsl(199 89% 48%)" strokeWidth={1} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="predicted" stroke="hsl(45 93% 47%)" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-bullish inline-block" /> Price</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-chart-accent inline-block border-dashed" /> MA20</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-neutral inline-block" /> AI Predicted</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-chart-volume/20 inline-block rounded-sm" /> Volume</span>
      </div>
    </div>
  );
}
