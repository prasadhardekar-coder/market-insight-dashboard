import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Radio, Moon, Sun } from "lucide-react";
import { useApp } from "../lib/AppContext";

const nav = [
  { label: "Karnataka", to: "/airports" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "3D Twin", to: "/twin" },
  { label: "AI Predict", to: "/ai" },
  { label: "Analytics", to: "/analytics" },
];

export default function Navbar({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { theme, toggleTheme } = useApp();
  const text = dark ? "text-white" : "text-gray-900 dark:text-slate-100";
  const hover = dark ? "hover:text-sky-300" : "hover:text-gray-700 dark:hover:text-sky-400";

  return (
    <nav className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Link to="/home" className={`flex items-center gap-2 text-2xl font-semibold ${text}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Radio className="h-5 w-5" />
          </span>
          AeroSense
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm font-medium transition-colors ${text} ${hover} ${
                loc.pathname === n.to ? "underline underline-offset-8 decoration-sky-500" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
          {/* Dark mode toggle — Moon/Sun icon */}
          <button
            onClick={toggleTheme}
            className={`grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 ${text}`}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-300" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <Link
            to="/dashboard"
            className="rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#202A36" }}
          >
            Launch
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className={`grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 ${text}`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-300" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`${text}`}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-8 rounded-2xl bg-white/95 dark:bg-slate-900/95 p-4 shadow-xl backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-slate-100 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
