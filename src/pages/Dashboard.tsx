import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { Card, Stat, Heading } from "../components/ui";
import { useSensors } from "../lib/useSensors";
import { statusFromNoise, statusMeta, classifyActivity, healthRecommendation } from "../lib/data";
import { speak } from "../lib/speak";
import { useApp } from "../lib/AppContext";
import {
  Volume2, Wind, Thermometer, Droplets, Plane, AlertTriangle,
  Mic, Mail, MessageSquare, Bell, ShieldAlert, X,
} from "lucide-react";

export default function Dashboard() {
  const { zones, maxNoise, avgNoise, avgCo2, emergency, dangerZone, deltaFor } = useSensors(2000);
  const [showEmergency, setShowEmergency] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; text: string; channel: string }[]>([]);
  const { pushToast } = useApp();

  useEffect(() => {
    if (emergency) setShowEmergency(true);
  }, [emergency]);

  useEffect(() => {
    const danger = zones.find((z) => z.noise >= 95);
    if (danger && Math.random() > 0.6) {
      const channels = ["SMS", "Email", "Push", "Telegram"];
      const ch = channels[Math.floor(Math.random() * channels.length)];
      const text = `Dangerous noise (${danger.noise} dB) near ${danger.name}`;
      setAlerts((a) => [{ id: Date.now(), channel: ch, text }, ...a].slice(0, 5));
      pushToast({ title: `${ch} alert dispatched`, body: text, tone: danger.noise >= 105 ? "danger" : "warn" });
    }
  }, [zones, pushToast]);

  const speakStatus = () => {
    const s = statusFromNoise(maxNoise);
    const text =
      s === "danger"
        ? `Warning. Dangerous noise levels detected near ${dangerZone?.name}. Current peak is ${maxNoise} decibels.`
        : s === "moderate"
        ? `Current airport noise is moderate. Peak ${maxNoise} decibels near ${dangerZone?.name}.`
        : `Current airport noise is safe. Average ${avgNoise} decibels.`;
    speak(text);
  };

  const channelIcon: Record<string, any> = { SMS: MessageSquare, Email: Mail, Push: Bell, Telegram: MessageSquare };

  return (
    <Shell title="Operations Dashboard" subtitle="Real-time airport environmental overview" emergency={showEmergency}>
      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Volume2} label="Peak Noise" value={maxNoise} unit="dB" tint="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" />
        <Stat icon={Volume2} label="Average Noise" value={avgNoise} unit="dB" tint="bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400" />
        <Stat icon={Wind} label="Avg CO₂" value={avgCo2} unit="ppm" tint="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" />
        <Stat icon={Thermometer} label="Avg Temp" value={Math.round(zones.reduce((a, z) => a + z.temp, 0) / zones.length)} unit="°C" tint="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Voice + alerts row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#202A36] to-[#2c3a4d] p-6 text-white">
          <div className="flex items-center gap-2 text-sky-300">
            <Mic className="h-5 w-5" /> <span className="font-semibold">Voice Assistant</span>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Tap to hear a spoken summary of current airport environmental status.
          </p>
          <button
            onClick={speakStatus}
            className="mt-4 flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-sky-600"
          >
            <Mic className="h-4 w-4" /> Speak Status
          </button>
        </div>

        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
            <Bell className="h-5 w-5 text-amber-500" /> <span className="font-semibold">Smart Alerts</span>
            <span className="ml-auto text-xs text-gray-400 dark:text-slate-500">SMS · Email · Push · Telegram</span>
          </div>
          <div className="mt-4 space-y-2">
            {alerts.length === 0 && <p className="text-sm text-gray-400 dark:text-slate-500">No active alerts. Monitoring all zones…</p>}
            {alerts.map((a) => {
              const Icon = channelIcon[a.channel] || Bell;
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950 px-4 py-3 text-sm">
                  <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-gray-700 dark:text-slate-200">{a.text}</span>
                  <span className="ml-auto rounded-full bg-amber-200 dark:bg-amber-800 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">{a.channel}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Zone cards with aircraft identification */}
      <Heading>Live Zones & Aircraft Activity</Heading>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((z) => {
          const s = statusFromNoise(z.noise);
          const meta = statusMeta[s];
          const delta = deltaFor(z.id, z.noise);
          const activity = classifyActivity(z.noise, delta);
          const health = healthRecommendation(z.noise);
          return (
            <Tilt key={z.id} max={9}>
              <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ${meta.ring}/20`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-slate-100">{z.name}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.color} dark:bg-opacity-20`}>{meta.label}</span>
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-slate-100">{z.noise}</span>
                  <span className="mb-1 text-sm text-gray-400 dark:text-slate-500">dB</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (z.noise / 120) * 100)}%`, backgroundColor: meta.hex }} />
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-gray-600 dark:text-slate-300">
                  <Plane className="h-4 w-4 text-sky-500" /> {activity}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-gray-500 dark:text-slate-400">
                  <span className="flex flex-col items-center gap-1"><Wind className="h-4 w-4" />{z.co2} ppm</span>
                  <span className="flex flex-col items-center gap-1"><Thermometer className="h-4 w-4" />{z.temp}°C</span>
                  <span className="flex flex-col items-center gap-1"><Droplets className="h-4 w-4" />{z.humidity}%</span>
                </div>
                <p className={`mt-3 text-xs font-medium ${health.color} dark:opacity-90`}>{health.level} · {health.exposure}</p>
              </div>
            </Tilt>
          );
        })}
      </div>

      {/* Emergency overlay */}
      {showEmergency && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-red-900/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl border-2 border-red-500 bg-white dark:bg-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">EMERGENCY MODE</h3>
            <p className="mt-2 text-gray-600 dark:text-slate-300">
              Extreme noise level <strong>{maxNoise} dB</strong> detected near <strong>{dangerZone?.name}</strong>.
              Siren activated. Non-essential staff should evacuate the zone.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 animate-pulse" /> Alerts dispatched via SMS, Email & Telegram
            </div>
            <button
              onClick={() => setShowEmergency(false)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700"
            >
              <X className="h-4 w-4" /> Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
