import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { seedComplaints, type Complaint } from "../lib/data";
import { Mic, Upload, Send, CheckCircle2, Clock, AlertCircle, FileAudio } from "lucide-react";

const statusStyle: Record<Complaint["status"], string> = {
  New: "bg-red-50 text-red-600",
  Reviewing: "bg-amber-50 text-amber-600",
  Resolved: "bg-emerald-50 text-emerald-600",
};

export default function Complaints() {
  const [list, setList] = useState<Complaint[]>(seedComplaints);
  const [form, setForm] = useState({ name: "", location: "", time: "", category: "Early morning takeoff", message: "" });
  const [recorded, setRecorded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    const c: Complaint = {
      id: "C-" + Math.floor(1000 + Math.random() * 9000),
      name: form.name,
      location: form.location || "Unknown",
      time: form.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: form.category,
      message: form.message,
      status: "New",
      hasAudio: recorded,
    };
    setList((l) => [c, ...l]);
    setForm({ name: "", location: "", time: "", category: "Early morning takeoff", message: "" });
    setRecorded(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const analytics = [
    { name: "New", value: list.filter((c) => c.status === "New").length, color: "#ef4444" },
    { name: "Reviewing", value: list.filter((c) => c.status === "Reviewing").length, color: "#f59e0b" },
    { name: "Resolved", value: list.filter((c) => c.status === "Resolved").length, color: "#10b981" },
  ];

  return (
    <Shell title="Public Complaint Portal" subtitle="Residents report disturbances · Authorities track analytics">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <Tilt max={4} className="lg:col-span-1">
          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">File a Complaint</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location / area" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Disturbance time (e.g. 06:20)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400">
                <option>Early morning takeoff</option>
                <option>Night operations</option>
                <option>Continuous overhead flights</option>
                <option>Ground engine noise</option>
                <option>Other disturbance</option>
              </select>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe the disturbance…" rows={3} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400" />

              <div className="flex gap-2">
                <button type="button" onClick={() => setRecorded(!recorded)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${recorded ? "border-sky-400 bg-sky-50 text-sky-600" : "border-slate-200 text-gray-600 hover:bg-slate-50"}`}>
                  <Mic className="h-4 w-4" /> {recorded ? "Recorded ✓" : "Record audio"}
                </button>
                <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-slate-50">
                  <Upload className="h-4 w-4" /> Upload
                </button>
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-600">
                <Send className="h-4 w-4" /> Submit Complaint
              </button>
              {submitted && (
                <p className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Complaint submitted to authorities.
                </p>
              )}
            </div>
          </form>
        </Tilt>

        {/* Analytics + list */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">By Status</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics} dataKey="value" nameKey="name" innerRadius={32} outerRadius={55}>
                      {analytics.map((a) => <Cell key={a.name} fill={a.color} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="sm:col-span-2 grid grid-cols-3 gap-3">
              {analytics.map((a) => (
                <div key={a.name} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold" style={{ color: a.color }}>{a.value}</p>
                  <p className="text-xs text-gray-500">{a.name}</p>
                </div>
              ))}
              <div className="col-span-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-gray-900">{list.length}</p>
                <p className="text-xs text-gray-500">Total complaints logged</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Authority Review Queue</h3>
            <div className="space-y-3">
              {list.map((c) => {
                const Icon = c.status === "Resolved" ? CheckCircle2 : c.status === "Reviewing" ? Clock : AlertCircle;
                return (
                  <div key={c.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <Icon className="mt-0.5 h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900">{c.name}</span>
                        <span className="text-xs text-gray-400">#{c.id}</span>
                        <span className="text-xs text-gray-400">· {c.location} · {c.time}</span>
                        {c.hasAudio && <span className="flex items-center gap-1 text-xs text-sky-600"><FileAudio className="h-3 w-3" /> audio</span>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{c.message}</p>
                      <span className="mt-1 inline-block text-xs font-medium text-gray-500">{c.category}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[c.status]}`}>{c.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
