import { motion, AnimatePresence } from "framer-motion";

interface Collaboration {
  id: string;
  agents: [string, string];
  fromRoom: string;
  toRoom: string;
  sprite: string;
}

interface AgentTravelProps {
  collaborations: Collaboration[];
  roomPositions: Record<string, { x: number; y: number }>;
  isVisible: boolean;
}

const DEFAULT_ROOM_POSITIONS: Record<string, { x: number; y: number }> = {
  command: { x: 25, y: 25 },
  security: { x: 75, y: 25 },
  workshop: { x: 25, y: 75 },
  archive: { x: 75, y: 75 },
};

const HUB = { x: 50, y: 50 };

export function AgentTravel({ collaborations, roomPositions, isVisible }: AgentTravelProps) {
  const rooms = { ...DEFAULT_ROOM_POSITIONS, ...roomPositions };

  if (!isVisible || collaborations.length === 0) return null;

  return (
    <div className="relative w-full h-0 overflow-visible">
      <svg className="absolute inset-0 w-full h-[300px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="collabGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.62 0.22 295 / 0.3)" />
            <stop offset="50%" stopColor="oklch(0.78 0.14 200 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 295 / 0.3)" />
          </linearGradient>
        </defs>

        {collaborations.map(collab => {
          const from = rooms[collab.fromRoom];
          const to = rooms[collab.toRoom];
          if (!from || !to) return null;
          const pathD = `M ${from.x} ${from.y} L ${HUB.x} ${HUB.y} L ${to.x} ${to.y}`;

          return (
            <g key={collab.id}>
              <path d={pathD} fill="none" stroke="url(#collabGradient)" strokeWidth="0.3" strokeDasharray="1 1" className="animate-dash" />
              <circle r="0.8" fill="oklch(0.78 0.14 200)" opacity="0.8">
                <animateMotion dur="3s" repeatCount="indefinite" path={pathD} />
              </circle>
              <circle r="0.5" fill="oklch(0.62 0.22 295)" opacity="0.5">
                <animateMotion dur="3s" repeatCount="indefinite" begin="1.5s" path={pathD} />
              </circle>
            </g>
          );
        })}

        <line x1="15" y1="50" x2="85" y2="50" stroke="oklch(0.20 0.03 265 / 0.15)" strokeWidth="0.2" strokeDasharray="2 2" />
        <line x1="50" y1="15" x2="50" y2="85" stroke="oklch(0.20 0.03 265 / 0.15)" strokeWidth="0.2" strokeDasharray="2 2" />

        <style>{`@keyframes dash { to { stroke-dashoffset: -2; } } .animate-dash { animation: dash 1s linear infinite; }`}</style>
      </svg>

      <AnimatePresence>
        {collaborations.map(collab => {
          const from = rooms[collab.fromRoom];
          const to = rooms[collab.toRoom];
          if (!from || !to) return null;

          return (
            <motion.div
              key={`travel-${collab.id}`}
              className="absolute pointer-events-none"
              style={{ left: `${from.x}%`, top: `${from.y}%`, transform: "translate(-50%, -50%)" }}
              animate={{ left: [`${from.x}%`, `${HUB.x}%`, `${to.x}%`], top: [`${from.y}%`, `${HUB.y}%`, `${to.y}%`] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            >
              <motion.div animate={{ y: [0, -3, 0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}>
                <img src={collab.sprite} alt="" className="w-10 h-10 object-contain" style={{ imageRendering: "pixelated" }} />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
