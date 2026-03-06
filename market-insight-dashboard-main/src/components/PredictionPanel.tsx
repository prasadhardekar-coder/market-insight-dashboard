import { useState, useEffect } from "react";
import { fetchPrediction } from "../services/predictionApi";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
} from "lucide-react";

type Direction = "Bullish" | "Bearish" | "Neutral";

interface PredictionResponse {
  direction?: Direction;
  predicted_price?: number;
  confidence?: number;
  key_factors?: string[];
}

interface PredictionPanelProps {
  symbol: string;
}

const dirConfig = {
  Bullish: {
    color: "text-bullish",
    bg: "bg-bullish/10",
    icon: TrendingUp,
  },
  Bearish: {
    color: "text-bearish",
    bg: "bg-bearish/10",
    icon: TrendingDown,
  },
  Neutral: {
    color: "text-neutral",
    bg: "bg-neutral/10",
    icon: Minus,
  },
} as const;

export default function PredictionPanel({
  symbol,
}: PredictionPanelProps) {
  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      try {
        const data = await fetchPrediction(symbol);
        if (!ignore) setPrediction(data ?? null);
      } catch {
        if (!ignore) {
          setError(true);
          setPrediction(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="glass-card p-4 h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="glass-card p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          Unable to load prediction data
        </p>
      </div>
    );
  }

  // Safe fallback values
  const direction: Direction = prediction.direction ?? "Neutral";
  const predictedPrice = prediction.predicted_price ?? 0;
  const confidence = prediction.confidence ?? 0;
  const keyFactors = prediction.key_factors ?? [];

  const cfg = dirConfig[direction];
  const Icon = cfg.icon;

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          AI Prediction
        </span>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {symbol}
        </span>
      </div>

      {/* Direction */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-lg ${cfg.bg}`}>
          <Icon className={`w-8 h-8 ${cfg.color}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${cfg.color}`}>
            {direction}
          </div>
          <div className="text-sm text-muted-foreground">
            AI Market Direction
          </div>
        </div>
      </div>

      {/* Predicted Price */}
      <div className="bg-secondary rounded-lg p-4 mb-4">
        <div className="text-xs text-muted-foreground mb-1">
          Predicted Price
        </div>
        <div className="font-mono text-2xl font-bold">
          ${predictedPrice.toFixed(2)}
        </div>
      </div>

      {/* Confidence */}
      <div className="bg-secondary rounded-lg p-4 mb-4">
        <div className="text-xs text-muted-foreground mb-2">
          Confidence
        </div>
        <div className="font-mono text-lg font-bold mb-2">
          {confidence}%
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(Math.max(confidence, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Key Factors */}
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-2">
          Key Influences
        </div>
        <div className="space-y-2">
          {keyFactors.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No factors available
            </div>
          ) : (
            keyFactors.map((factor, i) => (
              <div key={i} className="text-sm text-secondary-foreground">
                • {factor}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}