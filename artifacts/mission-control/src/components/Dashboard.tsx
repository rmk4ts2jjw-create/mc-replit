import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CREW } from "@/lib/crew";
import type { LiveStationData } from "@/lib/live-data";
import { StationFloorplan } from "./StationFloorplan";
import { AgentOffice } from "./AgentOffice";
import { AmbientStation } from "./AmbientStation";
import { TaskFlowSignals } from "./TaskFlowSignals";
import { EmptyCameo } from "./PageHeader";
import { getRotationFact } from "@/lib/delights";

const MOOD_LABEL: Record<string, string> = {
  calm: "STATION CALM", busy: "ALL HANDS BUSY", alert: "ALERT ACTIVE", critical: "CRITICAL — ACTION NEEDED",
};
const MOOD_CLASS: Record<string, string> = {
  calm: "text-[oklch(0.88_0.18_145)]", busy: "text-yellow-400", alert: "text-orange-400", critical: "text-red-400 animate-pulse",
};

function MoodBanner({ mood, alertLevel, activeCrons, totalCrons, uptime }: {
  mood: LiveStationData["stationMood"];
  alertLevel: LiveStationData["alertLevel"];
  activeCrons: number; totalCrons: number; uptime: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-4 py-2.5 mb-4">
      <div className="flex items-center gap-2">
        <div className={`text-[10px] font-mono tracking-[0.2em] ${MOOD_CLASS[mood]}`}>{MOOD_LABEL[mood]}</div>
        {alertLevel !== "none" && (
          <span className={`font-mono text-[9px] rounded-full px-2 py-0.5 ${
            alertLevel === "critical" ? "bg-red-400/20 text-red-400" :
            alertLevel === "warning"  ? "bg-orange-400/20 text-orange-400" :
                                        "bg-blue-400/20 text-blue-400"
          }`}>{alertLevel.toUpperCase()}</span>
        )}
      </div>
      <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground">
        <span>CRONS {activeCrons}/{totalCrons}</span>
        <span>UP {uptime}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, trend, accent }: {
  label: string; value: string | number; sub?: string; trend?: "up" | "down" | "neutral"; accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/60 px-4 py-3 flex flex-col gap-1">
      <div className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${accent || "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
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
    <div className={`rounded-xl border px-4 py-3 ${critical > 0 ? "border-red-400/40 bg-red-400/5" : "border-orange-400/40 bg-orange-400/5"}`}>
      <div className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground mb-1">OPEN INCIDENTS</div>
      <div className="text-2xl font-bold text-red-400">{count}</div>
      {critical > 0 && <div className="text-[9px] text-red-400/70">{critical} CRITICAL</div>}
      <Link href="/incidents"><div className="mt-2 font-mono text-[9px] text-muted-foreground/60 hover:text-muted-foreground cursor-pointer underline-offset-2 hover:underline">View incidents →</div></Link>
    </div>
  );
}

interface DashboardProps {
  liveData: LiveStationData;
}

export function Dashboard({ liveData }: DashboardProps) {
  const [visitingAgentId, setVisitingAgentId] = useState<string | null>(null);
  const [factIndex] = useState(() => Math.floor(Math.random() * 10));

  const handleVisitingAgentChange = useCallback((agentId: string | null) => {
    setVisitingAgentId(agentId);
  }, []);

  const packets = liveData.agents
    .filter(a => a.status === "working" || a.status === "collaborating")
    .map(a => ({
      id: `${a.id}-flow`,
      from: a.id,
      to: a.status === "collaborating" ? CREW.find(c => c.id !== a.id)?.id || "monkey" : "monkey",
      progress: Math.floor(Math.random() * 100),
    }));

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

      {/* Station floorplan */}
      <AmbientStation mood={liveData.stationMood}>
        <StationFloorplan enableVisits onVisitingAgentChange={handleVisitingAgentChange}>
          {CREW.map(member => {
            const liveStatus = liveData.agents.find(a => a.id === member.id);
            const isAway = visitingAgentId === member.id;
            return (
              <AgentOffice
                key={member.id}
                crew={member}
                liveStatus={liveStatus}
                isAway={isAway}
              />
            );
          })}
        </StationFloorplan>
      </AmbientStation>

      {/* Task flow + incidents row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          {packets.length > 0 ? (
            <TaskFlowSignals packets={packets} />
          ) : (
            <EmptyCameo icon="📡" message="No active task flows" hint="QUEUE IS CLEAR" tone="calm" />
          )}
        </div>
        <IncidentPanel count={liveData.openIncidents} critical={liveData.criticalIncidents} />
      </div>

      {/* Space fact */}
      <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3">
        <div className="font-mono text-[8px] tracking-[0.15em] text-muted-foreground mb-1">STATION INTEL</div>
        <div className="text-[11px] text-foreground/70 italic">{getRotationFact(factIndex)}</div>
      </div>

      {/* Agent status table */}
      <div className="rounded-xl border border-border/80 bg-card/40 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/50 font-mono text-[9px] tracking-[0.15em] text-muted-foreground">CREW STATUS</div>
        <div className="divide-y divide-border/40">
          {CREW.map(member => {
            const live = liveData.agents.find(a => a.id === member.id);
            const status = live?.status || "idle";
            const action = live?.currentAction;
            const statusColor = status === "working" || status === "collaborating"
              ? "text-[oklch(0.88_0.18_145)]"
              : status === "away" ? "text-muted-foreground/40" : "text-muted-foreground/60";
            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-2">
                <span className="shrink-0 text-xl leading-none">{member.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground/80">{member.name}</div>
                  <div className="text-[9px] text-muted-foreground">{member.shortRole}</div>
                </div>
                <div className={`font-mono text-[9px] ${statusColor}`}>
                  {status === "working" ? "ON DUTY" : status === "collaborating" ? "COLLAB" : status === "away" ? "AWAY" : "IDLE"}
                </div>
                {action && <div className="font-mono text-[9px] text-muted-foreground/50 max-w-[160px] truncate ml-2">{action}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
