import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../lib/AuthContext";
import { airports } from "../lib/airports";
import Particles from "../components/Particles";
import Tilt from "../components/Tilt";
import {
  Radio, Mail, Lock, User as UserIcon, Building2, MapPin, Eye, EyeOff,
  ArrowRight, ShieldCheck, BrainCircuit, Box, Activity, Sparkles, AlertTriangle,
} from "lucide-react";

const VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4";

export default function AuthLanding() {
  const { user, login, signup, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Authority");
  const [airport, setAirport] = useState("BLR");

  useEffect(() => {
    if (!loading && user) nav("/home", { replace: true });
  }, [user, loading, nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!email || !password) return setErr("Please fill all fields.");
    if (mode === "login") {
      const ok = login(email, password);
      if (!ok) return setErr("Invalid credentials.");
    } else {
      if (!name) return setErr("Name is required.");
      const ok = signup({ name, email, role, airport }, password);
      if (!ok) return setErr("Could not create account.");
    }
    nav("/home", { replace: true });
  };

  const demo = (r: Role) => {
    const e = `${r.toLowerCase()}@aerosense.in`;
    signup({ name: `${r} User`, email: e, role: r, airport: "BLR" }, "demo");
    nav("/home", { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1220] text-white">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        src={VIDEO}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#0b1220]/85 to-sky-950/70" />
      <Particles />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:flex-row lg:items-center lg:gap-12 lg:px-12">
        {/* Left — Branding */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 shadow-xl shadow-sky-500/30">
              <Radio className="h-5 w-5" />
            </span>
            <span className="text-2xl font-semibold">AeroSense</span>
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Karnataka Edition · 2026</p>
          <h1 className="mt-3 bg-gradient-to-r from-white via-sky-200 to-violet-200 bg-clip-text text-5xl font-semibold leading-tight tracking-tight text-transparent lg:text-6xl">
            Smart AI Airport<br />Environmental Monitoring
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Live aircraft tracking & noise alert system for <strong className="text-white">Bengaluru (BLR)</strong>, <strong className="text-white">Hubballi (HBX)</strong> and <strong className="text-white">Belagavi (IXG)</strong> — with side-by-side heatmap comparison.
          </p>

          {/* Airport badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {airports.map((a) => (
              <Tilt key={a.code} max={9}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{a.code}</span>
                    <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">{a.category}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-300">{a.city}</p>
                  <p className="mt-2 text-[10px] text-slate-500">{a.passengersM}M pax · {a.dailyMovements} mvmt/day</p>
                </div>
              </Tilt>
            ))}
          </div>

          {/* Feature pills */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { i: BrainCircuit, t: "AI Predict" },
              { i: Box, t: "3D Twin" },
              { i: Activity, t: "Live Noise" },
              { i: Sparkles, t: "Smart Alerts" },
            ].map((f) => {
              const I = f.i;
              return (
                <div key={f.t} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs backdrop-blur">
                  <I className="h-4 w-4 text-sky-300" /> {f.t}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Auth Card */}
        <Tilt max={4} className="w-full lg:w-[460px]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl">
            <div className="mb-6 flex rounded-full bg-white/5 p-1 text-sm">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full py-2 font-medium transition-colors ${mode === "login" ? "bg-sky-500 text-white" : "text-slate-300 hover:text-white"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full py-2 font-medium transition-colors ${mode === "signup" ? "bg-sky-500 text-white" : "text-slate-300 hover:text-white"}`}
              >
                Create account
              </button>
            </div>

            <h2 className="text-2xl font-semibold">
              {mode === "login" ? "Welcome back" : "Get started in seconds"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === "login" ? "Access your monitoring dashboard." : "No real data is collected — demo only."}
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              {mode === "signup" && (
                <Field icon={UserIcon} placeholder="Full name" value={name} onChange={setName} />
              )}
              <Field icon={Mail} placeholder="you@example.com" value={email} onChange={setEmail} type="email" />
              <div className="relative">
                <Field icon={Lock} placeholder="Password" value={password} onChange={setPassword} type={showPw ? "text" : "password"} />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Select icon={Building2} value={role} onChange={(v) => setRole(v as Role)}
                      options={["Authority", "Resident", "Researcher"]} />
                    <Select icon={MapPin} value={airport} onChange={setAirport}
                      options={airports.map((a) => a.code)}
                      labels={airports.map((a) => `${a.code} · ${a.city}`)} />
                  </div>
                </>
              )}

              {err && (
                <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4" /> {err}
                </div>
              )}

              <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-600">
                {mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-white/10" /> or one-click demo <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["Authority", "Resident", "Researcher"] as Role[]).map((r) => (
                <button key={r} onClick={() => demo(r)} className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10">
                  {r}
                </button>
              ))}
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              No real authentication · client-side only · for demo
            </p>
          </div>
        </Tilt>
      </div>

      {/* Footer strip */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-center border-t border-white/10 px-6 py-4 text-xs text-slate-400 lg:px-12">
        <span>© AeroSense · Karnataka Smart Airport Monitoring</span>
      </div>
    </div>
  );
}

/* ---------- input helpers ---------- */
function Field({ icon: Icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-sky-400 focus:bg-white/10"
      />
    </div>
  );
}

function Select({ icon: Icon, value, onChange, options, labels }: { icon: any; value: string; onChange: (v: string) => void; options: string[]; labels?: string[] }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-400"
      >
        {options.map((o, i) => <option key={o} value={o} className="bg-slate-900">{labels?.[i] ?? o}</option>)}
      </select>
    </div>
  );
}
