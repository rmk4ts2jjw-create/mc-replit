import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import { CREW } from "@/lib/crew";
import type { LiveStationData } from "@/lib/live-data";
import { StationFloorplan } from "./StationFloorplan";
import { AgentOffice } from "./AgentOffice";
import { AmbientStation } from "./AmbientStation";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { AgentNetworkPanel } from "./AgentNetworkPanel";
import { TaskTickerStream } from "./TaskTickerStream";
import { TaskSidebar } from "./TaskSidebar";
import { EmptyCameo } from "./PageHeader";
import { getRotationFact } from "@/lib/delights";
import { useActivitySim, tasksToLevel, type SimAgentId } from "@/lib/room-energy";
import { useTaskStream, AGENT_EMOJI, PRIORITY_COLOR } from "@/lib/task-stream";
import type { StreamTask } from "@/lib/task-stream";
import { EventLog } from "./EventLog";

const MOOD_LABEL: Record<string, string> = {
  calm: "STATION CALM", busy: "ALL HANDS BUSY", alert: "ALERT ACTIVE", critical: "CRITICAL — ACTION NEEDED",
};
const MOOD_CLASS: Record<string, string> = {
  calm: "text-[oklch(0.88_0.18_145)]", busy: "text-yellow-400", alert: "text-orange-400", critical: "text-red-400 animate-pulse",
};
const MOOD_ACCENT: Record<string, string> = {
  calm: "oklch(0.85 0.23 155)", busy: "oklch(0.82 0.17 80)", alert: "rgb(251 146 60)", critical: "rgb(248 113 113)",
};

function MoodBanner({ mood, alertLevel, activeCrons, totalCrons, uptime }: {
  mood: LiveStationData["stationMood"];
  alertLevel: LiveStationData["alertLevel"];
  activeCrons: number; totalCrons: number; uptime: string;
}) {
  return (
    <div
      className="glass-card flex items-center justify-between px-4 py-3"
      style={{ borderLeft: `3px solid color-mix(in oklab, ${MOOD_ACCENT[mood]}, transparent 30%)` }}
    >
      <div className="flex items-center gap-3">
        <div className={`font-mono text-[10px] tracking-[0.22em] font-semibold ${MOOD_CLASS[mood]}`}>{MOOD_LABEL[mood]}</div>
        {alertLevel !== "none" && (
          <span className={`font-mono text-[9px] rounded-full px-2 py-0.5 border ${
            alertLevel === "critical" ? "bg-red-400/15 text-red-400 border-red-400/30" :
            alertLevel === "warning"  ? "bg-orange-400/15 text-orange-400 border-orange-400/30" :
                                        "bg-blue-400/15 text-blue-400 border-blue-400/30"
          }`}>{alertLevel.toUpperCase()}</span>
        )}
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-muted-foreground/45 tracking-wider">CRONS</span>
          <span className="font-mono text-[10px] text-foreground/80 tabular-nums">{activeCrons}/{totalCrons}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-muted-foreground/45 tracking-wider">UP</span>
          <span className="font-mono text-[10px] text-foreground/80">{uptime}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="glass-card px-4 py-4 flex flex-col gap-1.5">
      <div className="label-tracked">{label}</div>
      <div className={`text-2xl font-bold tracking-tight metric ${accent || "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground/70">{sub}</div>}
    </div>
  );
}

function IncidentPanel({ count, critical }: { count: number; critical: number }) {
  if (count === 0) {
    return <EmptyCameo icon="🛡" message="No open incidents" hint="ALL DECKS NOMINAL" tone="calm" />;
  }
  return (
    <div className="glass-card px-4 py-4" style={{ borderLeft: `3px solid ${critical > 0 ? "rgba(248,113,113,0.7)" : "rgba(251,146,60,0.6)"}` }}>
      <div className="label-tracked mb-1.5">OPEN INCIDENTS</div>
      <div className="text-2xl font-bold metric text-red-400">{count}</div>
      {critical > 0 && <div className="text-[9px] text-red-400/70 mt-0.5">{critical} CRITICAL</div>}
      <Link href="/incidents"><div className="mt-3 font-mono text-[9px] text-muted-foreground/50 hover:text-muted-foreground cursor-pointer underline-offset-2 hover:underline transition-colors">View incidents →</div></Link>
    </div>
  );
}

// ── Agent task history + sparklines ────────────────────────────────────────
const AGENT_HEX: Record<string, string> = {
  monkey: "#60b8ff", lifesupport: "#ff5c9e", engineer: "#30e8e0", archivist: "#ffb820",
};

function useAgentHistory(agentTasks: Record<string, number>) {
  const [history, setHistory] = useState<Record<string, number[]>>({
    monkey: [1], lifesupport: [0], engineer: [2], archivist: [1],
  });
  useEffect(() => {
    const id = setInterval(() => {
      setHistory(prev => {
        const next: Record<string, number[]> = {};
        ["monkey", "lifesupport", "engineer", "archivist"].forEach(id => {
          next[id] = [...(prev[id] ?? []), agentTasks[id] ?? 0].slice(-14);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [agentTasks]);
  return history;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) {
    return <div style={{ width: 44, height: 14, opacity: 0.15, background: color, borderRadius: 2 }} />;
  }
  const w = 44, h = 14;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - Math.max(1, (v / max) * h)}`
  ).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      {/* Line */}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.82" />
      {/* Last-point dot */}
      {data.length > 1 && (() => {
        const last = data[data.length - 1];
        const x = w;
        const y = h - Math.max(1, (last / max) * h);
        return <circle cx={x} cy={y} r="2" fill={color} opacity="0.9" />;
      })()}
    </svg>
  );
}

// Drag overlay ghost card
function DragGhostCard({ task }: { task: StreamTask }) {
  return (
    <div
      className="rounded px-3 py-2 shadow-2xl pointer-events-none"
      style={{
        background: "rgba(4,4,18,0.94)",
        border: `1px solid ${PRIORITY_COLOR[task.priority]}66`,
        boxShadow: `0 10px 40px rgba(0,0,0,0.7), 0 0 16px ${PRIORITY_COLOR[task.priority]}44`,
        backdropFilter: "blur(12px)",
        minWidth: 160,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[7px] font-bold px-1 rounded"
          style={{ background: `${PRIORITY_COLOR[task.priority]}22`, color: PRIORITY_COLOR[task.priority] }}>
          {task.priority.toUpperCase()}
        </span>
        <span className="text-[11px]">{AGENT_EMOJI[task.agentId]}</span>
      </div>
      <div className="font-mono text-[9px] text-foreground/80 leading-snug">{task.title}</div>
      <div className="font-mono text-[7px] text-muted-foreground/35 mt-1">↓ Drop on agent room</div>
    </div>
  );
}

interface DashboardProps {
  liveData: LiveStationData;
}

export function Dashboard({ liveData }: DashboardProps) {
  const [visitingAgentId, setVisitingAgentId] = useState<string | null>(null);
  const [factIndex] = useState(() => Math.floor(Math.random() * 10));
  const [celebrating, setCelebrating] = useState(false);
  const [activeDragTask, setActiveDragTask] = useState<StreamTask | null>(null);

  const simActivity = useActivitySim();
  const taskStream  = useTaskStream();

  const prevTasksRef   = useRef<Record<SimAgentId, number>>({ monkey: 1, lifesupport: 0, engineer: 2, archivist: 1 });
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Celebration detection
  useEffect(() => {
    const prev = prevTasksRef.current;
    const curr = simActivity.tasks;
    const anyBigDrop = (Object.keys(curr) as SimAgentId[]).some(id => {
      return (prev[id] ?? 0) >= 3 && (curr[id] ?? 0) <= 1;
    });
    if (anyBigDrop) {
      setCelebrating(true);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => setCelebrating(false), 2800);
    }
    prevTasksRef.current = { ...curr };
  }, [simActivity.tasks]);

  // Log celebration events
  useEffect(() => {
    if (celebrating) {
      taskStream.logEvent({ type: "celebrated", message: "🎊 Station celebration — task load cleared!", icon: "🎊" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrating]);

  const handleVisitingAgentChange = useCallback((agentId: string | null) => {
    setVisitingAgentId(agentId);
  }, []);

  const agentTasks = useMemo(() => {
    const result: Record<string, number> = {};
    CREW.forEach(member => {
      const live = liveData.agents.find(a => a.id === member.id);
      const sim  = simActivity.tasks[member.id as SimAgentId] ?? 0;
      result[member.id] = Math.max(live?.tasksActive ?? 0, sim);
    });
    return result;
  }, [liveData.agents, simActivity.tasks]);

  const hasP1 = liveData.criticalIncidents > 0;
  const agentHistory = useAgentHistory(agentTasks);

  // dnd-kit handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as StreamTask | undefined;
    setActiveDragTask(task ?? null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragTask(null);
    if (!event.over) return;
    const task = event.active.data.current?.task as StreamTask | undefined;
    if (!task) return;
    const targetAgentId = event.over.id as SimAgentId;
    taskStream.assignTask(task.id, targetAgentId);
  }, [taskStream]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Main layout: content + collapsible sidebar */}
      <div className="flex gap-0 items-stretch min-h-0">
        {/* Main column */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Ticker stream */}
          <TaskTickerStream tasks={taskStream.tickerTasks} onIntercept={taskStream.dismissTask} />

          <MoodBanner
            mood={liveData.stationMood}
            alertLevel={liveData.alertLevel}
            activeCrons={liveData.activeCrons}
            totalCrons={liveData.totalCrons}
            uptime={liveData.uptime}
          />

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="AGENTS ACTIVE" value={liveData.agents.filter(a => a.status === "working").length} sub={`of ${liveData.agents.length} crew`} accent="text-[oklch(0.88_0.18_145)]" />
            <StatCard label="ACTIVE CRONS" value={liveData.activeCrons} sub={`/ ${liveData.totalCrons} total`} />
            <StatCard label="ERRORS" value={liveData.errorCount} sub={liveData.errorCount > 0 ? "needs attention" : "all clear"} accent={liveData.errorCount > 0 ? "text-red-400" : undefined} />
            <StatCard label="QUEUE PRESSURE" value={`${liveData.queuePressure}%`} sub={liveData.queuePressure > 60 ? "high load" : "nominal"} accent={liveData.queuePressure > 60 ? "text-orange-400" : undefined} />
          </div>

          {/* Station floorplan */}
          <div className="relative">
            <AmbientStation mood={liveData.stationMood}>
              <StationFloorplan
                enableVisits
                onVisitingAgentChange={handleVisitingAgentChange}
                criticalIncidents={liveData.criticalIncidents}
                agentTasks={agentTasks}
              >
                {CREW.map(member => {
                  const liveStatus = liveData.agents.find(a => a.id === member.id);
                  const isAway = visitingAgentId === member.id;
                  const wl = tasksToLevel(
                    agentTasks[member.id] ?? 0,
                    hasP1 && member.id === "monkey",
                  );
                  const agentId = member.id as SimAgentId;
                  return (
                    <AgentOffice
                      key={member.id}
                      crew={member}
                      liveStatus={liveStatus}
                      isAway={isAway}
                      workloadLevel={wl}
                      speechBubble={taskStream.speechBubbles[agentId]}
                      flashState={taskStream.agentFlash[agentId]}
                      energyBoosted={taskStream.energyBoosts[agentId]}
                      onCoffeeSent={taskStream.boostEnergy}
                    />
                  );
                })}
              </StationFloorplan>
            </AmbientStation>
            <CelebrationOverlay active={celebrating} />
          </div>

          {/* Agent network + incidents */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <AgentNetworkPanel simActivity={simActivity} />
            </div>
            <IncidentPanel count={liveData.openIncidents} critical={liveData.criticalIncidents} />
          </div>

          {/* Station Log + Intel row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <EventLog events={taskStream.recentEvents} />
            </div>
            <div className="glass-card px-4 py-3 flex flex-col">
              <div className="label-tracked mb-2">STATION INTEL</div>
              <div className="text-[10px] text-foreground/55 italic leading-relaxed flex-1">{getRotationFact(factIndex)}</div>
            </div>
          </div>

          {/* Crew status table */}
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between">
              <div className="label-tracked">CREW STATUS</div>
              <div className="font-mono text-[7px] text-muted-foreground/30">TASKS · TREND</div>
            </div>
            <div className="divide-y divide-border/30">
              {CREW.map(member => {
                const live = liveData.agents.find(a => a.id === member.id);
                const status = live?.status || "idle";
                const action = live?.currentAction;
                const isActive = status === "working" || status === "collaborating";
                const dotColor = isActive ? "#40d080" : status === "away" ? "#555" : "#444";
                const statusLabel = status === "working" ? "ON DUTY" : status === "collaborating" ? "COLLAB" : status === "away" ? "AWAY" : "IDLE";
                const statusColor = isActive ? "text-[oklch(0.88_0.18_145)]" : status === "away" ? "text-muted-foreground/35" : "text-muted-foreground/50";
                const taskCount = agentTasks[member.id] ?? 0;
                const hex = AGENT_HEX[member.id] ?? "#60b8ff";
                const hist = agentHistory[member.id] ?? [taskCount];
                return (
                  <div key={member.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                    <span className="shrink-0 text-xl leading-none">{member.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground/80 leading-tight">{member.name}</div>
                      <div className="text-[9px] text-muted-foreground/60 leading-tight">{member.shortRole}</div>
                    </div>
                    {/* Status */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                      <span className={`font-mono text-[9px] ${statusColor}`}>{statusLabel}</span>
                    </div>
                    {/* Current task action */}
                    {action && <div className="font-mono text-[9px] text-muted-foreground/40 max-w-[100px] truncate hidden lg:block">{action}</div>}
                    {/* Task count badge */}
                    {taskCount > 0 && (
                      <div
                        className="shrink-0 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: `${hex}18`,
                          border: `1px solid ${hex}38`,
                          color: hex,
                          minWidth: 22,
                          textAlign: "center",
                        }}
                      >
                        {taskCount}
                      </div>
                    )}
                    {/* Sparkline */}
                    <Sparkline data={hist} color={hex} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task sidebar */}
        <div className="flex items-stretch ml-2 shrink-0">
          <TaskSidebar tasks={taskStream.pendingTasks} onDismiss={taskStream.dismissTask} />
        </div>
      </div>

      {/* Drag overlay — follows cursor */}
      <DragOverlay dropAnimation={null}>
        {activeDragTask ? <DragGhostCard task={activeDragTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
