// TaskSidebar — collapsible right panel with draggable pending tasks.
// Users drag task cards onto agent rooms to manually assign them.

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import type { StreamTask, TaskStreamState } from "@/lib/task-stream";
import { AGENT_EMOJI, PRIORITY_COLOR } from "@/lib/task-stream";
import type { SimAgentId } from "@/lib/room-energy";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  critical: "CRITICAL", high: "HIGH", medium: "MED", low: "LOW",
};
type TaskPriority = StreamTask["priority"];

const PRIORITY_ORDER: TaskPriority[] = ["critical", "high", "medium", "low"];

function DraggableCard({ task, onDismiss }: { task: StreamTask; onDismiss: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <motion.div
      layout
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="rounded px-2.5 py-2 mb-1.5 cursor-grab active:cursor-grabbing select-none relative group"
        style={{
          background: isDragging ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${PRIORITY_COLOR[task.priority]}${isDragging ? "88" : "33"}`,
          boxShadow: isDragging ? `0 8px 24px rgba(0,0,0,0.5), 0 0 10px ${PRIORITY_COLOR[task.priority]}44` : "none",
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.92 : 1,
          zIndex: isDragging ? 9999 : 1,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="font-mono text-[7px] font-bold px-1 rounded"
            style={{ background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority] }}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
          <button
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-muted-foreground font-mono text-[9px] leading-none transition-opacity"
            onPointerDown={e => { e.stopPropagation(); }}
            onClick={e => { e.stopPropagation(); onDismiss(); }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
        <div className="font-mono text-[9px] text-foreground/75 leading-snug mb-1 pr-1">{task.title}</div>
        <div className="flex items-center gap-1">
          <span className="text-[9px]">{AGENT_EMOJI[task.agentId as SimAgentId]}</span>
          <span className="font-mono text-[7px] text-muted-foreground/45">suggested → {task.agentId}</span>
        </div>
        {/* Drag hint */}
        {!isDragging && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" className="text-foreground">
              <rect x="0" y="0" width="3" height="3" rx="1" />
              <rect x="5" y="0" width="3" height="3" rx="1" />
              <rect x="0" y="5" width="3" height="3" rx="1" />
              <rect x="5" y="5" width="3" height="3" rx="1" />
              <rect x="0" y="10" width="3" height="3" rx="1" />
              <rect x="5" y="10" width="3" height="3" rx="1" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface Props {
  tasks: StreamTask[];
  onDismiss: TaskStreamState["dismissTask"];
}

export function TaskSidebar({ tasks, onDismiss }: Props) {
  const [open, setOpen] = useState(true);

  const sorted = [...tasks].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  return (
    <>
      {/* Toggle tab */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex flex-col items-center gap-1 px-1.5 py-3 rounded-l-lg transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRight: "none",
            color: "rgba(255,255,255,0.35)",
          }}
          title={open ? "Collapse task queue" : "Expand task queue"}
        >
          <span className="font-mono text-[7px] tracking-widest" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            QUEUE
          </span>
          {tasks.length > 0 && (
            <span className="font-mono text-[8px] font-bold" style={{ color: tasks.some(t => t.priority === "critical") ? "#ff4040" : tasks.some(t => t.priority === "high") ? "#ff9020" : "#60b8ff" }}>
              {tasks.length}
            </span>
          )}
          <span className="text-[10px]">{open ? "›" : "‹"}</span>
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="overflow-hidden shrink-0"
          >
            <div
              className="h-full rounded-lg overflow-y-auto"
              style={{
                background: "rgba(4,4,14,0.88)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                width: 200,
              }}
            >
              <div className="px-3 py-2.5 border-b border-border/25">
                <div className="font-mono text-[8px] tracking-[0.2em] text-muted-foreground/50">PENDING TASKS</div>
                <div className="font-mono text-[7px] text-muted-foreground/30 mt-0.5">Drag → agent room to assign</div>
              </div>

              <div className="p-2">
                <AnimatePresence initial={false}>
                  {sorted.length === 0 ? (
                    <div className="font-mono text-[8px] text-muted-foreground/25 text-center py-6 italic">Queue clear</div>
                  ) : (
                    sorted.map(task => (
                      <DraggableCard key={task.id} task={task} onDismiss={() => onDismiss(task.id)} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
