export type AgentActivity = "idle" | "working" | "collaborating" | "away" | "thinking" | "walking";
export type StationMood = "calm" | "busy" | "alert" | "critical";

export interface AgentPosition {
  xPct: number;
  yPct: number;
}

export interface StationState {
  agents: Record<string, AgentActivity>;
  agentPositions: Record<string, AgentPosition>;
  agentTargetPositions: Record<string, AgentPosition | null>;
  collaborations: Collaboration[];
  incidents: Incident[];
  taskQueue: TaskFlowPacket[];
  queuePressure: number;
  mood: StationMood;
  alertLevel: "none" | "info" | "warning" | "critical";
  lastEvent: StationEvent | null;
}

export interface Collaboration {
  id: string;
  agents: [string, string];
  room: string;
  startedAt: number;
}

export interface Incident {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  room?: string;
  startedAt: number;
  resolvedAt?: number;
}

export interface TaskFlowPacket {
  id: string;
  from: string;
  to: string;
  progress: number;
}

export interface StationEvent {
  type: "agent_activity" | "collaboration_start" | "collaboration_end" | "incident" | "incident_resolve" | "task_dispatch" | "mood_change";
  payload: unknown;
  timestamp: number;
}

export type StationAction =
  | { type: "SET_AGENT_ACTIVITY"; agentId: string; activity: AgentActivity }
  | { type: "START_COLLABORATION"; collaboration: Collaboration }
  | { type: "END_COLLABORATION"; id: string }
  | { type: "ADD_INCIDENT"; incident: Incident }
  | { type: "RESOLVE_INCIDENT"; id: string }
  | { type: "DISPATCH_TASK"; packet: TaskFlowPacket }
  | { type: "UPDATE_TASK_PROGRESS"; id: string; progress: number }
  | { type: "SET_MOOD"; mood: StationMood }
  | { type: "SET_ALERT"; level: "none" | "info" | "warning" | "critical" }
  | { type: "TICK" };

export function stationReducer(state: StationState, action: StationAction): StationState {
  switch (action.type) {
    case "SET_AGENT_ACTIVITY":
      return { ...state, agents: { ...state.agents, [action.agentId]: action.activity }, lastEvent: { type: "agent_activity", payload: action, timestamp: Date.now() } };
    case "START_COLLABORATION":
      return { ...state, collaborations: [...state.collaborations, action.collaboration], lastEvent: { type: "collaboration_start", payload: action, timestamp: Date.now() } };
    case "END_COLLABORATION":
      return { ...state, collaborations: state.collaborations.filter(c => c.id !== action.id), lastEvent: { type: "collaboration_end", payload: action, timestamp: Date.now() } };
    case "ADD_INCIDENT":
      return { ...state, incidents: [...state.incidents.filter(i => !i.resolvedAt), action.incident], lastEvent: { type: "incident", payload: action, timestamp: Date.now() } };
    case "RESOLVE_INCIDENT":
      return { ...state, incidents: state.incidents.map(i => i.id === action.id ? { ...i, resolvedAt: Date.now() } : i), lastEvent: { type: "incident_resolve", payload: action, timestamp: Date.now() } };
    case "DISPATCH_TASK":
      return { ...state, taskQueue: [...state.taskQueue, action.packet], queuePressure: Math.min(100, state.queuePressure + 10), lastEvent: { type: "task_dispatch", payload: action, timestamp: Date.now() } };
    case "UPDATE_TASK_PROGRESS":
      return { ...state, taskQueue: state.taskQueue.map(t => t.id === action.id ? { ...t, progress: action.progress } : t) };
    case "SET_MOOD":
      return { ...state, mood: action.mood, lastEvent: { type: "mood_change", payload: action, timestamp: Date.now() } };
    case "SET_ALERT":
      return { ...state, alertLevel: action.level };
    case "TICK":
      return { ...state, queuePressure: Math.max(0, state.queuePressure - 2), taskQueue: state.taskQueue.filter(t => t.progress < 100), incidents: state.incidents.map(i => !i.resolvedAt && Date.now() - i.startedAt > 300000 ? { ...i, resolvedAt: Date.now() } : i) };
    default:
      return state;
  }
}

export function createInitialStationState(): StationState {
  return {
    agents: { monkey: "idle", lifesupport: "idle", engineer: "idle", archivist: "idle" },
    agentPositions: { monkey: { xPct: 50, yPct: 65 }, lifesupport: { xPct: 50, yPct: 60 }, engineer: { xPct: 55, yPct: 62 }, archivist: { xPct: 50, yPct: 58 } },
    agentTargetPositions: { monkey: null, lifesupport: null, engineer: null, archivist: null },
    collaborations: [], incidents: [], taskQueue: [], queuePressure: 0, mood: "calm", alertLevel: "none", lastEvent: null,
  };
}
