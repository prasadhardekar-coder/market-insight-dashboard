import { useEffect, useRef, useState } from "react";
import { initialZones, tickZone, statusFromNoise, type Zone } from "./data";

export function useSensors(intervalMs = 2000) {
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const prev = useRef<Record<string, number>>({});

  useEffect(() => {
    const t = setInterval(() => {
      setZones((curr) =>
        curr.map((z) => {
          prev.current[z.id] = z.noise;
          return tickZone(z);
        })
      );
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  const maxNoise = Math.max(...zones.map((z) => z.noise));
  const avgNoise = Math.round(zones.reduce((a, z) => a + z.noise, 0) / zones.length);
  const avgCo2 = Math.round(zones.reduce((a, z) => a + z.co2, 0) / zones.length);
  const emergency = maxNoise >= 110;
  const dangerZone = zones.find((z) => z.noise === maxNoise);

  const deltaFor = (id: string, noise: number) => noise - (prev.current[id] ?? noise);

  return { zones, maxNoise, avgNoise, avgCo2, emergency, dangerZone, deltaFor, statusFromNoise };
}
