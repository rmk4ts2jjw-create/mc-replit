// task-stream.ts — mock task stream: ticker tasks, pending drag tasks, energy boosts, event log
import { useState, useEffect, useRef, useCallback } from "react";
import type { SimAgentId } from "./room-energy";

const TASK_POOL = [
  "Deploy memory module", "Scan anomaly sector-7", "Patch life support protocol",
  "Archive mission telemetry", "Analyze gravity flux", "Recalibrate nav sensors",
  "Optimize comms array", "Decrypt signal burst", "Sync crew manifest",
  "Run diagnostic sweep", "Compile mission report", "Update star charts",
  "Test emergency systems", "Verify docking seals", "Review crew vitals",
  "Clear cache partition", "Rebuild search index", "Rotate encryption keys",
  "Monitor solar output", "Calibrate O2 balance",
];

export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface StreamTask {
  id: string;
  title: string;
  agentId: SimAgentId;
  priority: TaskPriority;
  arrivedAt: number;
  state: "ticking" | "assigning" | "done";
}

export type LogEventType = "assigned" | "intercepted" | "boosted" | "celebrated" | "spawned";

export interface LogEvent {
  id: string;
  type: LogEventType;
  agentId?: SimAgentId;
  message: string;
  icon: string;
  ts: number;
}

export const AGENT_EMOJI: Record<SimAgentId, string> = {
  monkey: "🛰", lifesupport: "🔬", engineer: "⚙️", archivist: "📁",
};

export const AGENT_NAME: Record<SimAgentId, string> = {
  monkey: "Space Monkey", lifesupport: "Life Support", engineer: "Engineer", archivist: "Archivist",
};

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  critical: "#ff4040", high: "#ff9020", medium: "#c0a020", low: "#40a870",
};

export const LOG_EVENT_COLOR: Record<LogEventType, string> = {
  assigned:     "#40d080",
  intercepted:  "#e0b020",
  boosted:      "#ff9020",
  celebrated:   "#f5c840",
  spawned:      "#60b8ff",
};

const AGENT_IDS: SimAgentId[] = ["monkey", "lifesupport", "engineer", "archivist"];

function randomPriority(): TaskPriority {
  const r = Math.random();
  if (r < 0.06) return "critical";
  if (r < 0.22) return "high";
  if (r < 0.60) return "medium";
  return "low";
}

let _seq = 0;
function nextId() { return `t${++_seq}-${Date.now()}`; }

function makeTask(): StreamTask {
  return {
    id: nextId(),
    title: TASK_POOL[Math.floor(Math.random() * TASK_POOL.length)],
    agentId: AGENT_IDS[Math.floor(Math.random() * AGENT_IDS.length)],
    priority: randomPriority(),
    arrivedAt: Date.now(),
    state: "ticking",
  };
}

// Seed a few initial tasks so the UI isn't empty on first render
function makeSeedTasks(): StreamTask[] {
  return Array.from({ length: 3 }, makeTask);
}

export interface TaskStreamState {
  tickerTasks: StreamTask[];
  pendingTasks: StreamTask[];
  recentEvents: LogEvent[];
  speechBubbles: Partial<Record<SimAgentId, string>>;
  agentFlash: Partial<Record<SimAgentId, "accept" | "reject">>;
  energyBoosts: Partial<Record<SimAgentId, boolean>>;
  assignTask: (taskId: string, toAgent: SimAgentId) => void;
  boostEnergy: (agentId: SimAgentId) => void;
  dismissTask: (taskId: string) => void;
  logEvent: (event: Omit<LogEvent, "id" | "ts">) => void;
}

export function useTaskStream(): TaskStreamState {
  const [tickerTasks, setTickerTasks] = useState<StreamTask[]>(() => {
    const seeds = makeSeedTasks();
    return seeds;
  });
  const [pendingTasks, setPendingTasks] = useState<StreamTask[]>(() => {
    return [makeTask(), makeTask()];
  });
  const [recentEvents, setRecentEvents] = useState<LogEvent[]>(() => [{
    id: nextId(), type: "spawned", message: "Station systems online — task stream active", icon: "📡", ts: Date.now(),
  }]);
  const [speechBubbles, setSpeechBubbles] = useState<Partial<Record<SimAgentId, string>>>({});
  const [agentFlash, setAgentFlash]  = useState<Partial<Record<SimAgentId, "accept" | "reject">>>({});
  const [energyBoosts, setEnergyBoosts] = useState<Partial<Record<SimAgentId, boolean>>>({});

  const taskRegistryRef = useRef<Map<string, StreamTask>>(new Map());
  const flashTimers     = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const bubbleTimers    = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const boostTimers     = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const autoTimers      = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Register seed tasks in registry
  const seedRegistered = useRef(false);
  if (!seedRegistered.current) {
    tickerTasks.forEach(t => taskRegistryRef.current.set(t.id, t));
    pendingTasks.forEach(t => taskRegistryRef.current.set(t.id, t));
    seedRegistered.current = true;
  }

  const addEvent = useCallback((event: Omit<LogEvent, "id" | "ts">) => {
    setRecentEvents(prev => [{ ...event, id: nextId(), ts: Date.now() }, ...prev].slice(0, 24));
  }, []);

  const fireFlash = useCallback((agentId: SimAgentId, kind: "accept" | "reject") => {
    setAgentFlash(prev => ({ ...prev, [agentId]: kind }));
    if (flashTimers.current[agentId]) clearTimeout(flashTimers.current[agentId]);
    flashTimers.current[agentId] = setTimeout(() => {
      setAgentFlash(prev => { const n = { ...prev }; delete n[agentId]; return n; });
    }, 750);
  }, []);

  const fireBubble = useCallback((agentId: SimAgentId, title: string) => {
    setSpeechBubbles(prev => ({ ...prev, [agentId]: title }));
    if (bubbleTimers.current[agentId]) clearTimeout(bubbleTimers.current[agentId]);
    bubbleTimers.current[agentId] = setTimeout(() => {
      setSpeechBubbles(prev => { const n = { ...prev }; delete n[agentId]; return n; });
    }, 2600);
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTickerTasks(prev => prev.filter(t => t.id !== taskId));
    setPendingTasks(prev => prev.filter(t => t.id !== taskId));
    taskRegistryRef.current.delete(taskId);
    const at = autoTimers.current.get(taskId);
    if (at) { clearTimeout(at); autoTimers.current.delete(taskId); }
  }, []);

  const assignTask = useCallback((taskId: string, toAgent: SimAgentId) => {
    const task = taskRegistryRef.current.get(taskId);
    removeTask(taskId);
    const title = task?.title ?? "Incoming task";
    fireBubble(toAgent, title);
    fireFlash(toAgent, "accept");
    addEvent({
      type: "assigned",
      agentId: toAgent,
      message: `${AGENT_EMOJI[toAgent]} ${AGENT_NAME[toAgent]} — ${title}`,
      icon: "✓",
    });
  }, [removeTask, fireBubble, fireFlash, addEvent]);

  const boostEnergy = useCallback((agentId: SimAgentId) => {
    setEnergyBoosts(prev => ({ ...prev, [agentId]: true }));
    fireBubble(agentId, "☕ Refueled!");
    if (boostTimers.current[agentId]) clearTimeout(boostTimers.current[agentId]);
    boostTimers.current[agentId] = setTimeout(() => {
      setEnergyBoosts(prev => { const n = { ...prev }; delete n[agentId]; return n; });
    }, 9000);
    addEvent({
      type: "boosted",
      agentId,
      message: `☕ ${AGENT_NAME[agentId]} refueled — energy restored`,
      icon: "☕",
    });
  }, [fireBubble, addEvent]);

  const dismissTask = useCallback((taskId: string) => {
    const task = taskRegistryRef.current.get(taskId);
    removeTask(taskId);
    if (task) {
      addEvent({
        type: "intercepted",
        message: `↩ Task intercepted: "${task.title}"`,
        icon: "↩",
      });
    }
  }, [removeTask, addEvent]);

  // Spawn new tasks every 3-6 seconds
  useEffect(() => {
    // Schedule auto-assign for seed ticker tasks
    tickerTasks.forEach(task => {
      if (!autoTimers.current.has(task.id)) {
        const delay = 4000 + Math.random() * 4000;
        const timer = setTimeout(() => assignTask(task.id, task.agentId), delay);
        autoTimers.current.set(task.id, timer);
      }
    });
    pendingTasks.forEach(task => {
      if (!autoTimers.current.has(task.id)) {
        const timer = setTimeout(() => removeTask(task.id), 18000 + Math.random() * 4000);
        autoTimers.current.set(task.id, timer);
      }
    });

    const spawnNext = () => {
      const task = makeTask();
      taskRegistryRef.current.set(task.id, task);

      if (Math.random() < 0.6) {
        setTickerTasks(prev => [task, ...prev].slice(0, 7));
        const delay = 5000 + Math.random() * 5000;
        const timer = setTimeout(() => assignTask(task.id, task.agentId), delay);
        autoTimers.current.set(task.id, timer);
      } else {
        setPendingTasks(prev => [task, ...prev].slice(0, 10));
        const timer = setTimeout(() => removeTask(task.id), 20000);
        autoTimers.current.set(task.id, timer);
      }

      addEvent({
        type: "spawned",
        agentId: task.agentId,
        message: `📥 New task queued → ${AGENT_NAME[task.agentId]}: "${task.title}"`,
        icon: "📥",
      });

      return setTimeout(spawnNext, 3000 + Math.random() * 3000);
    };

    const root = setTimeout(spawnNext, 2000);
    return () => {
      clearTimeout(root);
      autoTimers.current.forEach(t => clearTimeout(t));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tickerTasks, pendingTasks, recentEvents,
    speechBubbles, agentFlash, energyBoosts,
    assignTask, boostEnergy, dismissTask, logEvent: addEvent,
  };
}
