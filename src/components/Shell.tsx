import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { useAuth } from "../lib/AuthContext";
import {
  Radio, LayoutDashboard, Map, BrainCircuit, MessageSquareWarning,
  BarChart3, HeartPulse, History, Trophy, Menu, X, Home,
  Box, Cloud, Cpu, Moon, Sun, Languages, Search,
  LogOut, Globe2,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/airports", label: "Karnataka Airports", icon: Globe2, highlight: true },
  { to: "/twin", label: "3D Digital Twin", icon: Box },
  { to: "/heatmap", label: "Live Heatmap", icon: Map },
  { to: "/ai", label: "AI Prediction", icon: BrainCircuit },
  { to: "/anomalies", label: "Anomaly Detection", icon: Cpu },
  { to: "/weather", label: "Weather Impact", icon: Cloud },
  { to: "/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/health", label: "Health Engine", icon: HeartPulse },
  { to: "/playback", label: "Data Playback", icon: History },
  { to: "/rankings", label: "Rankings", icon: Trophy },
];

export default function Shell({ title, subtitle, children, emergency }: {
  title: string; subtitle?: string; children: ReactNode; emergency?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { theme, toggleTheme, lang, setLang, setPaletteOpen } = useApp();
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${emergency ? "siren-flash" : ""}`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 dark:border-slate-800 bg-[#202A36] text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-6 text-xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/30">
            <Radio className="h-5 w-5" />
          </span>
          AeroSense
        </div>
        <nav className="scrollbar-thin flex h-[calc(100vh-12rem)] flex-col gap-1 overflow-y-auto px-3">
          {links.map((l) => {
            const Icon = l.icon;
            const active = loc.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{l.label}</span>
                {(l as any).highlight && !active && (
                  <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">NEW</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-3">
          <Link
            to="/home"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden" />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-md">
          <button onClick={() => setOpen(!open)} className="text-gray-900 dark:text-slate-100 lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors hover:border-sky-400 hover:text-sky-600 md:flex"
            >
              <Search className="h-3.5 w-3.5" /> Search…
              <kbd className="ml-2 flex items-center gap-0.5 rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </button>
            <div className="hidden items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 md:flex">
              {(["en","hi","es"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${lang === l ? "bg-sky-500 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
              <Languages className="mx-1 h-3.5 w-3.5 text-slate-400" />
            </div>
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:text-sky-600 dark:hover:text-sky-400"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-ring" />
              Live
            </span>
            {user && (
              <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 pl-1 pr-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-xs font-bold text-white">
                  {user.avatar}
                </span>
                <div className="hidden text-left text-xs leading-tight md:block">
                  <p className="font-semibold text-gray-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.role} · {user.airport}</p>
                </div>
                <button
                  onClick={() => { logout(); nav("/", { replace: true }); }}
                  className="ml-1 grid h-6 w-6 place-items-center rounded-full text-slate-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
