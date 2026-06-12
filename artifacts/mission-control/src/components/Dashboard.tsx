import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { CREW } from "@/lib/crew";
import type { LiveStationData } from "@/lib/live-data";
import { StationFloorplan } from "./StationFloorplan";
import { AgentOffice } from "./AgentOffice";
import { AmbientStation } from "./AmbientStation";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { AgentNetworkPanel } from "./AgentNetworkPanel";
import { EmptyCameo } from "./PageHeader";
import { getRotationFact } from "@/lib/delights";
import { useActivitySim, tasksToLevel, type SimAgentId } from "@/lib/room-energy";

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
      className="glass-card flex items-center justify-between px-4 py-3 mb-4"
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
  label: string; value: string | number; sub?: string; trend?: "up" | "down" | "neutral"; accent?: string;
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
    return (
      <EmptyCameo icon="🛡" message="No open incidents" hint="ALL DECKS NOMINAL" tone="calm" />
    );
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

interface DashboardProps {
  liveData: LiveStationData;
}

export function Dashboard({ liveData }: DashboardProps) {
  const [visitingAgentId, setVisitingAgentId] = useState<string | null>(null);
  const [factIndex] = useState(() => Math.floor(Math.random() * 10));
  const [celebrating, setCelebrating] = useState(false);
  const simActivity = useActivitySim();
  const prevTasksRef = useRef<Record<SimAgentId, number>>({ monkey: 1, lifesupport: 0, engineer: 2, archivist: 1 });
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect task completions → trigger celebration
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

  const handleVisitingAgentChange = useCallback((agentId: string | null) => {
    setVisitingAgentId(agentId);
  }, []);

  // Merged task counts: take the higher of live data and simulated activity.
  // Simulated activity keeps rooms visually busy even with zero real tasks.
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

  return (
    <div className="flex flex-col gap-4">
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

      {/* Station floorplan — CelebrationOverlay fires on task completion */}
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
              return (
                <AgentOffice
                  key={member.id}
                  crew={member}
                  liveStatus={liveStatus}
                  isAway={isAway}
                  workloadLevel={wl}
                />
              );
            })}
          </StationFloorplan>
        </AmbientStation>
        <CelebrationOverlay active={celebrating} />
      </div>

      {/* Agent network + incidents row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <AgentNetworkPanel simActivity={simActivity} />
        </div>
        <IncidentPanel count={liveData.openIncidents} critical={liveData.criticalIncidents} />
      </div>

      {/* Space fact */}
      <div className="glass-card px-4 py-3">
        <div className="label-tracked mb-1.5">STATION INTEL</div>
        <div className="text-[11px] text-foreground/65 italic leading-relaxed">{getRotationFact(factIndex)}</div>
      </div>

      {/* Agent status table */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/40 label-tracked">CREW STATUS</div>
        <div className="divide-y divide-border/30">
          {CREW.map(member => {
            const live = liveData.agents.find(a => a.id === member.id);
            const status = live?.status || "idle";
            const action = live?.currentAction;
            const isActive = status === "working" || status === "collaborating";
            const dotColor = isActive ? "#40d080" : status === "away" ? "#555" : "#444";
            const statusLabel = status === "working" ? "ON DUTY" : status === "collaborating" ? "COLLAB" : status === "away" ? "AWAY" : "IDLE";
            const statusColor = isActive ? "text-[oklch(0.88_0.18_145)]" : status === "away" ? "text-muted-foreground/35" : "text-muted-foreground/50";
            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <span className="shrink-0 text-xl leading-none">{member.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground/80 leading-tight">{member.name}</div>
                  <div className="text-[9px] text-muted-foreground/60 leading-tight">{member.shortRole}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                  <span className={`font-mono text-[9px] ${statusColor}`}>{statusLabel}</span>
                </div>
                {action && <div className="font-mono text-[9px] text-muted-foreground/40 max-w-[140px] truncate">{action}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
