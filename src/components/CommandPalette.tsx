import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import {
  Search, LayoutDashboard, Map, BrainCircuit, MessageSquareWarning, BarChart3,
  HeartPulse, History, Trophy, Cloud, Cpu, Box,
} from "lucide-react";

const cmds = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Live Heatmap", path: "/heatmap", icon: Map },
  { label: "AI Prediction", path: "/ai", icon: BrainCircuit },
  { label: "Complaints", path: "/complaints", icon: MessageSquareWarning },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Health Engine", path: "/health", icon: HeartPulse },
  { label: "Historical Playback", path: "/playback", icon: History },
  { label: "Rankings", path: "/rankings", icon: Trophy },
  { label: "3D Airport Digital Twin", path: "/twin", icon: Box },
  { label: "Weather & Wind Impact", path: "/weather", icon: Cloud },
  { label: "AI Anomaly Detection", path: "/anomalies", icon: Cpu },
];

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return cmds.filter((c) => c.label.toLowerCase().includes(s));
  }, [q]);

  useEffect(() => { setIdx(0); }, [q, paletteOpen]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaletteOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(filtered.length - 1, i + 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
      if (e.key === "Enter" && filtered[idx]) { nav(filtered[idx].path); setPaletteOpen(false); setQ(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, filtered, idx, nav, setPaletteOpen]);

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm" onClick={() => setPaletteOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to anywhere…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">ESC</kbd>
        </div>
        <div className="scrollbar-thin max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">No results</p>}
          {filtered.map((c, i) => {
            const Icon = c.icon;
            const active = i === idx;
            return (
              <button
                key={c.path}
                onMouseEnter={() => setIdx(i)}
                onClick={() => { nav(c.path); setPaletteOpen(false); setQ(""); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${active ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{c.label}</span>
                <span className="text-xs text-slate-400">{c.path}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
          <span>↑ ↓ navigate · ↵ open</span>
          <span>⌘ K to toggle</span>
        </div>
      </div>
    </div>
  );
}
