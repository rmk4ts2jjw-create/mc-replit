import { useLocation, Link } from "wouter";
import { CREW } from "@/lib/crew";
import { getBuildLabel } from "@/lib/build-info";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number | string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "Dashboard",    icon: "🛰" },
  { href: "/tasks",     label: "Task Queue",   icon: "📋" },
  { href: "/crons",     label: "Cron Jobs",    icon: "⏱" },
  { href: "/incidents", label: "Incidents",    icon: "🚨" },
  { href: "/memory",    label: "Memory",       icon: "🧠" },
  { href: "/wiki",      label: "Wiki",         icon: "📖" },
  { href: "/projects",  label: "Projects",     icon: "🗂" },
  { href: "/activity",  label: "Activity",     icon: "📡" },
  { href: "/system",    label: "System",       icon: "⚙️" },
];

const ACCENT_CLASSES: Record<string, string> = {
  monkey:      "border-l-2 border-violet/60",
  lifesupport: "border-l-2 border-pink-400/60",
  engineer:    "border-l-2 border-cyan-400/60",
  archivist:   "border-l-2 border-yellow-400/60",
};

export function AppSidebar() {
  const [path] = useLocation();

  return (
    <aside className="flex h-full w-56 flex-col bg-sidebar border-r border-sidebar-border select-none shrink-0">
      {/* Station header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border/60">
        <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
          <span className="text-sm">🛰</span>
          <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-[oklch(0.88_0.18_145)] ring-1 ring-sidebar" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm leading-tight truncate text-sidebar-foreground">MISSION CTRL</div>
          <div className="font-mono text-[9px] text-sidebar-foreground/40 leading-tight truncate">{getBuildLabel()}</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === "/" ? path === "/" : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <span className="text-base leading-none w-5 shrink-0 text-center">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto rounded-full bg-violet/25 px-1.5 py-0.5 font-mono text-[9px] text-violet leading-none">{item.badge}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Crew roster */}
      <div className="border-t border-sidebar-border/60 px-3 py-3">
        <div className="font-mono text-[8px] tracking-[0.18em] text-sidebar-foreground/30 mb-2">CREW</div>
        <div className="space-y-1">
          {CREW.map(member => (
            <div key={member.id}
              className={cn("flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors cursor-default", ACCENT_CLASSES[member.id])}>
              <span className="shrink-0 text-base leading-none">{member.emoji}</span>
              <div className="min-w-0">
                <div className="font-medium text-[10px] text-sidebar-foreground/80 leading-tight truncate">{member.name}</div>
                <div className="font-mono text-[8px] text-sidebar-foreground/40 leading-tight truncate">{member.shortRole}</div>
              </div>
              <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-[oklch(0.88_0.18_145)] opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
