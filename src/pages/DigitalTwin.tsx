import Shell from "../components/Shell";
import AirportTwin3D from "../components/AirportTwin3D";
import { useSensors } from "../lib/useSensors";
import { statusFromNoise, statusMeta } from "../lib/data";
import Tilt from "../components/Tilt";
import { Box, Plane, Radio, Sparkles } from "lucide-react";

export default function DigitalTwin() {
  const { zones, maxNoise, avgNoise, emergency } = useSensors(1500);

  return (
    <Shell title="Airport Digital Twin · 3D" subtitle="Live volumetric view of noise propagation and aircraft activity" emergency={emergency}>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-5">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-500 text-white"><Box className="h-6 w-6" /></span>
        <div className="flex-1 min-w-[12rem]">
          <p className="font-semibold text-gray-900">Live Digital Twin Active</p>
          <p className="text-sm text-gray-500">Rendered with WebGL · Sensor towers, expanding noise rings & moving aircraft are driven by live data.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">Avg {avgNoise} dB</span>
          <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700">Peak {maxNoise} dB</span>
          <span className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 font-medium text-sky-700"><Sparkles className="h-3 w-3" /> WebGL</span>
        </div>
      </div>

      <AirportTwin3D zones={zones} />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((z) => {
          const meta = statusMeta[statusFromNoise(z.noise)];
          return (
            <Tilt key={z.id} max={8}>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: meta.hex + "22", color: meta.hex }}>
                  <Radio className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{z.name}</p>
                  <p className="text-xs text-gray-500">Tower beacon · {meta.label}</p>
                </div>
                <span className="text-lg font-bold" style={{ color: meta.hex }}>{z.noise}</span>
              </div>
            </Tilt>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        <p className="flex items-center gap-2 font-semibold text-gray-900">
          <Plane className="h-4 w-4 text-sky-500" /> What you're seeing
        </p>
        <p className="mt-2">
          The 3D twin projects each sensor zone as a glowing tower whose pulse colour reflects current acoustic status
          (green → safe, amber → moderate, red → dangerous). Expanding rings visualise noise propagation radius, while three
          aircraft animate active runway operations. Drag to orbit, scroll to zoom.
        </p>
      </div>
    </Shell>
  );
}
