import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "es";
export type Theme = "light" | "dark";

interface Toast { id: number; title: string; body?: string; tone: "info" | "success" | "warn" | "danger"; }

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  theme: Theme;
  toggleTheme: () => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;
}

const dict: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: "Dashboard", heatmap: "Heatmap", ai: "AI Predict", complaints: "Complaints",
    analytics: "Analytics", health: "Health", playback: "Playback", rankings: "Rankings",
    twin: "Digital Twin", flights: "Flights", sensors: "Sensors", carbon: "Carbon",
    safe: "Safe", moderate: "Moderate", danger: "Dangerous",
  },
  hi: {
    dashboard: "डैशबोर्ड", heatmap: "हीटमैप", ai: "एआई पूर्वानुमान", complaints: "शिकायतें",
    analytics: "विश्लेषण", health: "स्वास्थ्य", playback: "रिप्ले", rankings: "रैंकिंग",
    twin: "डिजिटल ट्विन", flights: "उड़ानें", sensors: "सेंसर", carbon: "कार्बन",
    safe: "सुरक्षित", moderate: "मध्यम", danger: "खतरनाक",
  },
  es: {
    dashboard: "Panel", heatmap: "Mapa", ai: "IA Predicción", complaints: "Quejas",
    analytics: "Analítica", health: "Salud", playback: "Reproducir", rankings: "Ranking",
    twin: "Gemelo Digital", flights: "Vuelos", sensors: "Sensores", carbon: "Carbono",
    safe: "Seguro", moderate: "Moderado", danger: "Peligroso",
  },
};

const AppCtx = createContext<Ctx | null>(null);

const THEME_KEY = "aerosense.theme";
const LANG_KEY = "aerosense.lang";

function detectInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem(LANG_KEY);
      if (v === "en" || v === "hi" || v === "es") return v;
    } catch {}
    return "en";
  });
  const [theme, setTheme] = useState<Theme>(() => detectInitialTheme());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  }, []);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((arr) => [...arr, { ...t, id }]);
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((arr) => arr.filter((x) => x.id !== id));
  }, []);

  const t = useCallback((k: string) => dict[lang][k] ?? k, [lang]);

  const toggleTheme = useCallback(() => {
    setTheme((th) => {
      const next = th === "light" ? "dark" : "light";
      try { localStorage.setItem(THEME_KEY, next); } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t, theme, toggleTheme, toasts, pushToast, dismissToast, paletteOpen, setPaletteOpen }),
    [lang, t, theme, toggleTheme, toasts, pushToast, dismissToast, paletteOpen]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
