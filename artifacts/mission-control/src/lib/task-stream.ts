// task-stream.ts — mock task stream: ticker tasks, pending drag tasks, energy boosts
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

export const AGENT_EMOJI: Record<SimAgentId, string> = {
  monkey: "🛰", lifesupport: "🔬", engineer: "⚙️", archivist: "📁",
};

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  critical: "#ff4040", high: "#ff9020", medium: "#c0a020", low: "#40a870",
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

export interface TaskStreamState {
  tickerTasks: StreamTask[];
  pendingTasks: StreamTask[];
  speechBubbles: Partial<Record<SimAgentId, string>>;
  agentFlash: Partial<Record<SimAgentId, "accept" | "reject">>;
  energyBoosts: Partial<Record<SimAgentId, boolean>>;
  assignTask: (taskId: string, toAgent: SimAgentId) => void;
  boostEnergy: (agentId: SimAgentId) => void;
  dismissTask: (taskId: string) => void;
}

export function useTaskStream(): TaskStreamState {
  const [tickerTasks, setTickerTasks] = useState<StreamTask[]>([]);
  const [pendingTasks, setPendingTasks] = useState<StreamTask[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<Partial<Record<SimAgentId, string>>>({});
  const [agentFlash, setAgentFlash]  = useState<Partial<Record<SimAgentId, "accept" | "reject">>>({});
  const [energyBoosts, setEnergyBoosts] = useState<Partial<Record<SimAgentId, boolean>>>({});

  const taskRegistryRef = useRef<Map<string, StreamTask>>(new Map());
  const flashTimers     = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const bubbleTimers    = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const boostTimers     = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({});
  const autoTimers      = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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
    fireBubble(toAgent, task?.title ?? "Incoming task");
    fireFlash(toAgent, "accept");
  }, [removeTask, fireBubble, fireFlash]);

  const boostEnergy = useCallback((agentId: SimAgentId) => {
    setEnergyBoosts(prev => ({ ...prev, [agentId]: true }));
    fireBubble(agentId, "☕ Refueled!");
    if (boostTimers.current[agentId]) clearTimeout(boostTimers.current[agentId]);
    boostTimers.current[agentId] = setTimeout(() => {
      setEnergyBoosts(prev => { const n = { ...prev }; delete n[agentId]; return n; });
    }, 9000);
  }, [fireBubble]);

  const dismissTask = useCallback((taskId: string) => {
    removeTask(taskId);
  }, [removeTask]);

  // Spawn new tasks every 3-6 seconds
  useEffect(() => {
    const spawnNext = () => {
      const task = makeTask();
      taskRegistryRef.current.set(task.id, task);

      // 60% to ticker, 40% to pending sidebar
      if (Math.random() < 0.6) {
        setTickerTasks(prev => {
          const next = [task, ...prev].slice(0, 7);
          return next;
        });
        // Auto-assign after 5-10s
        const delay = 5000 + Math.random() * 5000;
        const timer = setTimeout(() => {
          assignTask(task.id, task.agentId);
        }, delay);
        autoTimers.current.set(task.id, timer);
      } else {
        setPendingTasks(prev => [task, ...prev].slice(0, 10));
        // Auto-dismiss pending after 20s
        const timer = setTimeout(() => { removeTask(task.id); }, 20000);
        autoTimers.current.set(task.id, timer);
      }

      return setTimeout(spawnNext, 3000 + Math.random() * 3000);
    };

    const root = setTimeout(spawnNext, 1200);
    return () => {
      clearTimeout(root);
      autoTimers.current.forEach(t => clearTimeout(t));
    };
  }, [assignTask, removeTask]);

  return {
    tickerTasks, pendingTasks,
    speechBubbles, agentFlash, energyBoosts,
    assignTask, boostEnergy, dismissTask,
  };
}
