import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState, fmt, CHANNELS } from "@/lib/store";
import { ArrowRight, CalendarDays, CheckCircle2, PieChart, Wallet } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

function Overview() {
  const { state } = useAppState();
  const used = state.activities.reduce((s, a) => s + a.budget, 0);
  const completed = state.activities.filter((a) => a.status === "Completed").length;
  const upcoming = [...state.activities]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const stats = [
    { label: "Total budget", value: fmt(state.totalBudget), icon: Wallet, color: "text-primary" },
    { label: "Allocated", value: fmt(used), icon: PieChart, color: "text-accent" },
    { label: "Activities", value: state.activities.length, icon: CalendarDays, color: "text-chart-3" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Your marketing month at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {s.label}
              </p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="mt-3 text-2xl font-display font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Channel allocation</h2>
            <Link to="/dashboard/budget" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Edit <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {CHANNELS.map((c, i) => {
              const v = state.allocations[c] ?? 0;
              const pct = state.totalBudget ? (v / state.totalBudget) * 100 : 0;
              return (
                <div key={c}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{c}</span>
                    <span className="text-muted-foreground">
                      {fmt(v)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: `var(--chart-${(i % 5) + 1})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Upcoming</h2>
            <Link to="/dashboard/calendar" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activities yet.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex flex-col items-center justify-center text-[10px] font-bold uppercase shrink-0">
                    {new Date(a.date).toLocaleDateString("en", { month: "short" })}
                    <span className="text-sm">{new Date(a.date).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.channel} · {fmt(a.budget)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
