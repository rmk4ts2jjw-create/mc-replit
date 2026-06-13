// EventLog — live scrolling feed of station events.
import { AnimatePresence, motion } from "framer-motion";
import type { LogEvent } from "@/lib/task-stream";
import { LOG_EVENT_COLOR } from "@/lib/task-stream";

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5)  return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

function EventRow({ event }: { event: LogEvent }) {
  const color = LOG_EVENT_COLOR[event.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="overflow-hidden"
    >
      <div className="flex items-start gap-2 py-1.5 border-b border-border/10 last:border-0 group">
        {/* Color indicator dot */}
        <div
          className="w-1 shrink-0 self-stretch rounded-full mt-0.5 opacity-75"
          style={{ background: color, minHeight: 10 }}
        />
        {/* Message */}
        <div className="flex-1 min-w-0">
          <div
            className="font-mono text-[8.5px] leading-snug truncate"
            style={{ color: "rgba(255,255,255,0.68)" }}
            title={event.message}
          >
            {event.message}
          </div>
        </div>
        {/* Timestamp */}
        <div className="shrink-0 font-mono text-[7px] text-muted-foreground/30 whitespace-nowrap">
          {relativeTime(event.ts)}
        </div>
      </div>
    </motion.div>
  );
}

interface Props {
  events: LogEvent[];
}

export function EventLog({ events }: Props) {
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/25 shrink-0">
        <div className="label-tracked">STATION LOG</div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.88_0.18_145)] animate-pulse" />
          <span className="font-mono text-[7px] text-muted-foreground/35">LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1" style={{ maxHeight: 160 }}>
        <AnimatePresence initial={false} mode="popLayout">
          {events.length === 0 ? (
            <div className="font-mono text-[8px] text-muted-foreground/25 italic text-center py-4">
              Awaiting station activity…
            </div>
          ) : (
            events.map(ev => <EventRow key={ev.id} event={ev} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
