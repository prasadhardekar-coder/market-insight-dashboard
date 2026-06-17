import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { useSensors } from "../lib/useSensors";
import { predictNoise, statusFromNoise, statusMeta, genHourly } from "../lib/data";
import { BrainCircuit, TrendingUp, Sparkles, Plane } from "lucide-react";

export default function AIPredict() {
  const { zones } = useSensors(3000);
  const [preds, setPreds] = useState(predictNoise(zones));
  const [forecast, setForecast] = useState<{ t: string; actual: number; predicted: number }[]>([]);

  useEffect(() => {
    setPreds(predictNoise(zones));
    setForecast((f) => {
      const next = [
        ...f,
        {
          t: new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
          actual: Math.round(Math.max(...zones.map((z) => z.noise))),
          predicted: Math.round(Math.max(...zones.map((z) => z.noise)) + (Math.random() * 12 - 4)),
        },
      ];
      return next.slice(-14);
    });
  }, [zones]);

  const hourly = genHourly(2);

  return (
    <Shell title="AI Noise Prediction" subtitle="Future-ready predictive environmental monitoring">
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-500 text-white">
          <Sparkles className="h-6 w-6" />
        </span>
        <div>
          <p className="font-semibold text-gray-900">Prediction Engine Active</p>
          <p className="text-sm text-gray-500">
            Forecasting using time-of-day patterns, runway congestion signals & live sensor trends.
          </p>
        </div>
      </div>

      {/* Prediction cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {preds.map((p, i) => {
          const meta = statusMeta[statusFromNoise(p.expected)];
          return (
            <Tilt key={i} max={9}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-medium text-sky-600">
                  <BrainCircuit className="h-4 w-4" /> Next {p.in}
                </div>
                <p className="mt-2 text-3xl font-bold" style={{ color: meta.hex }}>{p.expected} dB</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{p.zone}</p>
                <p className="mt-2 text-xs text-gray-500">{p.message}</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${p.confidence}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-400">Confidence {p.confidence}%</p>
              </div>
            </Tilt>
          );
        })}
      </div>

      {/* AI insights banner */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Plane className="mt-0.5 h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            <strong>Runway congestion may increase sound levels</strong> in the next 10 minutes due to clustered departure slots.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <TrendingUp className="mt-0.5 h-5 w-5 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            Residential Edge is predicted to stay within <strong>safe limits</strong> through the next hour.
          </p>
        </div>
      </div>

      {/* Live actual vs predicted */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Actual vs Predicted Peak Noise (live)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="t" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24h projected */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">24-Hour Projected Noise Profile</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="noise" stroke="#0ea5e9" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
}
