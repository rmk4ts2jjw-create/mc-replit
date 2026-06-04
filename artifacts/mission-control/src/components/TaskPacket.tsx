// TaskPacket — animated data packet that flies from the station hub to a room
// when a new task is assigned. Gives the station an event-driven "feel".

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ROOM_CENTERS: Record<string, { x: number; y: number }> = {
  command:  { x: 25, y: 28 },
  security: { x: 75, y: 28 },
  workshop: { x: 25, y: 78 },
  archive:  { x: 75, y: 78 },
};
const HUB = { x: 50, y: 50 };

const PACKET_COLORS: Record<string, string> = {
  command:  "#60b8ff",
  security: "#ff4090",
  workshop: "#30e8e0",
  archive:  "#ffb820",
};

interface PacketProps {
  id: string;
  room: string;
  onComplete: (id: string) => void;
}

function TaskPacket({ id, room, onComplete }: PacketProps) {
  const dest  = ROOM_CENTERS[room] ?? HUB;
  const color = PACKET_COLORS[room] ?? "#ffffff";

  return (
    <motion.div
      className="pointer-events-none absolute z-[25]"
      style={{ left: `${HUB.x}%`, top: `${HUB.y}%`, x: "-50%", y: "-50%" }}
      animate={{
        left:    [`${HUB.x}%`, `${dest.x}%`,  `${dest.x}%`],
        top:     [`${HUB.y}%`, `${dest.y}%`,  `${dest.y}%`],
        scale:   [1.2,          1.0,            2.2],
        opacity: [1,            1,              0],
      }}
      transition={{ duration: 1.5, ease: "easeInOut", times: [0, 0.72, 1] }}
      onAnimationComplete={() => onComplete(id)}
    >
      <div style={{
        width: 10, height: 10,
        borderRadius: 2,
        transform: "rotate(45deg)",
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}, 0 0 20px ${color}80`,
        border: `1px solid ${color}`,
      }} />
      <div className="absolute" style={{
        width: 6, height: 6, borderRadius: "50%",
        top: 2, left: 2,
        backgroundColor: color, opacity: 0.45,
        filter: "blur(3px)",
      }} />
    </motion.div>
  );
}

// ── Layer: manages multiple packets, spawns one when task count rises ──────
interface TaskPacketLayerProps {
  agentTasks: Record<string, number>;
}

export function TaskPacketLayer({ agentTasks }: TaskPacketLayerProps) {
  const [packets, setPackets] = useState<{ id: string; room: string }[]>([]);
  const prevRef = useRef<Record<string, number>>({});
  const AGENT_ROOMS: Record<string, string> = {
    monkey: "command", lifesupport: "security", engineer: "workshop", archivist: "archive",
  };

  useEffect(() => {
    const prev = prevRef.current;
    const newOnes: { id: string; room: string }[] = [];
    for (const [agentId, count] of Object.entries(agentTasks)) {
      if (count > (prev[agentId] ?? 0)) {
        const room = AGENT_ROOMS[agentId];
        if (room) newOnes.push({ id: `pkt-${agentId}-${Date.now()}-${Math.random()}`, room });
      }
    }
    if (newOnes.length > 0) setPackets(p => [...p, ...newOnes]);
    prevRef.current = { ...agentTasks };
  }, [agentTasks]);

  return (
    <>
      {packets.map(p => (
        <TaskPacket
          key={p.id}
          id={p.id}
          room={p.room}
          onComplete={completed => setPackets(prev => prev.filter(x => x.id !== completed))}
        />
      ))}
    </>
  );
}
