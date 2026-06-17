import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { genAnomalies, type Anomaly } from "../lib/advanced";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from "recharts";
import { Cpu, AlertCircle, ShieldAlert, Sparkles, Brain } from "lucide-react";

const sev: Record<Anomaly["severity"], { color: string; bg: string; text: string; label: string }> = {
  low:    { color: "#0ea5e9", bg: "bg-sky-50",   text: "text-sky-700",   label: "Low" },
  medium: { color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700", label: "Medium" },
  high:   { color: "#ef4444", bg: "bg-red-50",   text: "text-red-700",   label: "High" },
};

export default function Anomalies() {
  const [list, setList] = useState<Anomaly[]>(() => genAnomalies());

  useEffect(() => {
    const t = setInterval(() => setList(genAnomalies()), 7000);
    return () => clearInterval(t);
  }, []);

  const points = list.map((a, i) => ({ x: i, y: a.value, z: Math.abs(a.zScore) * 8, name: a.zone, severity: a.severity }));

  return (
    <Shell title="AI Anomaly Detection" subtitle="Unsupervised model flags acoustic outliers using rolling z-score">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-500 text-white"><Brain className="h-6 w-6" /></span>
        <div>
          <p className="font-semibold text-gray-900">Anomaly Engine — Rolling Z-Score</p>
          <p className="text-sm text-gray-500">
            We compare each zone's live reading against its 60-minute rolling baseline. Deviations beyond 2.5σ are auto-flagged for review.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Tilt><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Cpu className="h-5 w-5 text-violet-500" />
          <p className="mt-3 text-2xl font-bold text-gray-900">{list.length}</p>
          <p className="text-sm text-gray-500">Active anomalies</p>
        </div></Tilt>
        <Tilt><div className="rounded-2xl border border-slate-200 bg-red-50 p-5">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <p className="mt-3 text-2xl font-bold text-red-700">{list.filter((a) => a.severity === "high").length}</p>
          <p className="text-sm text-red-600">High severity</p>
        </div></Tilt>
        <Tilt><div className="rounded-2xl border border-slate-200 bg-amber-50 p-5">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <p className="mt-3 text-2xl font-bold text-amber-700">{list.filter((a) => a.severity === "medium").length}</p>
          <p className="text-sm text-amber-600">Medium severity</p>
        </div></Tilt>
        <Tilt><div className="rounded-2xl border border-slate-200 bg-emerald-50 p-5">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <p className="mt-3 text-2xl font-bold text-emerald-700">94%</p>
          <p className="text-sm text-emerald-600">Model confidence</p>
        </div></Tilt>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Outlier Map (live)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="x" name="event" tick={{ fontSize: 11 }} />
                <YAxis dataKey="y" name="dB" domain={[40, 130]} tick={{ fontSize: 11 }} />
                <ZAxis dataKey="z" range={[80, 400]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceArea y1={90} y2={130} fill="#fee2e2" fillOpacity={0.4} />
                <ReferenceArea y1={70} y2={90}  fill="#fef3c7" fillOpacity={0.4} />
                {(["low","medium","high"] as const).map((s) => (
                  <Scatter key={s} name={s} data={points.filter((p) => p.severity === s)} fill={sev[s].color} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Flagged events</h3>
          {list.map((a) => {
            const s = sev[a.severity];
            return (
              <div key={a.id} className={`rounded-2xl border border-slate-200 ${s.bg} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{a.zone}</p>
                    <p className="text-xs text-gray-500">{a.id} · {a.time}</p>
                  </div>
                  <span className={`rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase ${s.text}`}>{s.label}</span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{a.reason}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                  <span>Value: <strong>{a.value} dB</strong></span>
                  <span>Baseline: {a.baseline} dB</span>
                  <span>z = {a.zScore}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
