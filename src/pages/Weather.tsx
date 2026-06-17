import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import { genWeather, type Weather as W } from "../lib/advanced";
import { Wind, Eye, Thermometer, Gauge, CloudSun, Cloud, CloudRain, CloudFog, Navigation } from "lucide-react";

const condIcons: Record<W["condition"], any> = {
  "Clear": CloudSun,
  "Cloudy": Cloud,
  "Light Rain": CloudRain,
  "Foggy": CloudFog,
  "Windy": Wind,
};

export default function Weather() {
  const [w, setW] = useState<W>(() => genWeather());

  useEffect(() => {
    const t = setInterval(() => setW(genWeather()), 5000);
    return () => clearInterval(t);
  }, []);

  const Icon = condIcons[w.condition];
  const propColor = w.noisePropagation === "Amplified" ? "text-red-600" : w.noisePropagation === "Reduced" ? "text-emerald-600" : "text-sky-600";
  const propBg    = w.noisePropagation === "Amplified" ? "bg-red-50"    : w.noisePropagation === "Reduced" ? "bg-emerald-50" : "bg-sky-50";

  return (
    <Shell title="Weather & Wind Impact" subtitle="Atmospheric conditions affect how far noise travels">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Tilt max={5} className="lg:col-span-2">
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#202A36] via-[#243144] to-[#0ea5e9]/40 p-8 text-white shadow-sm sm:flex-row sm:items-center">
            <div>
              <Icon className="h-20 w-20 text-sky-200 float-slow" />
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wider text-sky-200">Current Conditions</p>
              <h2 className="mt-1 text-4xl font-semibold">{w.condition}</h2>
              <p className="mt-2 text-slate-200">
                Wind {w.windSpeed} km/h from {w.windDirLabel} · {w.temp}°C · {w.visibility} km visibility
              </p>
              <div className={`mt-4 inline-flex items-center gap-2 rounded-full ${propBg} px-3 py-1 text-sm font-medium ${propColor}`}>
                <Wind className="h-4 w-4" /> Noise Propagation: {w.noisePropagation}
              </div>
            </div>
          </div>
        </Tilt>

        <Tilt max={5}>
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm font-medium text-gray-500">Wind Direction</p>
            <div className="relative h-40 w-40 rounded-full border-4 border-slate-100">
              {["N","E","S","W"].map((d, i) => (
                <span key={d} className="absolute text-xs font-semibold text-slate-400"
                  style={{
                    top: i === 0 ? 6 : i === 2 ? "auto" : "50%",
                    bottom: i === 2 ? 6 : "auto",
                    left: i === 3 ? 6 : i === 1 ? "auto" : "50%",
                    right: i === 1 ? 6 : "auto",
                    transform: (i === 0 || i === 2) ? "translateX(-50%)" : "translateY(-50%)",
                  }}>{d}</span>
              ))}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-700" style={{ transform: `translate(-50%,-50%) rotate(${w.windDir}deg)` }}>
                <Navigation className="h-16 w-16 fill-sky-500 text-sky-500" />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{w.windDir}° · {w.windDirLabel}</p>
          </div>
        </Tilt>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Wind, label: "Wind speed", value: `${w.windSpeed} km/h`, tint: "bg-sky-50 text-sky-600" },
          { icon: Thermometer, label: "Temperature", value: `${w.temp}°C`, tint: "bg-amber-50 text-amber-600" },
          { icon: Eye, label: "Visibility", value: `${w.visibility} km`, tint: "bg-emerald-50 text-emerald-600" },
          { icon: Gauge, label: "Pressure", value: `${w.pressure} hPa`, tint: "bg-violet-50 text-violet-600" },
        ].map((m) => {
          const I = m.icon;
          return (
            <Tilt key={m.label}><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${m.tint}`}><I className="h-5 w-5" /></span>
              <p className="mt-3 text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-sm text-gray-500">{m.label}</p>
            </div></Tilt>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        <p className="font-semibold text-gray-900">Impact analysis</p>
        <p className="mt-2">
          {w.noisePropagation === "Amplified" && "Inversion / fog layer is trapping sound near the ground — residential zones may receive 4–7 dB above sensor readings."}
          {w.noisePropagation === "Reduced"   && "Active precipitation absorbs high-frequency noise — public-facing zones will read 3–5 dB lower than apron."}
          {w.noisePropagation === "Normal"    && "Atmospheric conditions are typical — sensor readings approximate downstream exposure within ±2 dB."}
        </p>
      </div>
    </Shell>
  );
}
