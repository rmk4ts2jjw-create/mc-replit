import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { EmptyCameo } from "@/components/PageHeader";
import { useLiveStationData } from "@/lib/live-data";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-3 opacity-70">🚪</div>
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">This corridor doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Space Monkey suggests turning back. The page you're looking for isn't on the station map.
        </p>
        <div className="mt-6">
          <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Return to Mission Control
          </a>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl leading-none">{icon}</span>
        <span>{title}</span>
      </h1>
      <EmptyCameo
        icon={icon}
        message={`${title} — coming soon`}
        hint="This section is under construction."
        tone="calm"
      />
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

function AppLayout() {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="mx-auto max-w-[1650px] px-6 py-8 md:px-10 md:py-10 page-transition">
          <Router />
        </div>
        <div className="mx-auto max-w-[1650px] px-6 pb-4 md:px-10">
          <div className="border-t border-border/30 pt-3 flex items-center justify-between">
            <span className="font-mono text-[8px] text-muted-foreground/40 tracking-wider">MISSION CONTROL · v2026.5</span>
            <span className="font-mono text-[8px] text-muted-foreground/40 tracking-wider">STATION ONLINE</span>
          </div>
        </div>
      </main>
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
