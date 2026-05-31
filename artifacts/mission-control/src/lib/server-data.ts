import type {
  AgentStatus, SystemStats, ActivityEvent, Incident, AwaitingReviewResult,
} from "./server-data-types";

export async function getAgentStatus(): Promise<AgentStatus[]> {
  return [
    { id: "monkey", name: "Space Monkey", status: "idle", tasksActive: 0 },
    { id: "lifesupport", name: "Life Support Officer", status: "idle", tasksActive: 0 },
    { id: "engineer", name: "Systems Engineer", status: "idle", tasksActive: 0 },
    { id: "archivist", name: "Station Archivist", status: "idle", tasksActive: 0 },
  ];
}

export async function getSystemStats(): Promise<SystemStats> {
  return {
    uptime: "—",
    gatewayStatus: "—",
    gatewayUptime: "—",
    activeCrons: 0,
    totalCrons: 0,
    memoryPercent: 0,
    diskPercent: 0,
    diskFree: "—",
    wdDiskPercent: 0,
    wdDiskUsed: "—",
    wdDiskTotal: "—",
    wdDiskMount: "—",
    cpuLoad: "0",
    model: "—",
    hostname: "STATION-A",
  };
}

export async function getIncidents(): Promise<Incident[]> {
  return [];
}

export async function getActivityFeed(): Promise<ActivityEvent[]> {
  return [];
}

export async function getAwaitingReviewCount(): Promise<AwaitingReviewResult> {
  return { count: 0 };
}
