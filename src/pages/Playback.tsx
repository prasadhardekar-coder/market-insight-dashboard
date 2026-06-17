import { useEffect, useMemo, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import Shell from "../components/Shell";
import { genHourly, statusFromNoise, statusMeta } from "../lib/data";
import { Play, Pause, RotateCcw, History, Calendar } from "lucide-react";

export default function Playback() {
  const [date, setDate] = useState("2026-03-27");
  const data = useMemo(() => genHourly(date.length), [date]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (playing) {
      timer.current = window.setInterval(() => {
        setIdx((i) => {
          if (i >= data.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 400);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, data.length]);

  const current = data[idx];
  const meta = statusMeta[statusFromNoise(current.noise)];
  const visible = data.slice(0, idx + 1);

  return (
    <Shell title="Historical Data Playback" subtitle="Replay any day's airport noise activity hour by hour">
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-sky-500" />
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setIdx(0); setPlaying(false); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setPlaying((p) => !p)} className="flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause" : "Play"}
          </button>
          <button onClick={() => { setIdx(0); setPlaying(false); }} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-slate-50">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <History className="h-4 w-4" /> <span className="text-sm">Replaying</span>
          </div>
          <p className="mt-3 text-sm font-medium text-gray-800">{current.hour}</p>
          <p className="mt-2 text-5xl font-bold" style={{ color: meta.hex }}>{current.noise}</p>
          <p className="text-sm text-gray-400">dB · {meta.label}</p>
          <p className="mt-4 text-xs text-gray-500">CO₂ {current.co2} ppm</p>
        </div>

        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Noise Timeline — {date}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visible}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Danger", fontSize: 10, fill: "#ef4444" }} />
                <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="noise" stroke="#0ea5e9" fill="url(#gp)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Shell>
  );
}
