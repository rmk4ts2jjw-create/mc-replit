import { useLocation, Link } from "wouter";
import { CREW } from "@/lib/crew";
import { getBuildLabel } from "@/lib/build-info";
import { cn } from "@/lib/utils";
import { useActivitySim, tasksToLevel, type SimAgentId } from "@/lib/room-energy";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number | string;
}

const NAV_SECTIONS = [
  {
    label: "OPERATIONS",
    items: [
      { href: "/tasks",     label: "Task Queue",   icon: "📋" },
      { href: "/crons",     label: "Cron Jobs",    icon: "⏱" },
      { href: "/incidents", label: "Incidents",    icon: "🚨" },
    ] as NavItem[],
  },
  {
    label: "KNOWLEDGE",
    items: [
      { href: "/memory",    label: "Memory",       icon: "🧠" },
      { href: "/wiki",      label: "Wiki",         icon: "📖" },
    ] as NavItem[],
  },
  {
    label: "STATION",
    items: [
      { href: "/projects",  label: "Projects",     icon: "🗂" },
      { href: "/activity",  label: "Activity",     icon: "📡" },
      { href: "/system",    label: "System",       icon: "⚙️" },
    ] as NavItem[],
  },
];

const ACCENT_CLASSES: Record<string, string> = {
  monkey:      "border-l-2 border-violet/60",
  lifesupport: "border-l-2 border-pink-400/60",
  engineer:    "border-l-2 border-cyan-400/60",
  archivist:   "border-l-2 border-yellow-400/60",
};

const WL_DOT: Record<string, string> = {
  idle:     "bg-muted-foreground/25",
  light:    "bg-[oklch(0.85_0.23_155)]",
  medium:   "bg-[oklch(0.82_0.17_80)]",
  heavy:    "bg-orange-400 animate-pulse",
  critical: "bg-red-400 animate-pulse",
};

export function AppSidebar() {
  const [path] = useLocation();
  const simActivity = useActivitySim();

  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);

  return (
    <aside className="flex h-full w-56 flex-col bg-sidebar border-r border-sidebar-border select-none shrink-0">
      {/* Station header */}
      <div className="px-4 pt-5 pb-4 border-b border-sidebar-border/60">
        <Link href="/">
          <div className="rounded-lg border border-sidebar-border bg-card/30 px-3 py-2.5 cursor-pointer hover:bg-card/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7 rounded-full bg-[oklch(0.82_0.15_220/0.15)] flex items-center justify-center shrink-0">
                <span className="text-sm">🛰</span>
                <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.23_155)] ring-1 ring-sidebar sound-ping" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs leading-tight tracking-[0.16em] text-sidebar-foreground">MISSION CTRL</div>
                <div className="font-mono text-[9px] text-sidebar-foreground/35 leading-tight">{getBuildLabel()}</div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Dashboard — top-level item */}
      <div className="px-3 pt-3 pb-1">
        <Link href="/">
          <div className={cn(
            "group relative flex h-10 items-center justify-between rounded-lg pl-3.5 pr-3 text-sm transition-all duration-150 cursor-pointer",
            isActive("/")
              ? "bg-[oklch(0.82_0.15_220/0.10)] text-foreground shadow-[inset_3px_0_0_0_var(--cyan-accent),0_0_18px_-6px_oklch(0.82_0.15_220/0.55)]"
              : "text-sidebar-foreground/70 hover:bg-white/[0.04] hover:text-sidebar-foreground",
          )}>
            <span className="flex items-center gap-2.5">
              <span className={cn(
                "text-base leading-none w-5 text-center transition-opacity",
                isActive("/") ? "opacity-100" : "opacity-60 group-hover:opacity-90"
              )}>🛰</span>
              <span className="font-medium tracking-tight">Dashboard</span>
            </span>
            {isActive("/") && <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.23_155)]" />}
          </div>
        </Link>
      </div>

      {/* Sectioned nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="px-3.5 pt-1 pb-1.5 text-[9px] font-semibold tracking-[0.22em] text-sidebar-foreground/35 uppercase">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "group relative flex h-10 items-center justify-between rounded-lg pl-3.5 pr-3 text-sm transition-all duration-150 cursor-pointer",
                      active
                        ? "bg-[oklch(0.82_0.15_220/0.10)] text-foreground shadow-[inset_3px_0_0_0_var(--cyan-accent),0_0_18px_-6px_oklch(0.82_0.15_220/0.55)]"
                        : "text-sidebar-foreground/70 hover:bg-white/[0.04] hover:text-sidebar-foreground",
                    )}>
                      <span className="flex items-center gap-2.5">
                        <span className={cn(
                          "text-base leading-none w-5 text-center transition-opacity",
                          active ? "opacity-100" : "opacity-55 group-hover:opacity-85"
                        )}>{item.icon}</span>
                        <span className="font-medium tracking-tight">{item.label}</span>
                      </span>
                      {item.badge !== undefined && (
                        <span className="ml-auto rounded-full bg-[oklch(0.82_0.15_220/0.15)] border border-[var(--cyan-accent)]/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--cyan-accent)] min-w-[20px] text-center leading-none">
                          {item.badge}
                        </span>
                      )}
                      {!item.badge && active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.23_155)]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Crew roster */}
      <div className="border-t border-sidebar-border/60 px-3 py-3">
        <div className="font-mono text-[8px] tracking-[0.22em] text-sidebar-foreground/30 mb-2 px-0.5">CREW</div>
        <div className="space-y-0.5">
          {CREW.map(member => {
            const wl = tasksToLevel(simActivity.tasks[member.id as SimAgentId] ?? 0);
            const dotCls = WL_DOT[wl] ?? WL_DOT.idle;
            return (
              <div key={member.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-default",
                  ACCENT_CLASSES[member.id]
                )}>
                <span className="shrink-0 text-base leading-none">{member.emoji}</span>
                <div className="min-w-0">
                  <div className="font-medium text-[10px] text-sidebar-foreground/80 leading-tight truncate">{member.name}</div>
                  <div className="font-mono text-[8px] text-sidebar-foreground/35 leading-tight truncate">{member.shortRole}</div>
                </div>
                <div className={cn("ml-auto shrink-0 w-1.5 h-1.5 rounded-full", dotCls)} />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
