// AgentOffice — wires live data into a StationRoom for one crew member.
// v2: adds dnd-kit drop zone, speech bubbles, flash feedback, stress indicator, coffee boost.

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { StationRoom } from "./StationRoom";
import type { CrewMember } from "@/lib/crew";
import type { LiveAgentStatus } from "@/lib/live-data";
import type { AgentActivity } from "@/lib/station-state";
import { type WorkloadLevel } from "@/lib/room-energy";

const ROOM_CONFIGS: Record<string, {
  roomId: string; label: string;
  agentPos: { xPct: number; yPct: number };
  monitors: { xPct: number; yPct: number; w: number; h: number }[];
}> = {
  monkey: {
    roomId: "command", label: "COMMAND HQ",
    agentPos: { xPct: 50, yPct: 65 },
    monitors: [
      { xPct: 15, y: 15, w: 20, h: 15 } as any,
      { xPct: 39, y: 13, w: 22, h: 18 } as any,
      { xPct: 73, y: 15, w: 18, h: 15 } as any,
    ],
  },
  lifesupport: {
    roomId: "security", label: "SECURITY BAY",
    agentPos: { xPct: 50, yPct: 68 },
    monitors: [
      { xPct: 5, y: 23, w: 85, h: 13 } as any,
      { xPct: 5, y: 42, w: 18, h: 28 } as any,
    ],
  },
  engineer: {
    roomId: "workshop", label: "WORKSHOP",
    agentPos: { xPct: 50, yPct: 65 },
    monitors: [
      { xPct: 37, y: 49, w: 29, h: 13 } as any,
      { xPct: 88, y: 41, w: 10, h: 16 } as any,
    ],
  },
  archivist: {
    roomId: "archive", label: "ARCHIVE",
    agentPos: { xPct: 50, yPct: 68 },
    monitors: [
      { xPct: 34, y: 54, w: 32, h: 14 } as any,
    ],
  },
};

const ACCENT_COLORS: Record<string, string> = {
  monkey:      "oklch(0.78 0.14 200)",
  lifesupport: "oklch(0.78 0.18 350)",
  engineer:    "oklch(0.78 0.18 200)",
  archivist:   "oklch(0.85 0.16 90)",
};

const ACCENT_HEX: Record<string, string> = {
  monkey: "#60b8ff", lifesupport: "#ff5c9e", engineer: "#30e8e0", archivist: "#ffb820",
};

const ACCENT_HUES: Record<string, number> = {
  monkey: 295, lifesupport: 350, engineer: 200, archivist: 90,
};

function mapStatus(s: LiveAgentStatus["status"]): AgentActivity {
  switch (s) {
    case "working":       return "working";
    case "collaborating": return "collaborating";
    case "away":          return "away";
    default:              return "idle";
  }
}

interface AgentOfficeProps {
  crew: CrewMember;
  liveStatus?: LiveAgentStatus;
  isAway?: boolean;
  workloadLevel?: WorkloadLevel;
  speechBubble?: string | null;
  flashState?: "accept" | "reject" | null;
  energyBoosted?: boolean;
  onCoffeeSent?: (agentId: string) => void;
}

export function AgentOffice({
  crew, liveStatus, isAway, workloadLevel,
  speechBubble, flashState, energyBoosted, onCoffeeSent,
}: AgentOfficeProps) {
  // Hooks must all be called unconditionally (before any early return)
  const { setNodeRef, isOver } = useDroppable({ id: crew.id });
  const [hovered, setHovered] = useState(false);

  const config = ROOM_CONFIGS[crew.id];
  if (!config) return null;

  const activity = liveStatus ? mapStatus(liveStatus.status) : "idle";
  const accent   = ACCENT_COLORS[crew.id] ?? "oklch(0.78 0.14 200)";
  const accentHex = ACCENT_HEX[crew.id] ?? "#60b8ff";
  const accentH  = ACCENT_HUES[crew.id] ?? 200;
  const taskName = liveStatus?.currentAction;

  // Coffee boost: temporarily downgrade workload visually
  const effectiveWorkload: WorkloadLevel = energyBoosted
    ? (workloadLevel === "critical" ? "medium" : workloadLevel === "heavy" ? "light" : workloadLevel ?? "idle")
    : (workloadLevel ?? "idle");

  const isStressed = (workloadLevel === "heavy" || workloadLevel === "critical") && !energyBoosted;

  return (
    <div
      ref={setNodeRef}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StationRoom
        roomId={config.roomId}
        label={config.label}
        bgImage=""
        accent={accent}
        accentHue={accentH}
        agentId={crew.id}
        agentName={crew.name}
        agentRole={crew.shortRole}
        agentActivity={activity}
        agentPos={config.agentPos}
        monitors={config.monitors}
        useCanvas
        currentTaskName={taskName}
        isAway={isAway}
        workloadLevel={effectiveWorkload}
      />

      {/* Drop zone highlight */}
      {isOver && (
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded"
          style={{
            background: "rgba(80,220,120,0.10)",
            border: "2px solid rgba(80,220,120,0.55)",
            boxShadow: "inset 0 0 20px rgba(80,220,120,0.10)",
          }}
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[7px] text-[#50dc78] tracking-wider">
            DROP TO ASSIGN
          </div>
        </div>
      )}

      {/* Accept / reject flash */}
      <AnimatePresence>
        {flashState && (
          <motion.div
            key={flashState + crew.id}
            className="absolute inset-0 pointer-events-none z-31 rounded"
            style={{
              background: flashState === "accept"
                ? "rgba(80,220,120,0.22)"
                : "rgba(255,60,40,0.22)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            key={speechBubble}
            className="absolute z-40 pointer-events-none"
            style={{ left: "50%", top: "22%", transform: "translateX(-50%)" }}
            initial={{ opacity: 0, y: -12, scale: 0.78 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.88, transition: { duration: 0.3 } }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <div
              className="font-mono text-[9px] rounded-md px-2.5 py-1.5 whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis"
              style={{
                background: "rgba(6,6,18,0.92)",
                border: `1px solid ${accentHex}44`,
                backdropFilter: "blur(8px)",
                color: accentHex,
                boxShadow: `0 4px 16px rgba(0,0,0,0.55), 0 0 8px ${accentHex}22`,
              }}
            >
              💬 {speechBubble}
            </div>
            {/* Tail */}
            <div
              style={{
                width: 7, height: 7, margin: "0 auto",
                background: "rgba(6,6,18,0.92)",
                border: `1px solid ${accentHex}44`,
                borderTop: "none", borderLeft: "none",
                transform: "rotate(45deg) translateY(-3.5px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stress indicator */}
      <AnimatePresence>
        {isStressed && (
          <motion.div
            className="absolute top-2 right-2 z-40 pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <motion.span
              className="text-[11px]"
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              title="Agent under stress"
            >
              {workloadLevel === "critical" ? "🔴" : "⚡"}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee boost button */}
      <AnimatePresence>
        {hovered && onCoffeeSent && (
          <motion.button
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.82 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-2 right-2 z-40 font-mono text-[8px] rounded px-2 py-1 cursor-pointer"
            style={{
              background: energyBoosted ? "rgba(80,220,120,0.18)" : "rgba(245,180,80,0.16)",
              border: `1px solid ${energyBoosted ? "rgba(80,220,120,0.35)" : "rgba(245,180,80,0.32)"}`,
              color: energyBoosted ? "rgba(80,220,120,0.9)" : "rgba(255,210,120,0.88)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => onCoffeeSent(crew.id)}
            title="Send coffee — temporarily reduces workload"
          >
            {energyBoosted ? "✓ BOOSTED" : "☕ BOOST"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
