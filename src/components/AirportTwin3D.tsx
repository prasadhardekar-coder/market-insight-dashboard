import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Zone } from "../lib/data";
import { statusFromNoise, statusMeta } from "../lib/data";

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Runways */}
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[0, 0.01, 0]}>
        <planeGeometry args={[26, 2.4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, -0.4]} position={[1, 0.02, 4]}>
        <planeGeometry args={[22, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Runway stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0.2]} position={[-10 + i * 2.5, 0.03, 0]}>
          <planeGeometry args={[1.1, 0.18]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
      {/* Terminal building */}
      <mesh position={[-8, 0.8, -6]} castShadow>
        <boxGeometry args={[6, 1.6, 2.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <Text position={[-8, 2, -6]} fontSize={0.5} color="#94a3b8">Terminal A</Text>
    </>
  );
}

function Plane({ start, end, speed, color = "#e2e8f0" }: { start: [number, number, number]; end: [number, number, number]; speed: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(Math.random());

  useFrame((_, dt) => {
    t.current += dt * speed * 0.1;
    if (t.current > 1) t.current = 0;
    const p = t.current;
    const x = start[0] + (end[0] - start[0]) * p;
    const z = start[2] + (end[2] - start[2]) * p;
    const y = start[1] + (end[1] - start[1]) * p + Math.sin(p * Math.PI) * 1.2;
    if (ref.current) {
      ref.current.position.set(x, y, z);
      ref.current.lookAt(end[0], end[1], end[2]);
    }
  });

  return (
    <group ref={ref}>
      {/* Fuselage */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 12]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Wings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.8, 0.06, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.2, -0.5]}>
        <boxGeometry args={[0.06, 0.45, 0.3]} />
        <meshStandardMaterial color="#0ea5e9" />
      </mesh>
    </group>
  );
}

function NoiseRing({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());
  useFrame((_, dt) => {
    t.current += dt * 0.6;
    if (t.current > 1) t.current = 0;
    if (ref.current) {
      const s = scale * (1 + t.current * 3);
      ref.current.scale.set(s, s, s);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t.current);
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SensorTower({ position, label, status }: { position: [number, number, number]; label: string; status: string }) {
  const color = status === "danger" ? "#ef4444" : status === "moderate" ? "#f59e0b" : "#10b981";
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.4, 8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <Html position={[0, 2.0, 0]} center distanceFactor={10} occlude>
        <div className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

export default function AirportTwin3D({ zones }: { zones: Zone[] }) {
  const [autoRotate, setAutoRotate] = useState(true);

  // Map zones into 3D positions (project lat/lng into local x/z)
  const placed = useMemo(() => {
    const centerLat = 13.201;
    const centerLng = 77.7045;
    const scale = 800;
    return zones.map((z, i) => ({
      ...z,
      pos: [(z.lng - centerLng) * scale, 0, (z.lat - centerLat) * -scale] as [number, number, number],
      idx: i,
    }));
  }, [zones]);

  return (
    <div className="relative h-[34rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm">
      <Canvas shadows camera={{ position: [12, 14, 18], fov: 45 }}>
        <color attach="background" args={["#0b1220"]} />
        <fog attach="fog" args={["#0b1220", 18, 50]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} castShadow />
        <pointLight position={[-10, 10, -10]} intensity={0.4} color="#0ea5e9" />

        <Ground />

        {placed.map((z) => {
          const s = statusFromNoise(z.noise);
          const meta = statusMeta[s];
          return (
            <group key={z.id}>
              <SensorTower position={z.pos} label={`${z.name} · ${z.noise}dB`} status={s} />
              <NoiseRing position={[z.pos[0], 0.05, z.pos[2]]} color={meta.hex} scale={1 + (z.noise - 50) / 25} />
            </group>
          );
        })}

        {/* Moving aircraft */}
        <Plane start={[-14, 0.4, 0]} end={[14, 3.5, -1]} speed={0.7} color="#e2e8f0" />
        <Plane start={[14, 3.0, 4]} end={[-14, 0.4, 5]} speed={0.5} color="#cbd5e1" />
        <Plane start={[-12, 5, -8]} end={[14, 5, 8]} speed={0.35} color="#94a3b8" />

        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={0.5} enablePan={false} minDistance={10} maxDistance={32} />
      </Canvas>

      <button
        onClick={() => setAutoRotate((a) => !a)}
        className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        {autoRotate ? "Pause rotation" : "Auto-rotate"}
      </button>
      <div className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
        🖱 Drag to orbit · Scroll to zoom
      </div>
    </div>
  );
}
