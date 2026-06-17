import { useApp } from "../lib/AppContext";
import { Info, CheckCircle2, AlertTriangle, ShieldAlert, X } from "lucide-react";

const tones = {
  info:    { icon: Info,         color: "bg-sky-500" },
  success: { icon: CheckCircle2, color: "bg-emerald-500" },
  warn:    { icon: AlertTriangle,color: "bg-amber-500" },
  danger:  { icon: ShieldAlert,  color: "bg-red-500" },
};

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[65] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, color } = tones[t.tone];
        return (
          <div key={t.id} className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl text-white ${color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              {t.body && <p className="text-xs text-gray-500">{t.body}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 transition-colors hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
