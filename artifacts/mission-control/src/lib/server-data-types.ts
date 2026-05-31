export interface Task {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED" | "AWAITING_REVIEW";
  priority?: string;
  agentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  message: string;
  ts: string;
}

export interface QueueItem {
  id: string;
  title: string;
  status: string;
  priority?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: "active" | "paused" | "error";
  lastRun?: string;
  nextRun?: string;
}

export interface OpenClawCronJob extends CronJob {
  agentId?: string;
}

export interface SystemStats {
  uptime: string;
  gatewayStatus: string;
  gatewayUptime: string;
  activeCrons: number;
  totalCrons: number;
  memoryPercent: number;
  diskPercent: number;
  diskFree: string;
  wdDiskPercent: number;
  wdDiskUsed: string;
  wdDiskTotal: string;
  wdDiskMount: string;
  cpuLoad: string;
  model: string;
  hostname: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  status: string;
  tasksActive: number;
  currentAction?: string;
}

export interface MemoryEntry {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
}

export interface Doc {
  id: string;
  title: string;
  content: string;
  path: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  description?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

export interface IncidentEvent {
  id: string;
  incidentId: string;
  message: string;
  ts: string;
}

export interface IncidentAction {
  id: string;
  incidentId: string;
  action: string;
  ts: string;
}

export interface CreateIncidentInput {
  title: string;
  severity: "P1" | "P2" | "P3";
}

export interface ActivityEvent {
  id: string;
  type: "task" | "cron" | "system" | "agent";
  message: string;
  ts: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt?: string;
}

export interface OpenClawStatus {
  status: string;
  uptime: string;
  version: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  checks: Record<string, boolean>;
}

export interface AwaitingReviewResult {
  count: number;
}

export interface CronToggleResult {
  ok: boolean;
  enabled: boolean;
}

export const WORKSPACE = "/workspace";
export const OPENCLAW_DIR = "/workspace/.openclaw";
