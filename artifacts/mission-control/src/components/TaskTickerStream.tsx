// TaskTickerStream — animated incoming task ticker at the top of the dashboard.
import { AnimatePresence, motion } from "framer-motion";
import type { StreamTask, TaskStreamState } from "@/lib/task-stream";
import { AGENT_EMOJI, PRIORITY_COLOR } from "@/lib/task-stream";

const PRIORITY_LABEL: Record<StreamTask["priority"], string> = {
  critical: "P0", high: "P1", medium: "P2", low: "P3",
};

function TickerCard({ task, onIntercept }: { task: StreamTask; onIntercept: (id: string) => void }) {
  return (
    <motion.div
      layout
      key={task.id}
      initial={{ x: 80, opacity: 0, scale: 0.88 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ y: -28, opacity: 0, scale: 0.82, transition: { duration: 0.38 } }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer select-none"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${PRIORITY_COLOR[task.priority]}44`,
        boxShadow: `0 0 6px ${PRIORITY_COLOR[task.priority]}18`,
      }}
      onClick={() => onIntercept(task.id)}
      title="Click to intercept and reassign"
    >
      <span
        className="font-mono text-[7px] font-bold rounded px-1"
        style={{ background: `${PRIORITY_COLOR[task.priority]}22`, color: PRIORITY_COLOR[task.priority] }}
      >
        {PRIORITY_LABEL[task.priority]}
      </span>
      <span className="text-[11px] leading-none">{AGENT_EMOJI[task.agentId]}</span>
      <span className="font-mono text-[9px] text-foreground/70 max-w-[130px] truncate">{task.title}</span>
    </motion.div>
  );
}

interface Props {
  tasks: TaskStreamState["tickerTasks"];
  onIntercept: TaskStreamState["dismissTask"];
}

export function TaskTickerStream({ tasks, onIntercept }: Props) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg overflow-hidden relative"
      style={{
        background: "rgba(0,0,0,0.28)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(6px)",
        minHeight: 40,
      }}
    >
      <span className="font-mono text-[7.5px] tracking-[0.18em] text-muted-foreground/40 shrink-0 pr-2 border-r border-border/20 mr-1">
        INCOMING
      </span>

      {tasks.length === 0 ? (
        <span className="font-mono text-[8px] text-muted-foreground/30 italic">
          Queue nominal — no incoming tasks
        </span>
      ) : (
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map(task => (
              <TickerCard key={task.id} task={task} onIntercept={onIntercept} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <span className="font-mono text-[7px] text-muted-foreground/25 shrink-0 pl-2 border-l border-border/20 ml-1">
        CLICK TO INTERCEPT
      </span>
    </div>
  );
}
