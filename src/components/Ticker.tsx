import { tickerEvents } from "../lib/advanced";
import { Zap } from "lucide-react";

export default function Ticker() {
  const items = [...tickerEvents, ...tickerEvents];
  return (
    <div className="relative overflow-hidden border-y border-slate-200 bg-[#202A36] text-white">
      <div className="flex items-center gap-2 px-4 py-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-sky-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
          <Zap className="h-3 w-3" /> Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap">
            {items.map((t, i) => (
              <span key={i} className="text-slate-300">• {t}</span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
