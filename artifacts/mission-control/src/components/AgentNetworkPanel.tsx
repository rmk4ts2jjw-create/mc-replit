// AgentNetworkPanel — animated SVG collaboration network for the 4 crew members.
// Shows agent nodes (size = workload), beams (opacity = shared activity), traveling dots.

import { useMemo } from "react";
import type { SimActivity, SimAgentId } from "@/lib/room-energy";
import { tasksToLevel, levelToEnergy } from "@/lib/room-energy";

interface NodeDef {
  x: number; y: number;
  emoji: string; name: string;
  hex: string;
}

const NODES: Record<SimAgentId, NodeDef> = {
  monkey:      { x: 45,  y: 38,  emoji: "🛰",  name: "MONKEY",   hex: "#60b8ff" },
  lifesupport: { x: 155, y: 38,  emoji: "🔬",  name: "LIFE SUP", hex: "#ff5c9e" },
  engineer:    { x: 45,  y: 108, emoji: "⚙️",  name: "ENGINEER", hex: "#30e8e0" },
  archivist:   { x: 155, y: 108, emoji: "📁",  name: "ARCHIVE",  hex: "#ffb820" },
};

const AGENTS = Object.keys(NODES) as SimAgentId[];

const PAIRS: [SimAgentId, SimAgentId][] = [
  ["monkey",      "lifesupport"],
  ["monkey",      "engineer"],
  ["monkey",      "archivist"],
  ["lifesupport", "engineer"],
  ["lifesupport", "archivist"],
  ["engineer",    "archivist"],
];

// Fixed durations per pair so they don't change on re-render
const PAIR_DURATIONS = [2.4, 3.1, 2.8, 2.2, 3.4, 2.6];

interface Props {
  simActivity: SimActivity;
}

export function AgentNetworkPanel({ simActivity }: Props) {
  const energies = useMemo(() => {
    const out = {} as Record<SimAgentId, number>;
    AGENTS.forEach(id => {
      out[id] = levelToEnergy(tasksToLevel(simActivity.tasks[id] ?? 0));
    });
    return out;
  }, [simActivity.tasks]);

  const activeLinks  = PAIRS.filter(([a, b]) => energies[a] > 0 && energies[b] > 0).length;
  const activeAgents = AGENTS.filter(id => energies[id] > 0).length;

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="label-tracked mb-3">AGENT NETWORK</div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* SVG network */}
        <div className="shrink-0 w-[200px]">
          <svg viewBox="0 0 200 146" className="w-full h-auto" aria-hidden>
            <defs>
              {PAIRS.map(([a, b]) => (
                <linearGradient
                  key={`ng-${a}-${b}`}
                  id={`ng-${a}-${b}`}
                  x1={NODES[a].x} y1={NODES[a].y}
                  x2={NODES[b].x} y2={NODES[b].y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%"   stopColor={NODES[a].hex} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={NODES[b].hex} stopOpacity="0.85" />
                </linearGradient>
              ))}
              {AGENTS.map(id => (
                <radialGradient key={`nrg-${id}`} id={`nrg-${id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={NODES[id].hex} stopOpacity="0.55" />
                  <stop offset="100%" stopColor={NODES[id].hex} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {/* Beams */}
            {PAIRS.map(([a, b], i) => {
              const ea = energies[a]; const eb = energies[b];
              const strength = (ea + eb) / 2;
              const bothActive = ea > 0 && eb > 0;
              const na = NODES[a]; const nb = NODES[b];
              const dur = PAIR_DURATIONS[i];
              const pathD = `M ${na.x} ${na.y} L ${nb.x} ${nb.y}`;

              return (
                <g key={`beam-${a}-${b}`}>
                  <line
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke={`url(#ng-${a}-${b})`}
                    strokeWidth={bothActive ? 0.6 + strength * 1.8 : 0.4}
                    strokeOpacity={bothActive ? 0.55 + strength * 0.3 : 0.08}
                    strokeDasharray={bothActive ? "none" : "2 4"}
                  />
                </g>
              );
            })}

            {/* Node glow halos */}
            {AGENTS.map(id => {
              const e = energies[id];
              if (e <= 0) return null;
              const n = NODES[id];
              const r = 10 + e * 12;
              return (
                <circle key={`halo-${id}`}
                  cx={n.x} cy={n.y} r={r}
                  fill={`url(#nrg-${id})`}
                  opacity={e * 0.85}
                />
              );
            })}

            {/* Node circles */}
            {AGENTS.map(id => {
              const e = energies[id];
              const n = NODES[id];
              const r = 9 + e * 9;
              const active = e > 0;
              return (
                <g key={`node-${id}`}>
                  <circle
                    cx={n.x} cy={n.y} r={r}
                    fill="rgba(6,6,16,0.92)"
                    stroke={n.hex}
                    strokeWidth={active ? 1.5 : 0.5}
                    strokeOpacity={active ? 0.85 : 0.22}
                  />
                  <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize={r > 14 ? "10" : "8"}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {n.emoji}
                  </text>
                  <text x={n.x} y={n.y + r + 8} textAnchor="middle"
                    fontSize="5.5"
                    fontFamily="'Courier New', monospace"
                    letterSpacing="0.08"
                    fill={active ? n.hex : "#444"}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {n.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Agent status bars */}
        <div className="flex-1 flex flex-col justify-center gap-2.5 min-w-0">
          {AGENTS.map(id => {
            const e = energies[id];
            const level = tasksToLevel(simActivity.tasks[id] ?? 0);
            const n = NODES[id];
            const pct = Math.max(4, Math.round(e * 100));
            return (
              <div key={id}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-mono text-[8px] text-muted-foreground/65">{n.name}</span>
                  <span className="font-mono text-[8px]" style={{ color: e > 0 ? n.hex : "#444" }}>
                    {level === "idle" ? "IDLE" : level.toUpperCase()}
                  </span>
                </div>
                <div className="w-full h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: n.hex, opacity: e > 0 ? 0.8 : 0.15 }}
                  />
                </div>
              </div>
            );
          })}

          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="font-mono text-[7.5px] text-muted-foreground/35 leading-snug">
              {activeAgents} agent{activeAgents !== 1 ? "s" : ""} active
              {activeLinks > 0 && <> · {activeLinks} active link{activeLinks !== 1 ? "s" : ""}</>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
