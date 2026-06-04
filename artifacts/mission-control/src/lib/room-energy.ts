// room-energy.ts — workload levels, energy values, and ambient activity simulation.
// WorkloadLevel drives: animation speed, monitor brightness, room glow, visual urgency.

import { useState, useEffect, useRef } from "react";

export type WorkloadLevel = "idle" | "light" | "medium" | "heavy" | "critical";

export function levelToEnergy(level: WorkloadLevel): number {
  switch (level) {
    case "idle":     return 0;
    case "light":    return 0.25;
    case "medium":   return 0.5;
    case "heavy":    return 0.75;
    case "critical": return 1.0;
  }
}

export function levelToSpeed(level: WorkloadLevel): number {
  switch (level) {
    case "idle":     return 1.0;
    case "light":    return 1.2;
    case "medium":   return 1.5;
    case "heavy":    return 2.0;
    case "critical": return 2.8;
  }
}

export function tasksToLevel(tasks: number, hasCritical = false): WorkloadLevel {
  if (hasCritical) return "critical";
  if (tasks >= 5) return "heavy";
  if (tasks >= 3) return "medium";
  if (tasks >= 1) return "light";
  return "idle";
}

// ── Ambient activity simulator ─────────────────────────────────────────────
// Generates realistic-looking workload changes over time so the station looks
// alive even with no real backend tasks.

const SIM_AGENTS = ["monkey", "lifesupport", "engineer", "archivist"] as const;
export type SimAgentId = (typeof SIM_AGENTS)[number];

export interface SimActivity {
  tasks: Record<SimAgentId, number>;
}

function weightedCount(): number {
  const r = Math.random();
  if (r < 0.22) return 0;
  if (r < 0.48) return 1;
  if (r < 0.68) return 2;
  if (r < 0.83) return 3;
  if (r < 0.93) return 4;
  return 5;
}

export function useActivitySim(): SimActivity {
  const [sim, setSim] = useState<SimActivity>(() => ({
    tasks: { monkey: 1, lifesupport: 0, engineer: 2, archivist: 1 },
  }));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scheduleNext = () => {
      timerRef.current = setTimeout(() => {
        const id = SIM_AGENTS[Math.floor(Math.random() * SIM_AGENTS.length)];
        setSim(prev => ({ tasks: { ...prev.tasks, [id]: weightedCount() } }));
        scheduleNext();
      }, 7000 + Math.random() * 9000);
    };
    scheduleNext();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return sim;
}
