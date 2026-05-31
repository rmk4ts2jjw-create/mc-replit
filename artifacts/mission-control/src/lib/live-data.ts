import { useState, useEffect, useCallback } from "react";
import { getAgentStatus, getSystemStats, getIncidents } from "@/lib/server-data";

export interface LiveAgentStatus {
  id: string;
  name: string;
  status: "working" | "idle" | "away" | "collaborating";
  currentAction?: string;
  tasksActive: number;
}

export interface LiveStationData {
  agents: LiveAgentStatus[];
  activeCrons: number;
  totalCrons: number;
  errorCount: number;
  uptime: string;
  stationMood: "calm" | "busy" | "alert" | "critical";
  alertLevel: "none" | "info" | "warning" | "critical";
  queuePressure: number;
  lastUpdated: number;
  openIncidents: number;
  criticalIncidents: number;
}

const POLL_INTERVAL = 10000;

const ACTION_LABELS: Record<string, string[]> = {
  monkey: ["Orchestrating mission", "Reviewing task queue", "Coordinating crew", "Monitoring station"],
  lifesupport: ["Monitoring systems", "Running health checks", "Patrolling station", "Calibrating sensors"],
  engineer: ["Building components", "Deploying updates", "Running tests", "Fixing issues"],
  archivist: ["Consolidating memory", "Indexing wiki", "Archiving logs", "Surfacing patterns"],
};

function getAction(id: string): string {
  const labels = ACTION_LABELS[id] || ["Working"];
  return labels[Math.floor(Math.random() * labels.length)];
}

export function useLiveStationData(): LiveStationData {
  const [data, setData] = useState<LiveStationData>({
    agents: [],
    activeCrons: 0,
    totalCrons: 0,
    errorCount: 0,
    uptime: "—",
    stationMood: "calm",
    alertLevel: "none",
    queuePressure: 0,
    lastUpdated: 0,
    openIncidents: 0,
    criticalIncidents: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const [agents, stats] = await Promise.all([getAgentStatus(), getSystemStats()]);

      const workingAgents = agents.filter(a => a.tasksActive > 0);
      const workingCount = workingAgents.length;
      const errorCount = stats.activeCrons < stats.totalCrons ? stats.totalCrons - stats.activeCrons : 0;

      let stationMood: LiveStationData["stationMood"] = "calm";
      if (errorCount > 2) stationMood = "critical";
      else if (errorCount > 0) stationMood = "alert";
      else if (workingCount >= 2) stationMood = "busy";

      let alertLevel: LiveStationData["alertLevel"] = "none";
      if (errorCount > 2) alertLevel = "critical";
      else if (errorCount > 0) alertLevel = "warning";

      const queuePressure = Math.min(100, workingCount * 15 + errorCount * 20);
      const collaboratingCount = workingCount >= 2 ? workingCount : 0;

      const liveAgents: LiveAgentStatus[] = agents.map(a => {
        let status: LiveAgentStatus["status"] = "idle";
        if (a.tasksActive > 0) status = collaboratingCount >= 2 ? "collaborating" : "working";
        return {
          id: a.id, name: a.name, status,
          currentAction: a.currentAction || (status !== "idle" ? getAction(a.id) : undefined),
          tasksActive: a.tasksActive,
        };
      });

      let openIncidents = 0;
      let criticalIncidents = 0;
      try {
        const incs = await getIncidents();
        openIncidents = incs.filter((i: any) => i.status !== "RESOLVED").length;
        criticalIncidents = incs.filter((i: any) => i.severity === "P1" && i.status !== "RESOLVED").length;
      } catch { /* ignore */ }

      setData({ agents: liveAgents, activeCrons: stats.activeCrons, totalCrons: stats.totalCrons, errorCount, uptime: stats.uptime, stationMood, alertLevel, queuePressure, lastUpdated: Date.now(), openIncidents, criticalIncidents });
    } catch (err) {
      console.error("[live-data] Failed to fetch:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return data;
}
