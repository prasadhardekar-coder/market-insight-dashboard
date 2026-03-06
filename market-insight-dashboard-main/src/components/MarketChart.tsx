import { useEffect, useRef } from "react";

interface Props {
  symbol: string;
  onSymbolChange: (symbol: string) => void;
}

export default function MarketChart({ symbol, onSymbolChange }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      new (window as any).TradingView.widget({
        width: "100%",
        height: 500,
        symbol: `NASDAQ:${symbol}`,
        interval: "5",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        container_id: "tradingview_chart"
      });
    };

    document.body.appendChild(script);
  }, [symbol]);

  return (
    <div className="bg-card p-4 rounded-lg border border-border">
      
      {/* Stock selector */}
      <div className="mb-4">
        <select
          className="bg-background border border-border px-3 py-2 rounded"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
        >
          <option value="AAPL">Apple</option>
          <option value="TSLA">Tesla</option>
          <option value="MSFT">Microsoft</option>
          <option value="GOOGL">Google</option>
          <option value="NVDA">Nvidia</option>
        </select>
      </div>

      {/* TradingView chart */}
      <div id="tradingview_chart" ref={chartRef}></div>

    </div>
  );
}