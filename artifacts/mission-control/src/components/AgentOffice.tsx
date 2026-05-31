// AgentOffice — wires live data into a StationRoom for one crew member.

import { useMemo } from "react";
import { StationRoom } from "./StationRoom";
import type { CrewMember } from "@/lib/crew";
import type { LiveAgentStatus } from "@/lib/live-data";
import type { AgentActivity } from "@/lib/station-state";

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
  celebratingTaskId?: string | null;
}

export function AgentOffice({ crew, liveStatus, isAway, celebratingTaskId }: AgentOfficeProps) {
  const config = ROOM_CONFIGS[crew.id];
  if (!config) return null;

  const activity = liveStatus ? mapStatus(liveStatus.status) : "idle";
  const accent   = ACCENT_COLORS[crew.id] ?? "oklch(0.78 0.14 200)";
  const accentH  = ACCENT_HUES[crew.id] ?? 200;
  const taskName = liveStatus?.currentAction;

  const spriteToUse = useMemo(() => {
    if (activity === "working" || activity === "collaborating") return crew.sprites.working;
    return crew.sprites.idle;
  }, [activity, crew.sprites]);

  return (
    <StationRoom
      roomId={config.roomId}
      label={config.label}
      bgImage=""
      accent={accent}
      accentHue={accentH}
      agentId={crew.id}
      agentName={crew.name}
      agentRole={crew.shortRole}
      agentSprite={spriteToUse}
      agentActivity={activity}
      agentPos={config.agentPos}
      monitors={config.monitors}
      useCanvas
      currentTaskName={taskName}
      isAway={isAway}
    />
  );
}
