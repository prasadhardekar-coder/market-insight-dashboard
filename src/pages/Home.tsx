import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Tilt from "../components/Tilt";
import Particles from "../components/Particles";
import Ticker from "../components/Ticker";
import {
  Map, BrainCircuit, MessageSquareWarning, BarChart3, HeartPulse,
  History, Trophy, Plane, Mic, AlertTriangle, Bot, Wind, Box, Cpu, Cloud,
  Command, Languages, Sparkles, ShieldCheck, Activity, Globe2,
} from "lucide-react";

const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4";

const features = [
  { icon: Globe2,           title: "Karnataka 3 Airports Live",    desc: "Real Indian airlines & routes · noise derived from flight positions · runway chosen by wind.", to: "/airports", tag: "LIVE" },
  { icon: Box,              title: "3D Airport Digital Twin",       desc: "WebGL twin with moving aircraft & live noise rings.", to: "/twin", tag: "NEW" },
  { icon: Cpu,              title: "AI Anomaly Detection",          desc: "Rolling z-score detects acoustic outliers in real-time.", to: "/anomalies", tag: "NEW" },
  { icon: Cloud,            title: "Weather & Wind Impact",         desc: "Wind direction shapes noise propagation.", to: "/weather", tag: "NEW" },
  { icon: Map,              title: "Live Noise Heatmap",            desc: "Green/yellow/red zones across the airport.", to: "/heatmap" },
  { icon: BrainCircuit,     title: "AI Noise Prediction",           desc: "10-minute forecasts with confidence bands.", to: "/ai" },
  { icon: MessageSquareWarning, title: "Public Complaint Portal",   desc: "Residents file noise issues with audio.", to: "/complaints" },
  { icon: AlertTriangle,    title: "Smart Alerts & Emergency",      desc: "SMS, email & siren mode for extreme noise.", to: "/dashboard" },
  { icon: BarChart3,        title: "Impact Analytics",              desc: "Daily averages, weekly trends, peak hours.", to: "/analytics" },
  { icon: HeartPulse,       title: "Health Engine",                 desc: "WHO-based exposure & protection guidance.", to: "/health" },
  { icon: History,          title: "Historical Playback",           desc: "Replay any past airport noise activity.", to: "/playback" },
  { icon: Trophy,           title: "Rankings & Scores",             desc: "Quietest zones & daily environmental score.", to: "/rankings" },
  { icon: Wind,             title: "Carbon + Noise Combined",       desc: "CO₂, temperature & humidity monitoring.", to: "/analytics" },
  { icon: Mic,              title: "Voice Assistant",               desc: "Spoken status updates via Web Speech API.", to: "/dashboard" },
  { icon: Bot,              title: "AI Chatbot",                    desc: "Ask why noise is high — get instant answers.", to: "/dashboard" },
  { icon: Plane,            title: "Aircraft Identification",       desc: "Detects takeoff, landing & jet engine activity.", to: "/dashboard" },
];

const highlights = [
  { icon: Command,  title: "Command Palette",   desc: "Press ⌘K / Ctrl+K anywhere to jump." },
  { icon: Languages,title: "Multi-language",    desc: "English · हिन्दी · Español built in." },
  { icon: ShieldCheck, title: "Dark / Light",   desc: "Theme toggle across every page." },
  { icon: Activity, title: "Live Toasts",       desc: "Stream of real-time alerts." },
  { icon: Sparkles, title: "3D Cursor Effects", desc: "Glow + tilt micro-interactions." },
  { icon: Globe2,   title: "Smart City Ready",  desc: "MQTT-style mesh, scalable design." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/70 dark:from-slate-950/50 dark:via-slate-950/40 dark:to-slate-950/80" />
        <Particles />

        <Navbar />

        <div className="relative flex h-full flex-col">
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="-mt-80 text-center">
              <p className="mb-4 text-sm font-semibold tracking-wider text-gray-600 dark:text-slate-300">
                SMART AIRPORT MONITORING
              </p>
              <Tilt max={6} scale={1}>
                <h1 className="text-6xl font-normal leading-none tracking-tighter text-gray-500 dark:text-slate-400 md:text-7xl lg:text-8xl">
                  Intelligent.
                </h1>
                <h1
                  className="text-6xl font-normal leading-none tracking-tighter md:text-7xl lg:text-8xl text-slate-900 dark:text-white"
                  style={{ marginTop: "-12px" }}
                >
                  Effortless.
                </h1>
              </Tilt>
              <p className="mx-auto mt-5 mb-6 max-w-2xl text-lg text-gray-600 dark:text-slate-300 md:text-xl">
                AI-powered environmental monitoring for noise, air & emissions — protecting communities around the airport.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/airports"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-2 font-medium text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-105"
                >
                  🛫 Karnataka Airports Live
                </Link>
                <Link
                  to="/twin"
                  className="rounded-full bg-gray-300 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400"
                >
                  Discover
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-full px-4 py-2 font-medium text-white transition-colors"
                  style={{ backgroundColor: "#202A36" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a2229")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#202A36")}
                >
                  Open Dashboard
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

      <Ticker />

      {/* ADVANCED HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-8 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wider text-violet-600 dark:text-violet-400">ADVANCED LAYER</p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100 md:text-4xl">
              Built for presentations, judges & real ops
            </h2>
          </div>
          <span className="hidden rounded-full bg-violet-50 dark:bg-violet-950 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 md:inline">
            Press ⌘K anywhere
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <Tilt key={h.title} max={10}>
                <div className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-4 text-center shadow-sm">
                  <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{h.title}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{h.desc}</p>
                </div>
              </Tilt>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-8 pb-24">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold tracking-wider text-sky-600 dark:text-sky-400">CAPABILITIES</p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-slate-100 md:text-5xl">
            A complete environmental intelligence suite
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-500 dark:text-slate-400">
            Everything required for a future-ready predictive airport monitoring system — in one dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Tilt key={f.title} className="h-full">
                <Link
                  to={f.to}
                  className="relative flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors hover:border-sky-300 dark:hover:border-sky-700"
                >
                  {f.tag && (
                    <span className="absolute right-4 top-4 rounded-full bg-violet-100 dark:bg-violet-950 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                      {f.tag}
                    </span>
                  )}
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{f.desc}</p>
                </Link>
              </Tilt>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
        AeroSense — Future-ready predictive environmental monitoring system · Demo build
      </footer>
    </div>
  );
}
