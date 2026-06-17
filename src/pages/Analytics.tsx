import { useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, Legend,
} from "recharts";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { genWeeklyTrend, genHourly } from "../lib/data";
import { Volume2, Wind, Activity, HeartPulse } from "lucide-react";

function KPI({ icon: Icon, label, value, sub, tint }: any) {
  return (
    <Tilt max={8}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></span>
        </div>
        <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-xs text-gray-400">{sub}</p>
      </div>
    </Tilt>
  );
}

export default function Analytics() {
  const weekly = useMemo(() => genWeeklyTrend(), []);
  const hourly = useMemo(() => genHourly(1), []);
  const avg = Math.round(weekly.reduce((a, d) => a + d.avg, 0) / weekly.length);
  const peakHour = hourly.reduce((m, h) => (h.noise > m.noise ? h : m), hourly[0]);

  return (
    <Shell title="Environmental Impact Analytics" subtitle="Smart Airport Environmental Monitoring — noise + carbon combined">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={Volume2} label="Daily Avg Noise" value={`${avg} dB`} sub="across all zones" tint="bg-sky-50 text-sky-600" />
        <KPI icon={Activity} label="Peak Hour" value={peakHour.hour} sub={`${peakHour.noise} dB recorded`} tint="bg-amber-50 text-amber-600" />
        <KPI icon={Wind} label="Avg CO₂" value="548 ppm" sub="moderate emissions" tint="bg-emerald-50 text-emerald-600" />
        <KPI icon={HeartPulse} label="Health Impact" value="Moderate" sub="est. exposure risk" tint="bg-red-50 text-red-600" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Weekly Noise Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Avg dB" />
                <Bar dataKey="peak" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Peak dB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Peak Airport Hours (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourly}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="noise" stroke="#f59e0b" fill="url(#ga)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Carbon & Climate Monitoring (CO₂ vs Noise)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="l" type="monotone" dataKey="avg" stroke="#0ea5e9" strokeWidth={2} name="Noise dB" />
              <Line yAxisId="r" type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} name="CO₂ ppm" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Shell>
  );
}
