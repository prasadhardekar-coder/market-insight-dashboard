// Shared simulation engine for AeroSense — Smart Airport Environmental Monitoring

export type ZoneStatus = "safe" | "moderate" | "danger";

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  baseNoise: number; // base dB
  noise: number; // live dB
  co2: number; // ppm
  temp: number; // °C
  humidity: number; // %
}

export function statusFromNoise(db: number): ZoneStatus {
  if (db < 70) return "safe";
  if (db < 90) return "moderate";
  return "danger";
}

export const statusMeta: Record<
  ZoneStatus,
  { label: string; color: string; hex: string; ring: string; bg: string }
> = {
  safe: { label: "Safe", color: "text-emerald-600", hex: "#10b981", ring: "ring-emerald-500", bg: "bg-emerald-50" },
  moderate: { label: "Moderate", color: "text-amber-600", hex: "#f59e0b", ring: "ring-amber-500", bg: "bg-amber-50" },
  danger: { label: "Dangerous", color: "text-red-600", hex: "#ef4444", ring: "ring-red-500", bg: "bg-red-50" },
};

// Centered around a fictional airport layout
export const initialZones: Zone[] = [
  { id: "rwy1", name: "Runway 1", lat: 13.205, lng: 77.705, baseNoise: 88, noise: 88, co2: 540, temp: 31, humidity: 58 },
  { id: "rwy2", name: "Runway 2", lat: 13.198, lng: 77.712, baseNoise: 92, noise: 92, co2: 610, temp: 32, humidity: 55 },
  { id: "term", name: "Terminal A", lat: 13.202, lng: 77.700, baseNoise: 64, noise: 64, co2: 480, temp: 29, humidity: 60 },
  { id: "apron", name: "Apron / Gates", lat: 13.196, lng: 77.703, baseNoise: 76, noise: 76, co2: 520, temp: 30, humidity: 57 },
  { id: "park", name: "Residential Edge", lat: 13.210, lng: 77.698, baseNoise: 52, noise: 52, co2: 430, temp: 28, humidity: 63 },
  { id: "cargo", name: "Cargo Hub", lat: 13.193, lng: 77.709, baseNoise: 81, noise: 81, co2: 590, temp: 31, humidity: 54 },
];

export const airportCenter: [number, number] = [13.201, 77.7045];

// Smoothly evolve a zone's readings
export function tickZone(z: Zone): Zone {
  const wobble = (range: number) => (Math.random() - 0.5) * range;
  const target = z.baseNoise + Math.sin(Date.now() / 5000 + z.lat * 100) * 8;
  const noise = clamp(z.noise + (target - z.noise) * 0.25 + wobble(6), 38, 118);
  return {
    ...z,
    noise: round(noise),
    co2: round(clamp(z.co2 + wobble(20) + (noise - z.baseNoise) * 1.2, 380, 900)),
    temp: round(clamp(z.temp + wobble(0.4), 22, 40), 1),
    humidity: round(clamp(z.humidity + wobble(1.2), 35, 85)),
  };
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
export function round(v: number, dp = 0) {
  const f = Math.pow(10, dp);
  return Math.round(v * f) / f;
}

// Aircraft activity classification (rule-based "AI")
export function classifyActivity(noise: number, delta: number): string {
  if (noise > 105 && delta > 6) return "Jet engine takeoff detected";
  if (noise > 95 && delta > 3) return "Aircraft takeoff in progress";
  if (noise > 90 && delta < -3) return "Landing / reverse thrust detected";
  if (noise > 82) return "Taxiing / ground operations";
  if (noise > 70) return "Apron & vehicle activity";
  return "Ambient airport background";
}

// Simple AI prediction (time + trend based)
export function predictNoise(zones: Zone[]): {
  zone: string;
  in: string;
  expected: number;
  confidence: number;
  message: string;
}[] {
  const hour = new Date().getHours();
  const peak = hour >= 6 && hour <= 10 ? 1.12 : hour >= 17 && hour <= 21 ? 1.08 : 0.96;
  return zones
    .map((z) => {
      const expected = round(clamp(z.noise * peak + (Math.random() * 6 - 2), 40, 120));
      const status = statusFromNoise(expected);
      return {
        zone: z.name,
        in: "10 min",
        expected,
        confidence: round(72 + Math.random() * 24),
        message:
          status === "danger"
            ? `High noise expected near ${z.name} — runway congestion likely`
            : status === "moderate"
            ? `Moderate noise expected near ${z.name}`
            : `${z.name} expected to remain safe`,
      };
    })
    .sort((a, b) => b.expected - a.expected)
    .slice(0, 4);
}

// WHO-style health recommendations
export function healthRecommendation(db: number) {
  if (db < 55)
    return { level: "Safe", color: "text-emerald-600", advice: "No protection needed. Comfortable for prolonged exposure.", exposure: "Unlimited" };
  if (db < 70)
    return { level: "Acceptable", color: "text-lime-600", advice: "Generally safe. Frequent breaks recommended for staff.", exposure: "8+ hours" };
  if (db < 85)
    return { level: "Caution", color: "text-amber-600", advice: "Avoid long exposure. Consider ear protection for ground crew.", exposure: "≤ 4 hours" };
  if (db < 100)
    return { level: "Avoid Long Exposure", color: "text-orange-600", advice: "Hearing protection required. Limit time in zone.", exposure: "≤ 15 min" };
  return { level: "Hearing Risk", color: "text-red-600", advice: "Immediate hearing damage risk. Mandatory PPE & evacuation of non-essential staff.", exposure: "< 1 min" };
}

// Historical / trend mock data
export function genWeeklyTrend() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d) => ({
    day: d,
    avg: round(60 + Math.random() * 18),
    peak: round(92 + Math.random() * 22),
    co2: round(480 + Math.random() * 160),
  }));
}

export function genHourly(seed = 0) {
  return Array.from({ length: 24 }, (_, h) => {
    const peak = h >= 6 && h <= 10 ? 1.2 : h >= 17 && h <= 21 ? 1.15 : 0.85;
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      noise: round(clamp(58 * peak + Math.sin(h + seed) * 10 + Math.random() * 8, 40, 116)),
      co2: round(clamp(460 * peak + Math.random() * 60, 380, 820)),
    };
  });
}

export interface Complaint {
  id: string;
  name: string;
  location: string;
  time: string;
  category: string;
  message: string;
  status: "New" | "Reviewing" | "Resolved";
  hasAudio: boolean;
}

export const seedComplaints: Complaint[] = [
  { id: "C-1042", name: "R. Sharma", location: "Residential Edge", time: "06:24", category: "Early morning takeoff", message: "Loud jet noise woke the entire street before sunrise.", status: "Reviewing", hasAudio: true },
  { id: "C-1041", name: "M. Iyer", location: "North Sector", time: "21:10", category: "Night operations", message: "Continuous aircraft noise during late night hours.", status: "New", hasAudio: false },
  { id: "C-1038", name: "A. Khan", location: "School Zone", time: "10:45", category: "Disturbance", message: "Classes disrupted by repeated overhead flights.", status: "Resolved", hasAudio: true },
];
