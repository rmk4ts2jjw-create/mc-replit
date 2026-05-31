import { motion, AnimatePresence } from "framer-motion";
import type { TaskFlowPacket } from "@/lib/station-state";

interface TaskFlowSignalsProps {
  packets: TaskFlowPacket[];
}

export function TaskFlowSignals({ packets }: TaskFlowSignalsProps) {
  if (packets.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card/30 p-4">
      <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-3">TASK FLOW</div>
      <div className="flex items-center gap-4 overflow-x-auto">
        <AnimatePresence>
          {packets.map(packet => (
            <motion.div
              key={packet.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, x: 50 }}
              className="flex items-center gap-2 shrink-0"
            >
              <span className="font-mono text-[9px] text-muted-foreground">{packet.from}</span>
              <motion.div
                className="w-8 h-1 rounded-full bg-gradient-to-r from-violet to-cyan-accent"
                animate={{ scaleX: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="font-mono text-[9px] text-muted-foreground">{packet.to}</span>
              <span className="font-mono text-[8px] text-violet">{packet.progress}%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
