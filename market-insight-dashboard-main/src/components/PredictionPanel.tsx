import { useState, useEffect } from "react";
import { fetchPrediction, Prediction } from "@/services/predictionApi";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";

interface PredictionPanelProps {
  symbol: string;
}

export default function PredictionPanel({ symbol }: PredictionPanelProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPrediction(symbol).then((p) => {
      setPrediction(p);
      setLoading(false);
    });
  }, [symbol]);

  if (loading || !prediction) {
    return (
      <div className="glass-card p-4 h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dirConfig = {
    Bullish: { color: "text-bullish", bg: "bg-bullish/10", glow: "glow-green", icon: TrendingUp },
    Bearish: { color: "text-bearish", bg: "bg-bearish/10", glow: "glow-red", icon: TrendingDown },
    Neutral: { color: "text-neutral", bg: "bg-neutral/10", glow: "glow-blue", icon: Minus },
  };

  const cfg = dirConfig[prediction.direction];
  const Icon = cfg.icon;
  const priceChange = prediction.predictedPrice - prediction.currentPrice;
  const pctChange = ((priceChange / prediction.currentPrice) * 100).toFixed(2);

  return (
    <div className={`glass-card p-4 h-full flex flex-col ${cfg.glow}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Prediction</span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{symbol}</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${cfg.bg}`}>
          <Icon className={`w-8 h-8 ${cfg.color}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${cfg.color}`}>{prediction.direction}</div>
          <div className="text-sm text-muted-foreground">AI Consensus Direction</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Predicted Price</div>
          <div className="font-mono text-lg font-bold">${prediction.predictedPrice.toFixed(2)}</div>
          <div className={`flex items-center text-xs font-mono ${priceChange >= 0 ? "text-bullish" : "text-bearish"}`}>
            {priceChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {priceChange >= 0 ? "+" : ""}{pctChange}%
          </div>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Confidence</div>
          <div className="font-mono text-lg font-bold">{prediction.confidence}%</div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full transition-all ${cfg.bg.replace("/10", "")}`}
              style={{ width: `${prediction.confidence}%`, backgroundColor: prediction.direction === "Bullish" ? "hsl(142 70% 45%)" : prediction.direction === "Bearish" ? "hsl(0 72% 51%)" : "hsl(45 93% 47%)" }}
            />
          </div>
        </div>
      </div>

      {/* Probability gauges */}
      <div className="bg-secondary rounded-lg p-3 mb-4">
        <div className="text-xs text-muted-foreground mb-2">Probability Distribution</div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-bullish transition-all" style={{ width: `${prediction.probability.bullish}%` }} />
          <div className="bg-neutral transition-all" style={{ width: `${prediction.probability.neutral}%` }} />
          <div className="bg-bearish transition-all" style={{ width: `${prediction.probability.bearish}%` }} />
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-bullish">Bull {prediction.probability.bullish}%</span>
          <span className="text-neutral">Neutral {prediction.probability.neutral}%</span>
          <span className="text-bearish">Bear {prediction.probability.bearish}%</span>
        </div>
      </div>

      {/* Key factors */}
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-2">Key Influences</div>
        <div className="space-y-1.5">
          {prediction.factors.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={`text-xs font-bold ${f.positive ? "text-bullish" : "text-bearish"}`}>
                {f.positive ? "+" : "−"}
              </span>
              <span className="text-secondary-foreground">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
