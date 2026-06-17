import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { useSensors } from "../lib/useSensors";
import { statusFromNoise, statusMeta } from "../lib/data";
import { Trophy, TrendingDown, TrendingUp, Award, Leaf } from "lucide-react";

export default function Rankings() {
  const { zones, avgNoise, avgCo2 } = useSensors(2500);
  const sorted = zones.slice().sort((a, b) => a.noise - b.noise);
  const quietest = sorted[0];
  const loudest = sorted[sorted.length - 1];

  // environmental score: lower noise + lower co2 = higher score
  const score = Math.max(0, Math.round(100 - (avgNoise - 50) * 1.2 - (avgCo2 - 450) / 12));

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Shell title="Rankings & Environmental Score" subtitle="Gamified airport monitoring">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tilt max={8}>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <TrendingDown className="h-6 w-6 text-emerald-600" />
            <p className="mt-3 text-sm text-emerald-700">Quietest Zone</p>
            <p className="text-2xl font-bold text-emerald-900">{quietest.name}</p>
            <p className="text-sm text-emerald-600">{quietest.noise} dB</p>
          </div>
        </Tilt>
        <Tilt max={8}>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <TrendingUp className="h-6 w-6 text-red-600" />
            <p className="mt-3 text-sm text-red-700">Most Affected Zone</p>
            <p className="text-2xl font-bold text-red-900">{loudest.name}</p>
            <p className="text-sm text-red-600">{loudest.noise} dB</p>
          </div>
        </Tilt>
        <Tilt max={8}>
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-[#202A36] to-[#2c3a4d] p-5 text-white">
            <Leaf className="h-6 w-6 text-emerald-300" />
            <p className="mt-3 text-sm text-slate-300">Daily Environmental Score</p>
            <p className="text-3xl font-bold">{score}<span className="text-lg text-slate-400">/100</span></p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${score}%` }} />
            </div>
          </div>
        </Tilt>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900">Zone Leaderboard (quietest first)</h3>
        </div>
        <div className="space-y-2">
          {sorted.map((z, i) => {
            const meta = statusMeta[statusFromNoise(z.noise)];
            return (
              <div key={z.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="w-8 text-center text-lg">{medals[i] || <span className="text-sm font-semibold text-gray-400">{i + 1}</span>}</span>
                <span className="flex-1 font-medium text-gray-800">{z.name}</span>
                <div className="hidden w-40 sm:block">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full" style={{ width: `${(z.noise / 120) * 100}%`, backgroundColor: meta.hex }} />
                  </div>
                </div>
                <span className="w-16 text-right font-semibold" style={{ color: meta.hex }}>{z.noise} dB</span>
                <Award className="h-4 w-4 text-slate-300" />
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
