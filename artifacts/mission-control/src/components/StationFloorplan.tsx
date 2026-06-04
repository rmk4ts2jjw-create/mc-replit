// StationFloorplan — continuous 2×2 floorplan with hallway overlay.
// Enhancement sprint: route highlight, incident overlay, task packets.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CREW } from "@/lib/crew";
import { CrewSprite } from "./CrewSprite";
import { TaskPacketLayer } from "./TaskPacket";

type RoomId = "command" | "security" | "workshop" | "archive";

const ROOM_CENTERS: Record<RoomId, { x: number; y: number }> = {
  command:  { x: 25, y: 28 },
  security: { x: 75, y: 28 },
  workshop: { x: 25, y: 78 },
  archive:  { x: 75, y: 78 },
};

const AGENT_HOME: Record<string, RoomId> = {
  monkey: "command", lifesupport: "security", engineer: "workshop", archivist: "archive",
};

const AGENT_ACCENT: Record<string, string> = {
  monkey: "#60b8ff", lifesupport: "#ff4090", engineer: "#30e8e0", archivist: "#ffb820",
};

const ROOM_KEYS: RoomId[] = ["command", "security", "workshop", "archive"];
const HUB = { x: 50, y: 50 };

interface VisitorState {
  id: string; agentId: string; from: RoomId; to: RoomId;
  phase: "outbound" | "stay" | "return";
}

// ── Hallway overlay ──────────────────────────────────────────────────────────
function HallwayOverlay() {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[15] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
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
      <rect x="48.6" y="0" width="2.8" height="100" fill="oklch(0.10 0.03 265 / 0.55)" />
      <rect x="0" y="48.6" width="100" height="2.8" fill="oklch(0.10 0.03 265 / 0.55)" />
      <rect x="0"    y="49.3" width="100" height="1.4" fill="url(#floor-h)" />
      <rect x="49.3" y="0"    width="1.4" height="100" fill="url(#floor-v)" />
      <circle cx="50" cy="50" r="6" fill="url(#hub-glow)" />
      <circle cx="50" cy="50" r="1.5" fill="oklch(0.62 0.22 295 / 0.40)" className="station-hub-pulse" />
      {[{x:50,y:28},{x:50,y:78},{x:25,y:50},{x:75,y:50}].map(d => (
        <g key={`${d.x}-${d.y}`}>
          <rect x={d.x-3} y={d.y-0.4} width="6" height="0.8" fill="oklch(0.62 0.22 295 / 0.45)" className="station-doorway" />
        </g>
      ))}
    </svg>
  );
}

// ── Route highlight — glowing dashed path shown while agent is travelling ───
function RouteHighlight({ visitor }: { visitor: VisitorState }) {
  if (visitor.phase === "stay") return null;
  const from = ROOM_CENTERS[visitor.from];
  const to   = ROOM_CENTERS[visitor.to];
  const color = AGENT_ACCENT[visitor.agentId] ?? "#60b8ff";

  const pts = visitor.phase === "outbound"
    ? [from, { x: from.x, y: 50 }, HUB, { x: to.x, y: 50 }, to]
    : [to,   { x: to.x,   y: 50 }, HUB, { x: from.x, y: 50 }, from];

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg className="pointer-events-none absolute inset-0 z-[14] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id={`route-glow-${visitor.agentId}`}>
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="0.6"
        strokeDasharray="2.5 1.8" strokeLinecap="round"
        opacity="0.65" filter={`url(#route-glow-${visitor.agentId})`} />
    </svg>
  );
}

// ── Drone couriers ───────────────────────────────────────────────────────────
interface Drone { id: number; axis: "h"|"v"; offset: number; duration: number; delay: number; reverse: boolean; color: string; size: number; }

function generateDrones(): Drone[] {
  const colors = ["oklch(0.78 0.14 200 / 0.9)", "oklch(0.62 0.22 295 / 0.9)", "oklch(0.85 0.18 90 / 0.8)", "oklch(0.78 0.18 350 / 0.85)"];
  let id = 0;
  return Array.from({ length: 6 }, (_, i) => ({
    id: id++, axis: i % 2 === 0 ? "h" : "v" as "h"|"v",
    offset: (Math.random() - 0.5) * 1.6, duration: 7 + Math.random() * 6, delay: Math.random() * 8,
    reverse: Math.random() > 0.5, color: colors[id % colors.length], size: 3 + Math.floor(Math.random() * 2),
  }));
}

function DroneLayer() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const gen = useRef(false);
  useEffect(() => { if (gen.current) return; gen.current = true; setDrones(generateDrones()); }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[16] overflow-hidden">
      {drones.map(d => {
        const isH = d.axis === "h";
        const start = d.reverse ? "110%" : "-10%", end = d.reverse ? "-10%" : "110%";
        return (
          <motion.div key={d.id} className="absolute rounded-full"
            style={{ width: d.size, height: d.size, backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}`, [isH ? "top" : "left"]: `calc(50% + ${d.offset}px)`, [isH ? "left" : "top"]: start }}
            animate={{ [isH ? "left" : "top"]: [start, end] }}
            transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, repeatDelay: 2 + Math.random() * 4, ease: "linear" }} />
        );
      })}
    </div>
  );
}

// ── L-shaped path ─────────────────────────────────────────────────────────────
function pathPoints(from: RoomId, to: RoomId): Array<{ x: number; y: number }> {
  const a = ROOM_CENTERS[from], b = ROOM_CENTERS[to];
  return [a, { x: a.x, y: 50 }, HUB, { x: b.x, y: 50 }, b];
}

// ── Crew visit orchestrator ──────────────────────────────────────────────────
interface CrewVisitsProps { active: boolean; onVisitorChange: (agentId: string | null) => void; onVisitorStateChange?: (v: VisitorState | null) => void; }

function CrewVisits({ active, onVisitorChange, onVisitorStateChange }: CrewVisitsProps) {
  const [visitor, setVisitor] = useState<VisitorState | null>(null);
  const cbRef = useRef(onVisitorChange);
  const vsCbRef = useRef(onVisitorStateChange);
  useEffect(() => { cbRef.current = onVisitorChange; });
  useEffect(() => { vsCbRef.current = onVisitorStateChange; });

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
        const v: VisitorState = { id, agentId, from, to, phase: "outbound" };
        setVisitor(v); cbRef.current(agentId); vsCbRef.current?.(v);

        setTimeout(() => { if (!cancelled) { const stayed = { ...v, phase: "stay" as const }; setVisitor(stayed); vsCbRef.current?.(stayed); } }, 2400);
        setTimeout(() => { if (!cancelled) { const ret = { ...v, phase: "return" as const }; setVisitor(ret); vsCbRef.current?.(ret); } }, 2400 + 3500);
        setTimeout(() => {
          if (cancelled) return;
          setVisitor(null); cbRef.current(null); vsCbRef.current?.(null);
          scheduleNext(12000 + Math.random() * 12000);
        }, 2400 + 3500 + 2400 + 200);
      }, delay);
      return t;
    };

    const initial = scheduleNext(4000 + Math.random() * 4000);
    const onVis = () => { if (document.hidden) { cancelled = true; setVisitor(null); cbRef.current(null); vsCbRef.current?.(null); } };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearTimeout(initial);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active]);

  if (!visitor) return null;

  const outboundPath = pathPoints(visitor.from, visitor.to);
  const returnPath   = [...outboundPath].reverse();
  const path = visitor.phase === "return" ? returnPath : outboundPath;
  const dest = visitor.phase === "stay" ? ROOM_CENTERS[visitor.to] : null;

  if (dest) {
    return (
      <motion.div key={`${visitor.id}-stay`} className="pointer-events-none absolute z-[18]"
        initial={false} style={{ left: `${dest.x}%`, top: `${dest.y}%`, x: "-50%", y: "-50%" }}>
        <div className="agent-idle">
          <CrewSprite agentId={visitor.agentId} pose="idle" displayWidth={96} displayHeight={72} />
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 mt-0.5 whitespace-nowrap rounded bg-background/70 px-1 py-[1px] font-mono text-[7px] tracking-wider text-cyan-accent">VISITING</div>
      </motion.div>
    );
  }

  return (
    <motion.div key={`${visitor.id}-${visitor.phase}`} className="pointer-events-none absolute z-[18]"
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

// ── StationFloorplan ─────────────────────────────────────────────────────────
export function StationFloorplan({
  children, enableVisits = true, onVisitingAgentChange,
  criticalIncidents = 0, agentTasks = {},
}: {
  children: ReactNode;
  enableVisits?: boolean;
  onVisitingAgentChange?: (agentId: string | null) => void;
  criticalIncidents?: number;
  agentTasks?: Record<string, number>;
}) {
  const [visitor, setVisitor] = useState<VisitorState | null>(null);

  const handleVisitorChange = useCallback((agentId: string | null) => {
    onVisitingAgentChange?.(agentId);
  }, [onVisitingAgentChange]);

  const handleVisitorStateChange = useCallback((v: VisitorState | null) => {
    setVisitor(v);
  }, []);

  return (
    <div className="relative">
      <div className="relative grid grid-cols-2 gap-[2px] rounded-lg overflow-hidden bg-[oklch(0.10_0.03_265)]">
        {children}
      </div>

      <HallwayOverlay />
      <DroneLayer />

      {/* Task packets — fly from hub to room when task count increases */}
      <div className="pointer-events-none absolute inset-0 z-[22] overflow-hidden">
        <TaskPacketLayer agentTasks={agentTasks} />
      </div>

      {/* Route highlight — glowing dashed path when agent is walking */}
      {visitor && visitor.phase !== "stay" && <RouteHighlight visitor={visitor} />}

      <CrewVisits
        active={enableVisits}
        onVisitorChange={handleVisitorChange}
        onVisitorStateChange={handleVisitorStateChange}
      />

      {/* Incident response overlay — pulsing red border when P1 incident is active */}
      {criticalIncidents > 0 && (
        <div className="pointer-events-none absolute inset-0 z-[13] rounded-lg overflow-hidden" style={{
          border: "2px solid rgba(255,60,40,0.55)",
          boxShadow: "inset 0 0 40px rgba(255,60,40,0.08), 0 0 12px rgba(255,60,40,0.20)",
          animation: "pulse-fast 0.9s ease-in-out infinite",
        }}>
          <div className="absolute top-1 right-2 font-mono text-[7px] text-red-400/80 tracking-wider">⚠ INCIDENT ACTIVE</div>
        </div>
      )}
    </div>
  );
}
