// StationFloorplan — continuous 2×2 floorplan with hallway overlay.
// Bug fix: CrewVisits reports the visiting agentId so home rooms can hide their sprite.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CREW } from "@/lib/crew";
import { CrewSprite } from "./CrewSprite";

type RoomId = "command" | "security" | "workshop" | "archive";

const ROOM_CENTERS: Record<RoomId, { x: number; y: number }> = {
  command:  { x: 25, y: 28 },
  security: { x: 75, y: 28 },
  workshop: { x: 25, y: 78 },
  archive:  { x: 75, y: 78 },
};

const AGENT_HOME: Record<string, RoomId> = {
  monkey: "command",
  lifesupport: "security",
  engineer: "workshop",
  archivist: "archive",
};

const ROOM_KEYS: RoomId[] = ["command", "security", "workshop", "archive"];
const HUB = { x: 50, y: 50 };

interface VisitorState {
  id: string;
  agentId: string;
  from: RoomId;
  to: RoomId;
  phase: "outbound" | "stay" | "return";
}

// ── Bug 2 fix: hub centre dot is now a subtle violet, NOT bright cyan ─────
function HallwayOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="floor-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="oklch(0.30 0.10 295 / 0)" />
          <stop offset="50%"  stopColor="oklch(0.62 0.22 295 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.30 0.10 295 / 0)" />
        </linearGradient>
        <linearGradient id="floor-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="oklch(0.30 0.10 295 / 0)" />
          <stop offset="50%"  stopColor="oklch(0.62 0.22 295 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.30 0.10 295 / 0)" />
        </linearGradient>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="oklch(0.62 0.22 295 / 0.40)" />
          <stop offset="60%"  stopColor="oklch(0.62 0.22 295 / 0.15)" />
          <stop offset="100%" stopColor="oklch(0.62 0.22 295 / 0)" />
        </radialGradient>
      </defs>

      {/* Divider slabs */}
      <rect x="48.6" y="0" width="2.8" height="100" fill="oklch(0.10 0.03 265 / 0.55)" />
      <rect x="0" y="48.6" width="100" height="2.8" fill="oklch(0.10 0.03 265 / 0.55)" />

      {/* Lit corridor strips */}
      <rect x="0"    y="49.3" width="100" height="1.4" fill="url(#floor-h)" />
      <rect x="49.3" y="0"    width="1.4" height="100" fill="url(#floor-v)" />

      {/* Hub glow — violet only, no bright cyan orb */}
      <circle cx="50" cy="50" r="6" fill="url(#hub-glow)" />
      {/* BUG FIX: was bright cyan fill="oklch(0.78 0.14 200 / 0.85)" — now a very subtle violet dot */}
      <circle cx="50" cy="50" r="1.5" fill="oklch(0.62 0.22 295 / 0.40)" className="station-hub-pulse" />

      {/* Doorway markers */}
      {[
        { x: 50, y: 28 },
        { x: 50, y: 78 },
        { x: 25, y: 50 },
        { x: 75, y: 50 },
      ].map(d => (
        <g key={`${d.x}-${d.y}`}>
          <rect x={d.x - 3} y={d.y - 0.4} width="6" height="0.8"
            fill="oklch(0.62 0.22 295 / 0.45)" className="station-doorway" />
        </g>
      ))}
    </svg>
  );
}

// ── Drone couriers ──────────────────────────────────────────────────────────
interface Drone {
  id: number; axis: "h" | "v"; offset: number; duration: number;
  delay: number; reverse: boolean; color: string; size: number;
}

function generateDrones(): Drone[] {
  const colors = [
    "oklch(0.78 0.14 200 / 0.9)",
    "oklch(0.62 0.22 295 / 0.9)",
    "oklch(0.85 0.18 90 / 0.8)",
    "oklch(0.78 0.18 350 / 0.85)",
  ];
  const drones: Drone[] = [];
  let id = 0;
  for (let i = 0; i < 6; i++) {
    drones.push({
      id: id++, axis: i % 2 === 0 ? "h" : "v",
      offset: (Math.random() - 0.5) * 1.6,
      duration: 7 + Math.random() * 6, delay: Math.random() * 8,
      reverse: Math.random() > 0.5, color: colors[id % colors.length],
      size: 3 + Math.floor(Math.random() * 2),
    });
  }
  return drones;
}

function DroneLayer() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const gen = useRef(false);
  useEffect(() => {
    if (gen.current) return;
    gen.current = true;
    setDrones(generateDrones());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[16] overflow-hidden">
      {drones.map(d => {
        const isH = d.axis === "h";
        const start = d.reverse ? "110%" : "-10%";
        const end   = d.reverse ? "-10%" : "110%";
        return (
          <motion.div key={d.id} className="absolute rounded-full"
            style={{
              width: d.size, height: d.size,
              backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}`,
              [isH ? "top" : "left"]: `calc(50% + ${d.offset}px)`,
              [isH ? "left" : "top"]: start,
            }}
            animate={{ [isH ? "left" : "top"]: [start, end] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, repeatDelay: 2 + Math.random() * 4, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

// ── L-shaped path ───────────────────────────────────────────────────────────
function pathPoints(from: RoomId, to: RoomId): Array<{ x: number; y: number }> {
  const a = ROOM_CENTERS[from];
  const b = ROOM_CENTERS[to];
  return [a, { x: a.x, y: 50 }, HUB, { x: b.x, y: 50 }, b];
}

// ── Crew visit orchestrator ─────────────────────────────────────────────────
// Bug 1 fix: reports visiting agentId up via onVisitorChange so the home room
// can suppress its static in-room sprite while the agent is shown walking/staying here.
interface CrewVisitsProps {
  active: boolean;
  onVisitorChange: (agentId: string | null) => void;
}

function CrewVisits({ active, onVisitorChange }: CrewVisitsProps) {
  const [visitor, setVisitor] = useState<VisitorState | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const scheduleNext = (delay: number) => {
      const t = setTimeout(() => {
        if (cancelled) return;
        const ids = Object.keys(AGENT_HOME);
        const agentId = ids[Math.floor(Math.random() * ids.length)];
        const from = AGENT_HOME[agentId];
        const others = ROOM_KEYS.filter(r => r !== from);
        const to = others[Math.floor(Math.random() * others.length)];
        const id = `${agentId}-${Date.now()}`;

        setVisitor({ id, agentId, from, to, phase: "outbound" });
        onVisitorChange(agentId); // agent is now away from home room

        // outbound → stay → return → cleanup
        setTimeout(() => {
          if (!cancelled) setVisitor(v => v && v.id === id ? { ...v, phase: "stay" } : v);
        }, 2400);
        setTimeout(() => {
          if (!cancelled) setVisitor(v => v && v.id === id ? { ...v, phase: "return" } : v);
        }, 2400 + 3500);
        setTimeout(() => {
          if (cancelled) return;
          setVisitor(v => (v && v.id === id ? null : v));
          onVisitorChange(null); // agent back home
          scheduleNext(12000 + Math.random() * 12000);
        }, 2400 + 3500 + 2400 + 200);
      }, delay);
      return t;
    };

    const initial = scheduleNext(4000 + Math.random() * 4000);
    const onVis = () => { if (document.hidden) { cancelled = true; onVisitorChange(null); } };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      onVisitorChange(null);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active, onVisitorChange]);

  if (!visitor) return null;

  const outboundPath = pathPoints(visitor.from, visitor.to);
  const returnPath   = [...outboundPath].reverse();
  const path = visitor.phase === "return" ? returnPath : outboundPath;
  const dest = visitor.phase === "stay" ? ROOM_CENTERS[visitor.to] : null;

  if (dest) {
    return (
      <motion.div key={`${visitor.id}-stay`}
        className="pointer-events-none absolute z-[18]"
        initial={false}
        style={{ left: `${dest.x}%`, top: `${dest.y}%`, x: "-50%", y: "-50%" }}>
        <div className="agent-idle">
          <CrewSprite agentId={visitor.agentId} pose="idle" displayWidth={96} displayHeight={72} />
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-0.5 whitespace-nowrap rounded bg-background/70 px-1 py-[1px] font-mono text-[7px] tracking-wider text-cyan-accent">VISITING</div>
      </motion.div>
    );
  }

  return (
    <motion.div key={`${visitor.id}-${visitor.phase}`}
      className="pointer-events-none absolute z-[18]"
      style={{ left: `${path[0].x}%`, top: `${path[0].y}%`, x: "-50%", y: "-50%" }}
      animate={{ left: path.map(p => `${p.x}%`), top: path.map(p => `${p.y}%`) }}
      transition={{ duration: 2.4, ease: "easeInOut", times: [0, 0.25, 0.5, 0.75, 1] }}>
      <div className="agent-walking">
        <CrewSprite agentId={visitor.agentId} pose="walk" displayWidth={96} displayHeight={72} />
      </div>
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 whitespace-nowrap rounded bg-background/70 px-1 py-[1px] font-mono text-[7px] tracking-wider text-cyan-accent">EN ROUTE</div>
    </motion.div>
  );
}

// ── StationFloorplan wrapper ────────────────────────────────────────────────
export function StationFloorplan({
  children,
  enableVisits = true,
  onVisitingAgentChange,
}: {
  children: ReactNode;
  enableVisits?: boolean;
  onVisitingAgentChange?: (agentId: string | null) => void;
}) {
  const handleVisitorChange = (agentId: string | null) => {
    onVisitingAgentChange?.(agentId);
  };

  return (
    <div className="relative">
      <div className="relative grid grid-cols-2 gap-[2px] rounded-lg overflow-hidden bg-[oklch(0.10_0.03_265)]">
        {children}
      </div>
      <HallwayOverlay />
      <DroneLayer />
      <CrewVisits active={enableVisits} onVisitorChange={handleVisitorChange} />
    </div>
  );
}
