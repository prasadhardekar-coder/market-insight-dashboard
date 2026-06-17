import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import Shell from "../components/Shell";
import { useSensors } from "../lib/useSensors";
import { statusFromNoise, statusMeta, airportCenter } from "../lib/data";
import "leaflet/dist/leaflet.css";

export default function Heatmap() {
  const { zones, maxNoise } = useSensors(2000);
  const emergency = maxNoise >= 110;

  return (
    <Shell title="Live Noise Heatmap" subtitle="Real-time acoustic zones · green = safe, yellow = moderate, red = dangerous" emergency={emergency}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="h-[34rem] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <MapContainer center={airportCenter} zoom={15} scrollWheelZoom>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {zones.map((z) => {
                const meta = statusMeta[statusFromNoise(z.noise)];
                const radius = 120 + (z.noise - 40) * 6;
                return (
                  <Circle
                    key={z.id}
                    center={[z.lat, z.lng]}
                    radius={radius}
                    pathOptions={{ color: meta.hex, fillColor: meta.hex, fillOpacity: 0.35, weight: 2 }}
                  >
                    <Tooltip>
                      <strong>{z.name}</strong>
                      <br />
                      {z.noise} dB — {meta.label}
                    </Tooltip>
                  </Circle>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Legend</h3>
            {(["safe", "moderate", "danger"] as const).map((s) => (
              <div key={s} className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: statusMeta[s].hex }} />
                {statusMeta[s].label}
              </div>
            ))}
          </div>

          {zones
            .slice()
            .sort((a, b) => b.noise - a.noise)
            .map((z) => {
              const meta = statusMeta[statusFromNoise(z.noise)];
              return (
                <div key={z.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                  <span className="font-medium text-gray-800">{z.name}</span>
                  <span className="font-semibold" style={{ color: meta.hex }}>{z.noise} dB</span>
                </div>
              );
            })}
        </div>
      </div>
    </Shell>
  );
}
