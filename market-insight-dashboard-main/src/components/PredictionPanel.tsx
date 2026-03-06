import { useEffect, useState } from "react";

interface PredictionData {
  direction: string;
  predicted_price: number;
  confidence: number;
}

interface Props {
  symbol: string;
}

export default function PredictionPanel({ symbol }: Props) {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Prediction
  useEffect(() => {
    fetchPrediction();
  }, [symbol]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://127.0.0.1:8000/predict/${symbol}`
      );

      if (!res.ok) throw new Error("Prediction failed");

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError("Failed to load prediction");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadReport = async () => {
    try {
      setDownloading(true);

      const res = await fetch(
        `http://127.0.0.1:8000/download-report/${symbol}`
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${symbol}_AI_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Report generation failed");
    } finally {
      setDownloading(false);
    }
  };

  const getDirectionColor = () => {
    if (!data) return "";
    if (data.direction === "Bullish") return "text-green-500";
    if (data.direction === "Bearish") return "text-red-500";
    return "text-yellow-400";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          🤖 AI Prediction Engine
        </h2>

        {loading && (
          <p className="text-muted-foreground">Generating prediction...</p>
        )}

        {error && (
          <p className="text-red-500">{error}</p>
        )}

        {data && !loading && (
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">
                Predicted Direction
              </span>
              <p className={`text-xl font-bold ${getDirectionColor()}`}>
                {data.direction}
              </p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">
                Predicted Price
              </span>
              <p className="text-lg font-semibold">
                ${data.predicted_price}
              </p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">
                Model Confidence
              </span>
              <p className="text-lg font-semibold">
                {data.confidence}%
              </p>

              {/* Confidence bar */}
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${data.confidence}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={downloadReport}
        disabled={!data || downloading}
        className="mt-6 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
      >
        {downloading ? "Generating Report..." : "📄 Download Detailed Report"}
      </button>
    </div>
  );
}