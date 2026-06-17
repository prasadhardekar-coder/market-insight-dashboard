// ============================================================
// Realistic AeroSense simulation engine
// - Real Indian airline callsigns (IndiGo 6E, Air India AI, …)
// - Actual route pairs (BLR-DEL, HBX-BOM, …)
// - Time-of-day traffic curve (morning rush / night curfew)
// - Wind-based active runway assignment
// - Arrival/departure altitude profiles (10,000 ft → touch-down)
// - Noise derived from flight positions (not random drift)
// ============================================================

import type { Zone } from "./data";

/* ---------- Airline database (real IATA codes & fleet) ---------- */
export interface Airline {
  code: string;
  name: string;
  color: string;
  fleet: string[];
  intl: boolean;
}

export const AIRLINES: Record<string, Airline> = {
  "6E": { code: "6E", name: "IndiGo",         color: "#2160a8", fleet: ["A320neo", "A321neo"], intl: false },
  "AI": { code: "AI", name: "Air India",      color: "#e4002b", fleet: ["A320neo", "B787-8", "B777-300ER"], intl: true },
  "UK": { code: "UK", name: "Vistara",        color: "#6a1b9a", fleet: ["A320neo", "A321neo", "B787-9"], intl: true },
  "QP": { code: "QP", name: "Akasa Air",      color: "#ff6a13", fleet: ["B737 MAX 8"], intl: false },
  "SG": { code: "SG", name: "SpiceJet",       color: "#e60000", fleet: ["B737-800", "Q400"], intl: false },
  "EK": { code: "EK", name: "Emirates",       color: "#d71921", fleet: ["B777-300ER", "A380-800"], intl: true },
  "SQ": { code: "SQ", name: "Singapore",      color: "#f5a623", fleet: ["A350-900", "B787-10"], intl: true },
  "LH": { code: "LH", name: "Lufthansa",      color: "#05164d", fleet: ["A340-600", "A350-900"], intl: true },
  "QR": { code: "QR", name: "Qatar",          color: "#5c0632", fleet: ["A350-900", "B777-300ER"], intl: true },
  "TG": { code: "TG", name: "Thai Airways",   color: "#6e2585", fleet: ["A350-900", "B787-9"], intl: true },
};

/* ---------- Aircraft acoustic profile ----------
   peakDb   = dB measured ~1 km from flight path at takeoff/climb
   cruiseDb = dB at cruise altitude (35 000 ft)
   radius   = km radius of audible impact on ground */
interface AcousticProfile { peakDb: number; cruiseDb: number; radius: number; heavy: boolean; }

export const AIRCRAFT_PROFILE: Record<string, AcousticProfile> = {
  "A380-800":     { peakDb: 110, cruiseDb: 82, radius: 18, heavy: true },
  "B777-300ER":   { peakDb: 106, cruiseDb: 80, radius: 16, heavy: true },
  "B787-8":       { peakDb: 98,  cruiseDb: 76, radius: 12, heavy: false },
  "B787-9":       { peakDb: 98,  cruiseDb: 76, radius: 12, heavy: false },
  "B787-10":      { peakDb: 99,  cruiseDb: 77, radius: 12, heavy: false },
  "A350-900":     { peakDb: 96,  cruiseDb: 74, radius: 11, heavy: false },
  "A340-600":     { peakDb: 104, cruiseDb: 80, radius: 14, heavy: true },
  "A321neo":      { peakDb: 92,  cruiseDb: 70, radius: 8,  heavy: false },
  "A320neo":      { peakDb: 90,  cruiseDb: 68, radius: 8,  heavy: false },
  "B737-800":     { peakDb: 93,  cruiseDb: 71, radius: 8,  heavy: false },
  "B737 MAX 8":   { peakDb: 91,  cruiseDb: 69, radius: 8,  heavy: false },
  "Q400":         { peakDb: 86,  cruiseDb: 66, radius: 6,  heavy: false },
};
const DEFAULT_PROFILE: AcousticProfile = { peakDb: 92, cruiseDb: 70, radius: 8, heavy: false };

export function acousticsOf(aircraft: string): AcousticProfile {
  return AIRCRAFT_PROFILE[aircraft] ?? DEFAULT_PROFILE;
}

/* ---------- Realistic route database ---------- */
interface Route { to: string; carriers: string[]; freq: number; intl: boolean; }

const BLR_ROUTES: Route[] = [
  { to: "DEL", carriers: ["6E", "AI", "UK", "QP", "SG"], freq: 14, intl: false },
  { to: "BOM", carriers: ["6E", "AI", "UK", "QP", "SG"], freq: 12, intl: false },
  { to: "HYD", carriers: ["6E", "AI", "UK", "QP"],       freq: 9,  intl: false },
  { to: "MAA", carriers: ["6E", "AI", "UK", "SG"],       freq: 8,  intl: false },
  { to: "CCU", carriers: ["6E", "AI", "UK", "SG"],       freq: 6,  intl: false },
  { to: "GOI", carriers: ["6E", "AI", "UK"],             freq: 5,  intl: false },
  { to: "COK", carriers: ["6E", "AI", "SG"],             freq: 5,  intl: false },
  { to: "TRV", carriers: ["6E", "AI"],                   freq: 4,  intl: false },
  { to: "AMD", carriers: ["6E", "AI", "QP"],             freq: 3,  intl: false },
  { to: "PNQ", carriers: ["6E", "AI", "UK"],             freq: 4,  intl: false },
  { to: "DXB", carriers: ["EK", "6E", "AI"],             freq: 5,  intl: true },
  { to: "AUH", carriers: ["6E", "AI"],                   freq: 3,  intl: true },
  { to: "SIN", carriers: ["SQ", "6E", "AI"],             freq: 3,  intl: true },
  { to: "BKK", carriers: ["TG", "6E"],                   freq: 2,  intl: true },
  { to: "LHR", carriers: ["AI", "UK"],                   freq: 2,  intl: true },
  { to: "FRA", carriers: ["LH"],                         freq: 1,  intl: true },
  { to: "DOH", carriers: ["QR"],                         freq: 2,  intl: true },
];

const HBX_ROUTES: Route[] = [
  { to: "BLR", carriers: ["6E", "AI"],  freq: 4, intl: false },
  { to: "BOM", carriers: ["6E", "AI"],  freq: 3, intl: false },
  { to: "DEL", carriers: ["6E"],        freq: 2, intl: false },
  { to: "MAA", carriers: ["6E"],        freq: 2, intl: false },
  { to: "HYD", carriers: ["6E", "AI"],  freq: 3, intl: false },
];

const IXG_ROUTES: Route[] = [
  { to: "BOM", carriers: ["6E", "AI", "SG"], freq: 4, intl: false },
  { to: "BLR", carriers: ["6E", "AI"],       freq: 4, intl: false },
  { to: "HYD", carriers: ["6E"],             freq: 2, intl: false },
  { to: "MAA", carriers: ["6E"],             freq: 2, intl: false },
];

/* ---------- Airport with realistic ops profile ---------- */
export interface Airport {
  code: string;
  icao: string;
  name: string;
  city: string;
  center: [number, number];       // lat, lng
  elevation: number;              // ft
  runways: Runway[];
  passengersM: number;
  dailyMovements: number;         // avg daily
  category: "International" | "Domestic";
  routes: Route[];
  zones: Zone[];
  // live state (populated by engine)
  activeRunway?: string;
  trafficPhase?: TrafficPhase;
  trafficLevel?: number;          // 0-1
}

export interface Runway {
  name: string;        // e.g. "09L"
  reciprocal: string;  // e.g. "27R"
  heading: number;     // magnetic heading 0-359
  length: number;      // m
  ils: boolean;        // instrument landing system
}

export type TrafficPhase = "Night Curfew" | "Early Morning" | "Morning Rush" | "Midday" | "Afternoon" | "Evening Rush" | "Night";

/* ---- Karnataka airports ---- */
const blrZones: Zone[] = [
  { id: "blr-rwy09L", name: "Runway 09L / 27R threshold", lat: 13.1986, lng: 77.6966, baseNoise: 68, noise: 68, co2: 520, temp: 28, humidity: 62 },
  { id: "blr-rwy09R", name: "Runway 09R / 27L threshold", lat: 13.2050, lng: 77.7010, baseNoise: 66, noise: 66, co2: 510, temp: 28, humidity: 61 },
  { id: "blr-t1",     name: "Terminal 1",                 lat: 13.1979, lng: 77.7064, baseNoise: 64, noise: 64, co2: 490, temp: 27, humidity: 64 },
  { id: "blr-t2",     name: "Terminal 2 (Garden)",        lat: 13.2010, lng: 77.7050, baseNoise: 63, noise: 63, co2: 485, temp: 27, humidity: 64 },
  { id: "blr-apron",  name: "Apron / Bay",                lat: 13.1995, lng: 77.7020, baseNoise: 72, noise: 72, co2: 540, temp: 28, humidity: 62 },
  { id: "blr-cargo",  name: "BIAL Cargo Village",         lat: 13.1880, lng: 77.7180, baseNoise: 70, noise: 70, co2: 560, temp: 28, humidity: 60 },
  { id: "blr-dev",    name: "Devanahalli town",           lat: 13.2470, lng: 77.7110, baseNoise: 46, noise: 46, co2: 420, temp: 26, humidity: 67 },
  { id: "blr-vij",    name: "Vijayapura village",         lat: 13.2850, lng: 77.8050, baseNoise: 40, noise: 40, co2: 410, temp: 26, humidity: 68 },
];

const hbxZones: Zone[] = [
  { id: "hbx-rwy",   name: "Runway 08 / 26 threshold", lat: 15.3617, lng: 75.0770, baseNoise: 56, noise: 56, co2: 440, temp: 31, humidity: 55 },
  { id: "hbx-term",  name: "Terminal",                 lat: 15.3625, lng: 75.0846, baseNoise: 52, noise: 52, co2: 420, temp: 30, humidity: 57 },
  { id: "hbx-apron", name: "Apron",                    lat: 15.3622, lng: 75.0820, baseNoise: 58, noise: 58, co2: 450, temp: 31, humidity: 56 },
  { id: "hbx-vid",   name: "Vidyanagar residential",   lat: 15.3540, lng: 75.0780, baseNoise: 38, noise: 38, co2: 400, temp: 30, humidity: 58 },
  { id: "hbx-gok",   name: "Gokul Road",               lat: 15.3700, lng: 75.0910, baseNoise: 40, noise: 40, co2: 405, temp: 30, humidity: 58 },
];

const ixgZones: Zone[] = [
  { id: "ixg-rwy",   name: "Runway 08 / 26 threshold", lat: 15.9586, lng: 74.6110, baseNoise: 54, noise: 54, co2: 430, temp: 29, humidity: 60 },
  { id: "ixg-term",  name: "New Integrated Terminal",  lat: 15.9595, lng: 74.6180, baseNoise: 50, noise: 50, co2: 415, temp: 28, humidity: 62 },
  { id: "ixg-apron", name: "Apron",                    lat: 15.9590, lng: 74.6155, baseNoise: 56, noise: 56, co2: 435, temp: 28, humidity: 61 },
  { id: "ixg-sam",   name: "Sambra village",           lat: 15.9650, lng: 74.6260, baseNoise: 36, noise: 36, co2: 395, temp: 28, humidity: 63 },
  { id: "ixg-camp",  name: "Belagavi cantonment",      lat: 15.8600, lng: 74.5000, baseNoise: 34, noise: 34, co2: 390, temp: 28, humidity: 63 },
];

export const airports: Airport[] = [
  {
    code: "BLR", icao: "VOBL",
    name: "Kempegowda International Airport",
    city: "Bengaluru",
    center: [13.1986, 77.7066],
    elevation: 3002,
    runways: [
      { name: "09L", reciprocal: "27R", heading: 93,  length: 4000, ils: true },
      { name: "09R", reciprocal: "27L", heading: 93,  length: 4000, ils: true },
      { name: "27L", reciprocal: "09R", heading: 273, length: 4000, ils: true },
      { name: "27R", reciprocal: "09L", heading: 273, length: 4000, ils: true },
    ],
    passengersM: 37.5,
    dailyMovements: 720,
    category: "International",
    routes: BLR_ROUTES,
    zones: blrZones,
  },
  {
    code: "HBX", icao: "VOHB",
    name: "Hubballi Airport",
    city: "Hubballi",
    center: [15.3617, 75.0848],
    elevation: 2171,
    runways: [
      { name: "08", reciprocal: "26", heading: 78,  length: 2300, ils: false },
      { name: "26", reciprocal: "08", heading: 258, length: 2300, ils: false },
    ],
    passengersM: 0.95,
    dailyMovements: 38,
    category: "Domestic",
    routes: HBX_ROUTES,
    zones: hbxZones,
  },
  {
    code: "IXG", icao: "VOBM",
    name: "Belagavi (Sambra) Airport",
    city: "Belagavi",
    center: [15.9586, 74.6183],
    elevation: 2487,
    runways: [
      { name: "08", reciprocal: "26", heading: 83,  length: 2300, ils: false },
      { name: "26", reciprocal: "08", heading: 263, length: 2300, ils: false },
    ],
    passengersM: 1.30,
    dailyMovements: 46,
    category: "Domestic",
    routes: IXG_ROUTES,
    zones: ixgZones,
  },
];

export const airportByCode = (code: string) => airports.find((a) => a.code === code) ?? airports[0];

/* ============================================================
   Time-of-day model
   ============================================================ */
export function trafficPhaseFor(hour: number): TrafficPhase {
  if (hour < 5) return "Night Curfew";
  if (hour < 7) return "Early Morning";
  if (hour < 10) return "Morning Rush";
  if (hour < 13) return "Midday";
  if (hour < 17) return "Afternoon";
  if (hour < 20) return "Evening Rush";
  if (hour < 23) return "Night";
  return "Night Curfew";
}

/** 0..1 scale.  Night curfew is heavily suppressed. */
export function trafficLevelFor(hour: number): number {
  const phase = trafficPhaseFor(hour);
  switch (phase) {
    case "Night Curfew":  return 0.06;
    case "Early Morning": return 0.45;
    case "Morning Rush":  return 1.00;
    case "Midday":        return 0.80;
    case "Afternoon":     return 0.75;
    case "Evening Rush":  return 0.95;
    case "Night":         return 0.55;
  }
}

/* ============================================================
   Runway selection based on wind
   ============================================================ */
export function selectActiveRunway(airport: Airport, windDirDeg: number): Runway {
  // Pick the runway whose heading is closest to (windDir + 180) — aircraft land INTO the wind
  const landInto = (windDirDeg + 180) % 360;
  let best = airport.runways[0];
  let bestDiff = 999;
  for (const r of airport.runways) {
    const diff = Math.min(Math.abs(r.heading - landInto), 360 - Math.abs(r.heading - landInto));
    if (diff < bestDiff) { bestDiff = diff; best = r; }
  }
  return best;
}

/* ============================================================
   Live flight model with realistic lifecycle
   ============================================================ */
export type FlightPhase = "Taxi" | "Takeoff" | "Climb" | "Cruise" | "Descent" | "Approach" | "Landed";

export interface LiveFlight {
  id: string;
  callsign: string;       // e.g. "6E 2341"
  airline: Airline;
  aircraft: string;       // e.g. "A320neo"
  type: "Departure" | "Arrival" | "Overflight";
  from: string;
  to: string;
  airportCode: string;
  runway: string;         // e.g. "09L"
  lat: number;
  lng: number;
  heading: number;        // 0-359, direction of travel
  altitude: number;       // ft
  groundSpeed: number;    // kt
  phase: FlightPhase;
  progress: number;       // 0..1 along its corridor
}

/* ---- Helpers ---- */
const rand = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function randFlightNumber(prefix: string): string {
  // Realistic Indian flight numbers: 1000–7999 for domestic, 100–499 for intl
  const n = 1000 + Math.floor(Math.random() * 6999);
  return `${prefix} ${n}`;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* ---- Spawn ---- */
/** Distance in degrees at which we place flights on the edge of our viewport. */
const SPAWN_DIST_DEG = 0.35; // ~38 km

export function spawnFlight(airport: Airport, activeRwy: Runway, type: "Departure" | "Arrival" | "Overflight"): LiveFlight {
  // Pick a route weighted by frequency
  const pool: Route[] = [];
  airport.routes.forEach((r) => { for (let i = 0; i < r.freq; i++) pool.push(r); });
  const route = rand(pool);
  const carrierCode = rand(route.carriers);
  const carrier = AIRLINES[carrierCode] ?? AIRLINES["6E"];
  // Aircraft type: heavy widebody only on intl routes + BLR
  let aircraft: string;
  if (airport.code === "BLR" && route.intl) {
    const wide = carrier.fleet.filter((f) => acousticsOf(f).heavy);
    aircraft = wide.length ? rand(wide) : rand(carrier.fleet);
  } else {
    const narrow = carrier.fleet.filter((f) => !acousticsOf(f).heavy);
    aircraft = narrow.length ? rand(narrow) : rand(carrier.fleet);
  }

  // Corridor angle: approach uses reciprocal heading (aircraft flies along runway heading toward threshold)
  const approachAngle = (activeRwy.heading + 180) % 360; // direction FROM which aircraft arrive
  const departureAngle = activeRwy.heading;               // direction aircraft depart toward

  let lat: number, lng: number, heading: number, altitude: number, phase: FlightPhase, groundSpeed: number, progress: number;
  const rad = (deg: number) => (deg * Math.PI) / 180;

  if (type === "Arrival") {
    heading = activeRwy.heading; // flying along runway heading
    lat = airport.center[0] + Math.cos(rad(approachAngle)) * SPAWN_DIST_DEG;
    lng = airport.center[1] + Math.sin(rad(approachAngle)) * SPAWN_DIST_DEG;
    altitude = 10000 + Math.floor(Math.random() * 3000);
    phase = "Descent";
    groundSpeed = 220 + Math.floor(Math.random() * 40);
    progress = 0;
  } else if (type === "Departure") {
    heading = departureAngle;
    // start near runway threshold
    lat = airport.center[0] + Math.cos(rad(departureAngle)) * 0.01;
    lng = airport.center[1] + Math.sin(rad(departureAngle)) * 0.01;
    altitude = 50;
    phase = "Takeoff";
    groundSpeed = 140 + Math.floor(Math.random() * 20);
    progress = 0;
  } else {
    // Overflight: random crossing
    heading = Math.floor(Math.random() * 360);
    const startAngle = (heading + 180) % 360;
    lat = airport.center[0] + Math.cos(rad(startAngle)) * SPAWN_DIST_DEG * 1.2;
    lng = airport.center[1] + Math.sin(rad(startAngle)) * SPAWN_DIST_DEG * 1.2;
    altitude = 32000 + Math.floor(Math.random() * 8000);
    phase = "Cruise";
    groundSpeed = 440 + Math.floor(Math.random() * 60);
    progress = 0;
  }

  return {
    id: `${airport.code}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    callsign: randFlightNumber(carrier.code),
    airline: carrier,
    aircraft,
    type,
    from: type === "Departure" ? airport.code : route.to,
    to: type === "Departure" ? route.to : airport.code,
    airportCode: airport.code,
    runway: activeRwy.name,
    lat, lng, heading, altitude, groundSpeed, phase, progress,
  };
}

/* ---- Tick ---- */
/** Advance a flight by `dt` seconds. Returns null if the flight has completed. */
export function tickFlight(f: LiveFlight, dt: number): LiveFlight | null {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const airport = airportByCode(f.airportCode);

  // Ground speed -> degrees per second (approx)
  // 1 kt ≈ 1.852 km/h → 0.514 m/s. 1 deg lat ≈ 111 km.
  const degPerSec = (f.groundSpeed * 0.5144) / 111000;

  let { lat, lng, heading, altitude, phase, groundSpeed, progress } = f;

  // Move forward
  lat += Math.cos(rad(heading)) * degPerSec * dt;
  lng += Math.sin(rad(heading)) * degPerSec * dt;
  progress += dt / 120; // 2-min lifecycle

  // Phase transitions with realistic altitude profiles
  const dist = haversineKm(lat, lng, airport.center[0], airport.center[1]);

  if (f.type === "Arrival") {
    // Altitude proportional to distance from airport (3° glide slope)
    // 3° glide: 318 ft per nautical mile ≈ 170 ft per km
    altitude = Math.max(0, Math.round(dist * 170));
    if (dist < 3 && altitude < 500) phase = "Approach";
    if (dist < 0.6 && altitude < 50) { phase = "Landed"; }
    groundSpeed = Math.max(130, 240 - (1 - dist / 40) * 90);
  } else if (f.type === "Departure") {
    if (phase === "Takeoff" && dist > 1) phase = "Climb";
    if (phase === "Climb") {
      altitude = Math.min(35000, altitude + 1800 * (dt / 2));
      groundSpeed = Math.min(460, groundSpeed + 8 * dt);
      if (altitude > 10000) phase = "Cruise";
    }
  } else {
    // Overflight: altitude stable
    groundSpeed = f.groundSpeed;
  }

  // Retire: landed OR exited airspace (> 50 km from airport)
  if (phase === "Landed") return null;
  if (dist > 55 && f.type !== "Overflight") return null;
  if (f.type === "Overflight" && dist > 80) return null;

  return { ...f, lat, lng, altitude: Math.max(0, Math.round(altitude)), groundSpeed: Math.round(groundSpeed), phase, progress };
}

/* ============================================================
   Noise engine — zone dB derived from live flight positions
   ============================================================ */
/**
 * Compute the instantaneous dB contribution of a flight at a zone.
 * Returns 0 if outside audible radius.
 */
export function flightContribution(f: LiveFlight, z: { lat: number; lng: number }): number {
  const profile = acousticsOf(f.aircraft);
  const dist = haversineKm(f.lat, f.lng, z.lat, z.lng);
  if (dist > profile.radius) return 0;

  let sourceDb = profile.cruiseDb;
  if (f.phase === "Takeoff") sourceDb = profile.peakDb + 2;
  else if (f.phase === "Climb") sourceDb = profile.peakDb - 2;
  else if (f.phase === "Descent" || f.phase === "Approach") sourceDb = profile.peakDb - 6;
  else if (f.phase === "Landed" || f.phase === "Taxi") sourceDb = profile.peakDb - 14;

  // Inverse-distance attenuation (roughly 6 dB per doubling of distance)
  const atten = 20 * Math.log10(Math.max(0.1, dist + 0.2));
  return Math.max(0, sourceDb - atten);
}

/**
 * Update every zone's live noise from the ambient baseline + flight contributions.
 * Adds a tiny amount of background jitter so the display feels alive.
 */
export function recomputeZoneNoise(zone: Zone, flights: LiveFlight[]): number {
  let peak = zone.baseNoise + (Math.random() - 0.5) * 1.2; // small ambient jitter
  for (const f of flights) {
    const c = flightContribution(f, zone);
    if (c > peak) peak = c; // take the loudest contributor (not sum — dB is logarithmic)
  }
  return Math.round(peak * 10) / 10;
}

/* ============================================================
   Simulation orchestrator
   ============================================================ */
export interface SimulationState {
  flightsByAirport: Record<string, LiveFlight[]>;
  activeRunways: Record<string, Runway>;
  trafficLevel: Record<string, number>;
  trafficPhase: TrafficPhase;
  windDir: number;
}

export function createSimulation(): SimulationState {
  const hour = new Date().getHours();
  const windDir = Math.round(Math.random() * 360);
  return {
    flightsByAirport: Object.fromEntries(airports.map((a) => [a.code, []])),
    activeRunways: Object.fromEntries(airports.map((a) => [a.code, selectActiveRunway(a, windDir)])),
    trafficLevel: Object.fromEntries(airports.map((a) => [a.code, trafficLevelFor(hour)])),
    trafficPhase: trafficPhaseFor(hour),
    windDir,
  };
}

/** Target concurrent flights per airport at a given traffic level */
function targetFlights(airport: Airport, level: number): number {
  // Scale daily movements into concurrent aircraft visible on map
  // BLR: 720/day → peak ~40 concurrent; HBX 38/day → ~4; IXG 46/day → ~5
  const base = Math.round((airport.dailyMovements / 24) * 1.4);
  return Math.max(1, Math.round(base * level));
}

/** Advance one simulation step (dt seconds). Mutates & returns new state. */
export function stepSimulation(state: SimulationState, dt: number): SimulationState {
  const hour = new Date().getHours();
  const phase = trafficPhaseFor(hour);
  const level = trafficLevelFor(hour);

  const nextFlights: Record<string, LiveFlight[]> = {};
  for (const a of airports) {
    // Tick existing flights
    const surviving: LiveFlight[] = [];
    for (const f of state.flightsByAirport[a.code] ?? []) {
      const t = tickFlight(f, dt);
      if (t) surviving.push(t);
    }
    // Spawn new flights up to target
    const target = targetFlights(a, level);
    const active = state.activeRunways[a.code];
    while (surviving.length < target) {
      // mix arrivals/departures; curfew → only departures (or very few)
      const roll = Math.random();
      const type: "Departure" | "Arrival" | "Overflight" =
        phase === "Night Curfew" ? (roll < 0.8 ? "Departure" : "Arrival")
        : roll < 0.45 ? "Arrival"
        : roll < 0.9  ? "Departure"
        : "Overflight";
      surviving.push(spawnFlight(a, active, type));
    }
    nextFlights[a.code] = surviving;
  }

  return {
    flightsByAirport: nextFlights,
    activeRunways: state.activeRunways,
    trafficLevel: Object.fromEntries(airports.map((a) => [a.code, level])),
    trafficPhase: phase,
    windDir: state.windDir,
  };
}
