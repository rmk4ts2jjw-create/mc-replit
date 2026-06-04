// StationRoom — individual room cell in the 2×2 station grid.
// Workload-driven: border glow, animation speed, terminal speed all scale with workloadLevel.

import { useEffect, useState, useRef, useCallback } from "react";
import { RoomCanvas } from "./RoomCanvas";
import { RoomAmbient } from "./RoomAmbient";
import { CrewSprite } from "./CrewSprite";
import type { AgentActivity } from "@/lib/station-state";
import type { RoomType } from "./RoomCanvas";
import type { SpritePose } from "@/lib/crew-sprites";
import { type WorkloadLevel } from "@/lib/room-energy";

const ROOM_TYPE_MAP: Record<string, RoomType> = {
  command: "command", security: "security", workshop: "workshop", archive: "archive",
};

export type AgentState = "idle" | "thinking" | "working" | "sleeping" | "collaborating" | "walking";

interface StationRoomProps {
  roomId: string;
  label: string;
  bgImage: string;
  accent: string;
  accentHue: number;
  agentId: string;
  agentName: string;
  agentRole: string;
  agentActivity: AgentActivity;
  agentPos: { xPct: number; yPct: number };
  monitors: { xPct: number; yPct: number; w: number; h: number; label?: string }[];
  isAlertActive?: boolean;
  useCanvas?: boolean;
  statusText?: string;
  currentTaskName?: string;
  lastActivityMinutes?: number;
  isSleeping?: boolean;
  isWalking?: boolean;
  walkFromPos?: { xPct: number; yPct: number } | null;
  hasCollaborator?: boolean;
  collaboratorPos?: { xPct: number; yPct: number } | null;
  sharedTaskName?: string;
  isAway?: boolean;
  workloadLevel?: WorkloadLevel;
}

const STATE_CONFIG: Record<AgentState, { label: string; dotClass: string; bubbleClass: string }> = {
  idle:          { label: "MONITORING",     dotClass: "bg-[oklch(0.88_0.18_145)]",              bubbleClass: "border-[oklch(0.88_0.18_145)]/30" },
  thinking:      { label: "THINKING",       dotClass: "bg-warning animate-pulse",               bubbleClass: "border-warning/30"                 },
  working:       { label: "ON DUTY",        dotClass: "bg-[oklch(0.88_0.18_145)] animate-pulse", bubbleClass: "border-[oklch(0.88_0.18_145)]/30" },
  sleeping:      { label: "SLEEPING",       dotClass: "bg-muted-foreground/40",                 bubbleClass: "border-muted-foreground/20"         },
  collaborating: { label: "COLLABORATING",  dotClass: "bg-violet animate-pulse",                bubbleClass: "border-violet/30"                  },
  walking:       { label: "EN ROUTE",       dotClass: "bg-cyan-400 animate-pulse",              bubbleClass: "border-cyan-400/30"                },
};

function agentStateFromActivity(activity: AgentActivity, isSleeping?: boolean, isWalking?: boolean): AgentState {
  if (isWalking) return "walking";
  if (isSleeping) return "sleeping";
  switch (activity) {
    case "working":       return "working";
    case "collaborating": return "collaborating";
    case "away":          return "sleeping";
    default:              return "idle";
  }
}

// Workload → border colour helper (hex/rgba only — never oklch)
function borderStyle(level: WorkloadLevel | undefined): React.CSSProperties {
  if (!level || level === "idle") return {};
  const color   = level === "critical" ? "rgba(255,60,40,0.75)"
                : level === "heavy"    ? "rgba(255,140,0,0.65)"
                : level === "medium"   ? "rgba(130,100,255,0.55)"
                :                        "rgba(100,140,255,0.35)";
  const shadow  = level === "critical" ? "inset 0 0 24px rgba(255,60,40,0.12)"
                : level === "heavy"    ? "inset 0 0 18px rgba(255,120,0,0.09)"
                : level === "medium"   ? "inset 0 0 12px rgba(100,80,255,0.08)"
                :                        "none";
  const anim    = level === "critical" ? "pulse-fast 0.5s ease-in-out infinite"
                : level === "heavy"    ? "pulse-soft 1.5s ease-in-out infinite"
                :                        "none";
  return { border: "1.5px solid", borderColor: color, boxShadow: shadow, animation: anim };
}

const WORKLOAD_DOT: Record<WorkloadLevel, string> = {
  idle:     "transparent",
  light:    "#40d080",
  medium:   "#ffcc00",
  heavy:    "#ff8800",
  critical: "#ff4040",
};

export function StationRoom({
  roomId, label, bgImage, accent, accentHue, agentId, agentName, agentRole,
  agentActivity, agentPos, monitors, isAlertActive, useCanvas,
  statusText, currentTaskName, lastActivityMinutes, isSleeping, isWalking,
  walkFromPos, hasCollaborator, collaboratorPos, sharedTaskName,
  isAway = false,
  workloadLevel,
}: StationRoomProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [radarAngle, setRadarAngle] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const agentState = agentStateFromActivity(agentActivity, isSleeping, isWalking);
  const stateConfig = STATE_CONFIG[agentState];
  const isWorking = agentState === "working";
  const isCollaborating = agentState === "collaborating";
  const isAsleep = agentState === "sleeping";
  const isWalk = agentState === "walking";

  const [walkPos, setWalkPos] = useState<{ xPct: number; yPct: number } | null>(null);
  useEffect(() => {
    if (isWalk && walkFromPos) {
      setWalkPos(walkFromPos);
      const timer = setTimeout(() => setWalkPos(null), 1800);
      return () => clearTimeout(timer);
    } else {
      setWalkPos(null);
    }
  }, [isWalk, walkFromPos]);

  const displayPos = walkPos || agentPos;

  const computeStatusBubble = useCallback((): string => {
    if (isAway)         return "On patrol…";
    if (isWalk)         return "En route...";
    if (isAsleep)       return "zzz";
    if (isCollaborating && sharedTaskName) return sharedTaskName.length > 28 ? sharedTaskName.slice(0, 28) + "…" : sharedTaskName;
    if (isWorking && currentTaskName) {
      if (lastActivityMinutes !== undefined && lastActivityMinutes > 15) return `⚠️ No update since ${lastActivityMinutes}m ago`;
      return currentTaskName.length > 28 ? currentTaskName.slice(0, 28) + "…" : currentTaskName;
    }
    if (agentState === "thinking") return "…";
    return statusText || "Monitoring…";
  }, [isAway, isWalk, isAsleep, isCollaborating, sharedTaskName, isWorking, currentTaskName, lastActivityMinutes, agentState, statusText]);

  const bubbleText = computeStatusBubble();

  // Terminal lines — speed scales with workload
  const termSpeed = workloadLevel === "critical" ? 600 : workloadLevel === "heavy" ? 900 : workloadLevel === "medium" ? 1400 : 2000;
  useEffect(() => {
    if (!isWorking) { setTerminalLines([]); return; }
    const lines = [`> ${agentId}@station:~$ check_status`, `> All systems nominal`, `> Processing task queue…`, `> ${Math.floor(Math.random() * 100)}% complete`];
    setTerminalLines(lines);
    const interval = setInterval(() => {
      setTerminalLines(prev => { const n = [...prev]; n[Math.floor(Math.random() * n.length)] = `> ${agentId}@station:~$ ${randomCommand()}`; return n; });
    }, termSpeed);
    return () => clearInterval(interval);
  }, [agentId, isWorking, termSpeed]);

  useEffect(() => {
    const interval = setInterval(() => setRadarAngle(prev => (prev + 3) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const h2 = accentHue;
    ctx.strokeStyle = `hsla(${h2}, 60%, 55%, 0.25)`; ctx.lineWidth = 1;
    [20, 15, 10, 5].forEach(r => { ctx.beginPath(); ctx.arc(w/2, h/2, r, 0, Math.PI*2); ctx.stroke(); });
    ctx.strokeStyle = `hsla(${h2}, 60%, 55%, 0.18)`;
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
    const rad = (radarAngle * Math.PI) / 180;
    const grad = ctx.createLinearGradient(w/2, h/2, w/2+Math.cos(rad)*25, h/2+Math.sin(rad)*25);
    grad.addColorStop(0, `hsla(${h2}, 70%, 60%, 0.5)`); grad.addColorStop(1, `hsla(${h2}, 70%, 60%, 0)`);
    ctx.strokeStyle = grad; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w/2, h/2); ctx.lineTo(w/2+Math.cos(rad)*25, h/2+Math.sin(rad)*25); ctx.stroke();
    [{x:w*0.3,y:h*0.4},{x:w*0.7,y:h*0.3},{x:w*0.6,y:h*0.7}].forEach(b => {
      ctx.fillStyle = `hsl(${h2}, 70%, 60%)`; ctx.beginPath(); ctx.arc(b.x,b.y,2,0,Math.PI*2); ctx.fill();
    });
  }, [radarAngle, accentHue]);

  const spriteAnimClass = isWorking ? "agent-working" : isAsleep ? "agent-sleeping" : isWalk ? "agent-walking" : agentState === "thinking" ? "agent-thinking" : "agent-idle";
  const spritePose: SpritePose = agentState === "sleeping" ? "sleep"
    : agentState === "walking"      ? "walk"
    : agentState === "collaborating"? "collab"
    : agentState as SpritePose;

  const dotColor = workloadLevel ? WORKLOAD_DOT[workloadLevel] : undefined;
  const showDot  = workloadLevel && workloadLevel !== "idle";

  return (
    <div className="relative overflow-hidden" data-agent-id={agentId}>
      <div className="relative">
        {useCanvas ? (
          <RoomCanvas room={ROOM_TYPE_MAP[roomId] || "command"} className="w-full h-auto" workloadLevel={workloadLevel} />
        ) : (
          <img src={bgImage} alt={label} className="w-full h-auto" style={{ imageRendering: "pixelated" }} />
        )}

        {/* Room label + workload indicator */}
        <div className="absolute top-1 left-1 flex items-center gap-1">
          <span className="font-mono text-[7px] tracking-[0.15em] text-muted-foreground/50 bg-background/40 px-1.5 py-0.5">{label}</span>
          {showDot && (
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />
          )}
        </div>

        <RoomAmbient roomId={ROOM_TYPE_MAP[roomId] || "command"} accent={accent} workloadLevel={workloadLevel} />

        {/* Energy / workload border glow */}
        {workloadLevel && workloadLevel !== "idle" ? (
          <div className="absolute inset-0 pointer-events-none rounded-sm" style={borderStyle(workloadLevel)} />
        ) : (
          isWorking && <div className="absolute inset-0 pointer-events-none border-2 rounded-sm agent-glow" style={{ borderColor: accent }} />
        )}

        {monitors.map((mon, i) => (
          <div key={`glow-${mon.xPct}-${mon.yPct}-${i}`} className="absolute pointer-events-none transition-all duration-500" style={{
            left: `${mon.xPct}%`, top: `${mon.yPct}%`, width: `${mon.w}%`, height: `${mon.h}%`,
            filter: isWorking ? "brightness(1.3) saturate(1.2)" : isAsleep ? "brightness(0.5)" : "none",
            boxShadow: isWorking ? `0 0 8px ${accent}40` : "none",
          }} />
        ))}

        {bubbleText && (
          <div className="absolute z-20 pointer-events-none bubble-visible" style={{
            left: `${displayPos.xPct}%`, top: `${displayPos.yPct - 18}%`, transform: "translate(-50%, -50%)",
          }}>
            <div className={`bg-[#1a1a2e]/95 backdrop-blur-sm border ${stateConfig.bubbleClass} rounded-lg px-2 py-1 font-mono text-[7px] whitespace-nowrap shadow-lg`} style={{ color: accent }}>
              {bubbleText}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-[#1a1a2e]/95 border-r border-b" style={{ borderColor: "inherit" }} />
            </div>
          </div>
        )}

        <div className="absolute z-10" style={{
          left: `${displayPos.xPct}%`, top: `${displayPos.yPct}%`, transform: "translate(-50%, -50%)",
          transition: isWalk ? "left 1.5s ease-in-out, top 1.5s ease-in-out" : "none",
          opacity: isAway ? 0 : 1,
          pointerEvents: "none",
        }}>
          <div className={spriteAnimClass}>
            <CrewSprite
              agentId={agentId}
              pose={spritePose}
              displayWidth={160}
              displayHeight={120}
              filter={isWorking ? `drop-shadow(0 0 4px ${accent}90)` : undefined}
            />
          </div>
          {agentState === "thinking" && (
            <div className="absolute -top-4 -right-2 bg-[#1a1a2e] border border-warning/40 rounded-full w-6 h-6 flex items-center justify-center agent-think-bubble">
              <span className="text-[9px] text-warning font-mono">…</span>
            </div>
          )}
          {isAsleep && (
            <div className="absolute -top-2 right-0 font-mono text-[10px] font-bold agent-zzz" style={{ color: accent }}>zzz</div>
          )}
          {isWorking && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[0, 0.2, 0.4].map(d => (
                <div key={d} className="w-1 h-1 rounded-full agent-typing-dot" style={{ backgroundColor: accent, animationDelay: `${d}s` }} />
              ))}
            </div>
          )}
        </div>

        {isCollaborating && hasCollaborator && collaboratorPos && (
          <div className="absolute z-10 agent-collab-visitor" style={{
            left: `${collaboratorPos.xPct}%`, top: `${collaboratorPos.yPct}%`, transform: "translate(-50%, -50%)",
          }}>
            <div className="w-16 h-16 rounded-full border border-dashed border-violet/40 flex items-center justify-center">
              <span className="text-[8px] font-mono text-violet/60">collab</span>
            </div>
          </div>
        )}
        {isCollaborating && hasCollaborator && collaboratorPos && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" style={{ overflow: "visible" }}>
            <line x1={`${displayPos.xPct}%`} y1={`${displayPos.yPct}%`} x2={`${collaboratorPos.xPct}%`} y2={`${collaboratorPos.yPct}%`}
              stroke={accent} strokeWidth="1" strokeDasharray="4 4" className="agent-collab-line" />
          </svg>
        )}

        <div className="absolute z-10 text-center pointer-events-none" style={{
          left: `${displayPos.xPct}%`, top: `${displayPos.yPct + 14}%`, transform: "translate(-50%, 0)",
          opacity: isAway ? 0.4 : 1,
        }}>
          <div className="font-mono text-[7px] text-foreground/70 leading-tight">{agentName}</div>
          <div className="font-mono text-[6px] text-muted-foreground/50 leading-tight">{agentRole}</div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAway ? "bg-muted-foreground/30" : stateConfig.dotClass}`} />
            <span className="font-mono text-[6px] text-muted-foreground/60">{isAway ? "AWAY" : stateConfig.label}</span>
          </div>
        </div>

        {isWorking && terminalLines.length > 0 && (
          <div className="absolute bottom-1 left-1 right-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-1 font-mono text-[7px] text-[oklch(0.88_0.18_145)] agent-terminal">
            {terminalLines.map((line, i) => <div key={`term-${i}`} className="truncate">{line}</div>)}
          </div>
        )}

        <canvas ref={canvasRef} width={50} height={35} className="absolute top-1 right-1 opacity-50" style={{ imageRendering: "pixelated" }} />
        {isAlertActive && <div className="absolute inset-0 bg-destructive/20 pointer-events-none agent-alert-flash" />}
        {isCollaborating && (
          <div className="absolute top-1 right-1 bg-violet/15 border border-violet/30 rounded px-1 py-0.5 font-mono text-[6px] text-violet agent-collab-badge">🤝 COLLAB</div>
        )}
      </div>
    </div>
  );
}

function randomCommand(): string {
  const cmds = ["git status", "npm run build", "tail -f /var/log/syslog", "docker ps", "kubectl get pods", "htop", "vim config.yaml", "curl localhost:3000/health", "grep -r TODO src/", "ls -la"];
  return cmds[Math.floor(Math.random() * cmds.length)];
}
