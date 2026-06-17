import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Circle, Tooltip, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Shell from "../components/Shell";
import Tilt from "../components/Tilt";
import {
  airports, type Airport, type LiveFlight,
  createSimulation, stepSimulation, recomputeZoneNoise, flightContribution,
  trafficPhaseFor, type SimulationState, type Runway, acousticsOf,
} from "../lib/airports";
import { statusFromNoise, statusMeta, type Zone } from "../lib/data";
import {
  Plane, Wind, Volume2, AlertTriangle,
  Activity, Layers, Eye, EyeOff, Filter, Clock, Gauge, Compass, ArrowDown,
} from "lucide-react";

/* ---------- aircraft icon (rotated plane with airline color) ---------- */
function planeIcon(rotation: number, airlineColor: string, phase: string) {
  const phaseGlow =
    phase === "Takeoff" ? "drop-shadow(0 0 8px #ef4444)" :
    phase === "Climb"   ? "drop-shadow(0 0 6px #f59e0b)" :
    phase === "Approach" ? "drop-shadow(0 0 6px #fb923c)" :
    "drop-shadow(0 0 4px " + airlineColor + "40)";
  return L.divIcon({
    className: "aero-plane-icon",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<svg viewBox="0 0 24 24" width="22" height="22" style="transform: rotate(${rotation}deg); filter: ${phaseGlow};">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5z"
        fill="${airlineColor}" stroke="white" stroke-width="0.8"/>
    </svg>`,
  });
}

/* ---------- Runway overlay (line along runway heading) ---------- */
function RunwayLine({ airport, runway }: { airport: Airport; runway: Runway }) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const length = 0.035; // ~3.5 km in degrees
  const h = rad(runway.heading);
  const p1: [number, number] = [
    airport.center[0] - Math.cos(h) * length / 2,
    airport.center[1] - Math.sin(h) * length / 2,
  ];
  const p2: [number, number] = [
    airport.center[0] + Math.cos(h) * length / 2,
    airport.center[1] + Math.sin(h) * length / 2,
  ];
  return (
    <>
      <Polyline positions={[p1, p2]} pathOptions={{ color: "#facc15", weight: 3, opacity: 0.9 }} />
      <Marker position={p1} icon={L.divIcon({
        className: "",
        html: `<div style="background:#facc15;color:#000;font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;transform:translate(-50%,-50%)">${runway.name}</div>`,
      })} />
      <Marker position={p2} icon={L.divIcon({
        className: "",
        html: `<div style="background:#facc15;color:#000;font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;transform:translate(-50%,-50%)">${runway.reciprocal}</div>`,
      })} />
    </>
  );
}

/* ---------- single airport mini-heatmap card ---------- */
function AirportMap({
  airport, zones, flights, activeRunway, showFlights, showZones, windDir, trafficLevel,
}: {
  airport: Airport; zones: Zone[]; flights: LiveFlight[]; activeRunway: Runway;
  showFlights: boolean; showZones: boolean; windDir: number; trafficLevel: number;
}) {
  const peak = Math.max(...zones.map((z) => z.noise));
  const meta = statusMeta[statusFromNoise(peak)];
  const danger = zones.filter((z) => z.noise >= 90).length;
  const moderate = zones.filter((z) => z.noise >= 70 && z.noise < 90).length;
  const phase = trafficPhaseFor(new Date().getHours());

  return (
    <Tilt max={3}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-sky-500 px-2 py-0.5 text-xs font-bold text-white">{airport.code}</span>
              <span className="text-xs text-slate-400">{airport.icao}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{airport.category}</span>
            </div>
            <h3 className="mt-1 font-semibold text-gray-900 dark:text-slate-100">{airport.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{airport.city} · {airport.runways.length} runway{airport.runways.length > 1 ? "s" : ""} · {airport.dailyMovements} mvmt/day</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Peak noise</p>
            <p className="text-2xl font-bold" style={{ color: meta.hex }}>{peak} dB</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Ops strip */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ArrowDown className="h-3 w-3 text-emerald-600" />
            <div>
              <p className="text-slate-400">Active RWY</p>
              <p className="font-semibold text-slate-800">{activeRunway.name}/{activeRunway.reciprocal}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-3 w-3 text-sky-600" />
            <div>
              <p className="text-slate-400">Wind</p>
              <p className="font-semibold text-slate-800">{windDir}°</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-violet-600" />
            <div>
              <p className="text-slate-400">Phase</p>
              <p className="font-semibold text-slate-800 truncate">{phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3 w-3 text-amber-600" />
            <div>
              <p className="text-slate-400">Load</p>
              <p className="font-semibold text-slate-800">{Math.round(trafficLevel * 100)}%</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-80 w-full">
          <MapContainer center={airport.center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; OSM &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Runway line */}
            <RunwayLine airport={airport} runway={activeRunway} />

            {/* Noise zones */}
            {showZones && zones.map((z) => {
              const m = statusMeta[statusFromNoise(z.noise)];
              const radius = 200 + (z.noise - 40) * 10;
              return (
                <Circle
                  key={z.id}
                  center={[z.lat, z.lng]}
                  radius={radius}
                  pathOptions={{ color: m.hex, fillColor: m.hex, fillOpacity: 0.28, weight: 1.5 }}
                >
                  <Tooltip>
                    <strong>{z.name}</strong><br />
                    {z.noise} dB — {m.label}<br />
                    <span className="text-slate-400">Baseline {z.baseNoise} dB</span>
                  </Tooltip>
                </Circle>
              );
            })}

            {/* Aircraft */}
            {showFlights && flights.map((f) => (
              <Marker key={f.id} position={[f.lat, f.lng]} icon={planeIcon(f.heading, f.airline.color, f.phase)}>
                <Tooltip>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.airline.color }} />
                    <strong>{f.callsign}</strong>
                  </div>
                  <div className="text-[11px]">{f.airline.name}</div>
                  <div className="text-[11px] text-slate-600">{f.aircraft}</div>
                  <div className="text-[11px]">{f.from} → {f.to}</div>
                  <div className="mt-1 text-[11px]">
                    {f.phase} · RWY {f.runway}<br />
                    {f.altitude.toLocaleString()} ft · {f.groundSpeed} kt<br />
                    Impact <strong>{Math.round(flightContribution(f, airport.zones[0]))} dB</strong>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>

          {/* Live badge */}
          <div className="absolute right-3 top-3 z-[400] flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
          </div>
          <div className="absolute left-3 top-3 z-[400] rounded-lg bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur">
            <div className="flex items-center gap-1"><Plane className="h-3 w-3" /> {flights.length} active</div>
          </div>
        </div>

        {/* Footer stats */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 p-3 text-center text-xs">
          <div><p className="text-slate-400">Flights</p><p className="font-semibold text-slate-800">{flights.length}</p></div>
          <div><p className="text-slate-400">Danger zones</p><p className="font-semibold text-red-600">{danger}</p></div>
          <div><p className="text-slate-400">Moderate</p><p className="font-semibold text-amber-600">{moderate}</p></div>
          <div><p className="text-slate-400">Pax / yr</p><p className="font-semibold text-slate-800">{airport.passengersM}M</p></div>
        </div>
      </div>
    </Tilt>
  );
}

/* ---------- Page ---------- */
export default function AirportsCompare() {
  const [sim, setSim] = useState<SimulationState>(() => createSimulation());
  const [zonesByCode, setZonesByCode] = useState<Record<string, Zone[]>>(() =>
    Object.fromEntries(airports.map((a) => [a.code, a.zones.map((z) => ({ ...z }))]))
  );
  const [filter, setFilter] = useState<"all" | "BLR" | "HBX" | "IXG">("all");
  const [showFlights, setShowFlights] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [alerts, setAlerts] = useState<{ id: number; airport: string; text: string; tone: "warn" | "danger" }[]>([]);
  const [now, setNow] = useState(new Date());

  // Main simulation tick: step flights + recompute zone noise from flight positions
  useEffect(() => {
    const t = setInterval(() => {
      const dt = 2.5;
      setSim((prev) => stepSimulation(prev, dt));
      setZonesByCode((prev) => {
        const next: Record<string, Zone[]> = {};
        for (const a of airports) {
          const flights = sim.flightsByAirport[a.code] ?? [];
          next[a.code] = (prev[a.code] ?? a.zones).map((z) => ({
            ...z,
            noise: recomputeZoneNoise(z, flights),
          }));
        }
        return next;
      });
      setNow(new Date());
    }, 2500);
    return () => clearInterval(t);
  }, [sim.flightsByAirport]);

  // Alert generator
  useEffect(() => {
    for (const a of airports) {
      const zs = zonesByCode[a.code] ?? a.zones;
      const peak = Math.max(...zs.map((z) => z.noise));
      if (peak >= 95 && Math.random() < 0.3) {
        const tone: "warn" | "danger" = peak >= 105 ? "danger" : "warn";
        const zone = zs.reduce((p, c) => c.noise > p.noise ? c : p, zs[0]);
        setAlerts((arr) =>
          [{ id: Date.now() + Math.random(), airport: a.code, text: `${a.code} · ${zone.name} peak ${Math.round(peak)} dB ${tone === "danger" ? "— EMERGENCY threshold" : "alert"}`, tone }, ...arr].slice(0, 8)
        );
      }
    }
    // eslint-disable-next-line
  }, [zonesByCode]);

  const allFlights = useMemo(() => Object.values(sim.flightsByAirport).flat(), [sim.flightsByAirport]);
  const visibleAirports = useMemo(
    () => (filter === "all" ? airports : airports.filter((a) => a.code === filter)),
    [filter]
  );

  const phase = sim.trafficPhase;
  const phaseColor =
    phase === "Night Curfew" ? "text-violet-700 bg-violet-100" :
    phase === "Morning Rush" || phase === "Evening Rush" ? "text-red-700 bg-red-100" :
    "text-sky-700 bg-sky-100";

  // Comparison table rows
  const compareRows = airports.map((a) => {
    const zs = zonesByCode[a.code] ?? a.zones;
    const peak = Math.max(...zs.map((z) => z.noise));
    const avg = Math.round(zs.reduce((s, z) => s + z.noise, 0) / zs.length);
    const danger = zs.filter((z) => z.noise >= 90).length;
    const apFlights = (sim.flightsByAirport[a.code] ?? []).length;
    return { ...a, peak, avg, danger, flights: apFlights, level: sim.trafficLevel[a.code] ?? 0 };
  });
  const worstNoise = Math.max(...compareRows.map((r) => r.peak));

  return (
    <Shell title="Karnataka Airports · Live Comparison" subtitle="Real-time noise derived from aircraft positions — BLR · HBX · IXG">
      {/* Time + phase bar */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Clock className="h-3.5 w-3.5" /> Current time</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Activity className="h-3.5 w-3.5" /> Traffic phase</p>
          <p className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${phaseColor}`}>{phase}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Compass className="h-3.5 w-3.5" /> Wind direction</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{sim.windDir}°</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Plane className="h-3.5 w-3.5" /> Tracked aircraft</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{allFlights.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Gauge className="h-3.5 w-3.5" /> System load</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round((Object.values(sim.trafficLevel).reduce((a, b) => a + b, 0) / 3) * 100)}%</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["all", "BLR", "HBX", "IXG"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-[#202A36] text-white" : "border border-slate-200 bg-white text-gray-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "All airports" : f}
            </button>
          ))}
        </div>
        <span className="mx-2 h-5 w-px bg-slate-200" />
        <button
          onClick={() => setShowZones((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${showZones ? "bg-sky-500 text-white" : "border border-slate-200 bg-white text-gray-600"}`}
        >
          {showZones ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />} Noise zones
        </button>
        <button
          onClick={() => setShowFlights((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${showFlights ? "bg-sky-500 text-white" : "border border-slate-200 bg-white text-gray-600"}`}
        >
          <Plane className="h-3.5 w-3.5" /> Aircraft
        </button>
        <span className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Simulation tick 2.5s
        </span>
      </div>

      {/* Maps grid */}
      <div className={`grid gap-6 ${filter === "all" ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1"}`}>
        {visibleAirports.map((a) => (
          <AirportMap
            key={a.code}
            airport={a}
            zones={zonesByCode[a.code] ?? a.zones}
            flights={sim.flightsByAirport[a.code] ?? []}
            activeRunway={sim.activeRunways[a.code]}
            showFlights={showFlights}
            showZones={showZones}
            windDir={sim.windDir}
            trafficLevel={sim.trafficLevel[a.code] ?? 0}
          />
        ))}
      </div>

      {/* Alerts */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Live Noise Alerts</h3>
          <span className="ml-auto text-xs text-slate-400">last {alerts.length} events</span>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400">No active alerts. All three airports within safe parameters.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${a.tone === "danger" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${a.tone === "danger" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>
                  {a.tone === "danger" ? <AlertTriangle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </span>
                {a.text}
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium">{a.airport}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-sky-500" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Side-by-side Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-2">Airport</th>
                <th className="py-2">City</th>
                <th className="py-2">Daily mvmts</th>
                <th className="py-2">Avg dB</th>
                <th className="py-2">Peak dB</th>
                <th className="py-2">Active RWY</th>
                <th className="py-2">Live flights</th>
                <th className="py-2 w-40">Noise vs peak</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => {
                const m = statusMeta[statusFromNoise(r.peak)];
                const rwy = sim.activeRunways[r.code];
                return (
                  <tr key={r.code} className="border-b border-slate-50">
                    <td className="py-3"><span className="rounded-lg bg-sky-500 px-2 py-0.5 text-xs font-bold text-white">{r.code}</span></td>
                    <td className="py-3 text-slate-700">{r.city}</td>
                    <td className="py-3 text-slate-600">{r.dailyMovements}</td>
                    <td className="py-3 font-semibold text-slate-900">{r.avg} dB</td>
                    <td className="py-3 font-semibold" style={{ color: m.hex }}>{Math.round(r.peak)} dB</td>
                    <td className="py-3 text-slate-700">{rwy?.name}/{rwy?.reciprocal}</td>
                    <td className="py-3 text-slate-700">{r.flights}</td>
                    <td className="py-3">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${(r.peak / worstNoise) * 100}%`, backgroundColor: m.hex }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live aircraft list */}
      <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Plane className="h-5 w-5 text-sky-500" />
          <h3 className="font-semibold text-gray-900 dark:text-slate-100">Live Aircraft in Karnataka Airspace</h3>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{allFlights.length} tracked</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allFlights.slice(0, 12).map((f) => {
            const heavy = acousticsOf(f.aircraft).heavy;
            const phaseColor =
              f.phase === "Takeoff" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300" :
              f.phase === "Climb" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
              f.phase === "Descent" || f.phase === "Approach" ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300" :
              f.phase === "Landed" ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" :
              "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300";
            const noise = Math.round(flightContribution(f, airports.find((a) => a.code === f.airportCode)!.zones[0]));
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ backgroundColor: f.airline.color + "22", color: f.airline.color }}>
                  <Plane className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {f.callsign}
                    {heavy && <span className="rounded bg-red-500 px-1 py-0.5 text-[8px] font-bold text-white">HEAVY</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{f.airline.name} · {f.aircraft}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{f.from} → {f.to}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${phaseColor}`}>{f.phase}</span>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{f.altitude.toLocaleString()} ft · {f.groundSpeed} kt</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">RWY {f.runway} · {f.airportCode}</p>
                  {noise > 0 && <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">{noise} dB</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
