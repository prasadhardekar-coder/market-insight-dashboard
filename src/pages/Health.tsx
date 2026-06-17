import { useState } from "react";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { healthRecommendation } from "../lib/data";
import { speak } from "../lib/speak";
import { HeartPulse, Volume2, ShieldCheck, Clock, Volume1 } from "lucide-react";

const whoTable = [
  { range: "30–50 dB", level: "Safe", rec: "No protection needed", color: "#10b981" },
  { range: "55–70 dB", level: "Acceptable", rec: "Comfortable for most activities", color: "#84cc16" },
  { range: "70–85 dB", level: "Caution", rec: "Avoid prolonged exposure", color: "#f59e0b" },
  { range: "85–100 dB", level: "Avoid Long Exposure", rec: "Hearing protection required", color: "#f97316" },
  { range: "100+ dB", level: "Hearing Risk", rec: "Immediate damage risk", color: "#ef4444" },
];

export default function Health() {
  const [db, setDb] = useState(72);
  const r = healthRecommendation(db);

  return (
    <Shell title="Health Recommendation Engine" subtitle="WHO-based exposure guidance for staff & residents">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Tilt max={5}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-gray-900">
              <Volume2 className="h-5 w-5 text-sky-500" /> <span className="font-semibold">Noise Level Simulator</span>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold" style={{ color: r.color.includes("emerald") ? "#10b981" : undefined }}>
                <span className={r.color}>{db}</span> <span className="text-2xl text-gray-400">dB</span>
              </p>
            </div>
            <input
              type="range" min={30} max={120} value={db}
              onChange={(e) => setDb(Number(e.target.value))}
              className="mt-6 w-full accent-sky-500"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>30</span><span>75</span><span>120</span>
            </div>
            <button
              onClick={() => speak(`At ${db} decibels, the status is ${r.level}. ${r.advice}`)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              <Volume1 className="h-4 w-4" /> Read recommendation aloud
            </button>
          </div>
        </Tilt>

        <Tilt max={5}>
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-gradient-to-br from-[#202A36] to-[#2c3a4d] p-6 text-white">
            <div className="flex items-center gap-2 text-sky-300">
              <HeartPulse className="h-5 w-5" /> <span className="font-semibold">Personalised Recommendation</span>
            </div>
            <p className="mt-6 text-3xl font-bold">{r.level}</p>
            <p className="mt-3 text-slate-300">{r.advice}</p>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
              <div className="rounded-xl bg-white/10 p-4">
                <Clock className="mb-2 h-5 w-5 text-sky-300" />
                <p className="text-xs text-slate-300">Safe Exposure</p>
                <p className="font-semibold">{r.exposure}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <ShieldCheck className="mb-2 h-5 w-5 text-emerald-300" />
                <p className="text-xs text-slate-300">PPE</p>
                <p className="font-semibold">{db >= 85 ? "Required" : "Optional"}</p>
              </div>
            </div>
          </div>
        </Tilt>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">WHO Noise Exposure Guidelines</h3>
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Noise Level</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {whoTable.map((row) => (
                <tr key={row.range} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.range}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: row.color }}>{row.level}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
