import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { EmptyCameo } from "@/components/PageHeader";
import { useLiveStationData } from "@/lib/live-data";

const queryClient = new QueryClient();

const PAGE_META: Record<string, { title: string; icon: string }> = {
  "/":          { title: "Dashboard",   icon: "🛰" },
  "/tasks":     { title: "Task Queue",  icon: "📋" },
  "/crons":     { title: "Cron Jobs",   icon: "⏱" },
  "/incidents": { title: "Incidents",   icon: "🚨" },
  "/memory":    { title: "Memory",      icon: "🧠" },
  "/wiki":      { title: "Wiki",        icon: "📖" },
  "/projects":  { title: "Projects",    icon: "🗂" },
  "/activity":  { title: "Activity",    icon: "📡" },
  "/system":    { title: "System",      icon: "⚙️" },
};

function TopBar() {
  const [path] = useLocation();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const page = PAGE_META[path] ?? { title: "Mission Control", icon: "🛰" };

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-2.5 border-b border-border/50 bg-background/85 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="text-base leading-none opacity-70">{page.icon}</span>
        <span className="text-sm font-semibold tracking-tight">{page.title}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.23_155)] animate-pulse-soft" />
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground/60">STATION ONLINE</span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground/50">{time}</span>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="glass-card max-w-md text-center px-10 py-14">
        <div className="text-5xl mb-3 opacity-50">🚪</div>
        <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
        <h2 className="text-lg font-semibold text-foreground/80">This corridor doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Space Monkey suggests turning back. The page you're looking for isn't on the station map.
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
            Return to Mission Control
          </a>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl leading-none">{icon}</span>
        <span>{title}</span>
      </h1>
      <div className="glass-card overflow-hidden relative px-8 py-16 text-center">
        {/* Scan line animation */}
        <div className="absolute inset-x-0 top-0 h-px loader-scan opacity-60" />
        <div className="text-4xl mb-5 opacity-30">{icon}</div>
        <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground/50 mb-3">— UNDER CONSTRUCTION —</div>
        <div className="text-base font-semibold text-foreground/60">{title}</div>
        <div className="mt-2 font-mono text-[9px] text-muted-foreground/35">
          This section is being assembled. Check back soon.
        </div>
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-[var(--cyan-accent)]/30" />
        <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-[var(--cyan-accent)]/30" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-[var(--cyan-accent)]/30" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-[var(--cyan-accent)]/30" />
      </div>
    </div>
  );
}

function DashboardPage() {
  const liveData = useLiveStationData();
  return <Dashboard liveData={liveData} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/tasks">{() => <PlaceholderPage title="Task Queue" icon="📋" />}</Route>
      <Route path="/crons">{() => <PlaceholderPage title="Cron Jobs" icon="⏱" />}</Route>
      <Route path="/incidents">{() => <PlaceholderPage title="Incidents" icon="🚨" />}</Route>
      <Route path="/memory">{() => <PlaceholderPage title="Memory" icon="🧠" />}</Route>
      <Route path="/wiki">{() => <PlaceholderPage title="Wiki" icon="📖" />}</Route>
      <Route path="/projects">{() => <PlaceholderPage title="Projects" icon="🗂" />}</Route>
      <Route path="/activity">{() => <PlaceholderPage title="Activity" icon="📡" />}</Route>
      <Route path="/system">{() => <PlaceholderPage title="System" icon="⚙️" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AnimatedOutlet() {
  const [path] = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={path}
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Router />
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1650px] px-6 py-8 md:px-10 md:py-10">
            <AnimatedOutlet />
          </div>
          <div className="mx-auto max-w-[1650px] px-6 pb-4 md:px-10">
            <div className="border-t border-border/20 pt-3 flex items-center justify-between">
              <span className="font-mono text-[8px] text-muted-foreground/30 tracking-wider">MISSION CONTROL · v2026.5</span>
              <span className="font-mono text-[8px] text-muted-foreground/30 tracking-wider">STATION ONLINE</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppLayout />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
