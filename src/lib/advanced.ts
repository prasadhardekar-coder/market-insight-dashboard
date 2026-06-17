// Extended data simulations for advanced features

export interface Flight {
  id: string;
  flight: string;
  airline: string;
  type: "Departure" | "Arrival";
  gate: string;
  runway: string;
  status: "On Time" | "Boarding" | "Departed" | "Landed" | "Delayed";
  time: string;
  aircraft: string;
  noiseImpact: number; // dB est
  co2: number; // kg
}

const airlines = ["IndiGo", "Air India", "Vistara", "Lufthansa", "Emirates", "Qatar", "Singapore Air"];
const aircraft = ["A320neo", "B737-800", "A350-900", "B777-300ER", "A380", "B787-9", "ATR-72"];
const cities = ["Delhi", "Mumbai", "Singapore", "Dubai", "London", "Frankfurt", "Doha", "Bangkok", "Tokyo"];

function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function pad(n: number) { return n.toString().padStart(2, "0"); }

export function genFlights(n = 10): Flight[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const ac = pick(aircraft);
    const noise = ac.startsWith("A380") ? 108 : ac.startsWith("B777") ? 102 : ac.startsWith("ATR") ? 78 : 92 + Math.random() * 8;
    const co2 = ac.startsWith("A380") ? 38000 : ac.startsWith("ATR") ? 4200 : 18000 + Math.random() * 9000;
    const t = new Date(now.getTime() + (i - 4) * 1000 * 60 * 12);
    return {
      id: "F" + (1000 + i),
      flight: pick(["6E", "AI", "UK", "LH", "EK", "QR", "SQ"]) + Math.floor(100 + Math.random() * 899),
      airline: pick(airlines),
      type: Math.random() > 0.5 ? "Departure" : "Arrival",
      gate: "G" + Math.floor(1 + Math.random() * 22),
      runway: "RWY" + (Math.random() > 0.5 ? "1" : "2"),
      status: pick(["On Time", "Boarding", "On Time", "Delayed", "On Time"]),
      time: `${pad(t.getHours())}:${pad(t.getMinutes())}`,
      aircraft: ac + " · " + pick(cities),
      noiseImpact: Math.round(noise),
      co2: Math.round(co2),
    };
  });
}

// Sensor health (battery, signal, uptime)
export interface SensorNode {
  id: string;
  zone: string;
  battery: number;
  signal: number;
  uptime: string;
  status: "online" | "degraded" | "offline";
  lastSeen: string;
  firmware: string;
}

export function genSensorNodes(): SensorNode[] {
  const zones = ["Runway 1", "Runway 2", "Terminal A", "Apron", "Residential Edge", "Cargo Hub", "ATC Tower", "Perimeter N", "Perimeter S"];
  return zones.map((z, i) => {
    const battery = Math.round(30 + Math.random() * 70);
    const signal = Math.round(40 + Math.random() * 60);
    const offline = Math.random() < 0.08;
    const degraded = !offline && (battery < 35 || signal < 55);
    return {
      id: "NODE-" + (101 + i),
      zone: z,
      battery,
      signal,
      uptime: `${Math.floor(2 + Math.random() * 60)}d ${Math.floor(Math.random() * 24)}h`,
      status: offline ? "offline" : degraded ? "degraded" : "online",
      lastSeen: offline ? `${Math.floor(2 + Math.random() * 30)}m ago` : "just now",
      firmware: `v${Math.floor(2 + Math.random() * 3)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
    };
  });
}

// Weather (impacts noise propagation)
export interface Weather {
  windSpeed: number;
  windDir: number; // 0-359
  windDirLabel: string;
  visibility: number; // km
  temp: number;
  pressure: number;
  condition: "Clear" | "Cloudy" | "Light Rain" | "Foggy" | "Windy";
  noisePropagation: "Reduced" | "Normal" | "Amplified";
}

const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export function genWeather(): Weather {
  const ws = Math.round(4 + Math.random() * 24);
  const dir = Math.round(Math.random() * 359);
  const cond = ws > 22 ? "Windy" : ws < 6 ? "Foggy" : (["Clear", "Cloudy", "Light Rain", "Clear"] as const)[Math.floor(Math.random() * 4)];
  return {
    windSpeed: ws,
    windDir: dir,
    windDirLabel: dirs[Math.round(dir / 45) % 8],
    visibility: Math.round(2 + Math.random() * 18),
    temp: Math.round(22 + Math.random() * 14),
    pressure: Math.round(1005 + Math.random() * 18),
    condition: cond,
    noisePropagation: cond === "Foggy" ? "Amplified" : cond === "Light Rain" ? "Reduced" : "Normal",
  };
}

// Anomaly detection (rolling z-score)
export interface Anomaly {
  id: string;
  zone: string;
  value: number;
  baseline: number;
  zScore: number;
  severity: "low" | "medium" | "high";
  time: string;
  reason: string;
}

const reasons = [
  "Unscheduled departure detected",
  "Sustained ground noise above baseline",
  "Engine test outside maintenance window",
  "Sudden CO₂ spike near apron",
  "Sensor reading deviates 3σ from norm",
  "Pattern matches historical congestion event",
];

export function genAnomalies(): Anomaly[] {
  return Array.from({ length: 4 }, (_, i) => {
    const baseline = 65 + Math.random() * 15;
    const value = baseline + 15 + Math.random() * 25;
    const z = (value - baseline) / 6;
    return {
      id: "AN-" + (200 + i),
      zone: ["Runway 2", "Cargo Hub", "Apron", "Runway 1"][i % 4],
      value: Math.round(value),
      baseline: Math.round(baseline),
      zScore: Math.round(z * 10) / 10,
      severity: z > 4 ? "high" : z > 2.5 ? "medium" : "low",
      time: `${Math.floor(Math.random() * 60)}m ago`,
      reason: reasons[i % reasons.length],
    };
  });
}

// Carbon calculator
export function carbonFromFlight(aircraft: string, distanceKm: number) {
  const factor =
    aircraft.includes("A380") ? 12.5 :
    aircraft.includes("B777") ? 10.2 :
    aircraft.includes("B787") ? 7.8 :
    aircraft.includes("A350") ? 7.5 :
    aircraft.includes("ATR") ? 3.4 : 6.5; // kg CO2 per km
  return Math.round(factor * distanceKm);
}

// Live ticker events
export const tickerEvents = [
  "WHO 2025: long-term exposure above 55 dB raises cardiovascular risk",
  "Runway 2 noise trending +8% vs last week",
  "Cargo Hub CO₂ within safe limits",
  "Night curfew compliance: 96% this week",
  "Predictive engine confidence: 87%",
  "Drone sensor patrol scheduled at 18:00",
];
