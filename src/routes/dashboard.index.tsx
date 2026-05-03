import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, PieChart, Wallet } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { useBusinesses } from "@/hooks/useBusinesses";
import { usePlans, useAllocations } from "@/hooks/usePlans";
import { useActivities } from "@/hooks/useActivities";
import { BusinessSelector } from "@/components/data/BusinessSelector";
import { fmt, CHANNELS } from "@/lib/store";
import type { ChannelEnum } from "@/integrations/supabase/types";
import { planMonthLabel } from "@/services/budget.service";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/")({ component: Overview });

function Overview() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";
  const { data: businesses = [], isLoading: bizLoading } = useBusinesses(userId);
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) setSelectedBizId(businesses[0].id);
  }, [businesses, selectedBizId]);

  const { data: plans = [], isLoading: plansLoading } = usePlans(selectedBizId ?? undefined);
  const { data: allocData } = useAllocations(selectedBizId ?? undefined);
  const { data: activitiesResult, isLoading: activLoading } = useActivities(
    selectedPlanId ?? undefined, undefined, { column: "activity_date", ascending: true }
  );

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const allocations = allocData?.percentages ?? {};
  const amounts = allocData?.amounts ?? {};
  const activities = activitiesResult?.data ?? [];
  const used = activities.reduce((s, a) => s + a.budget_used, 0);
  const completed = activities.filter((a) => a.status === "Completed").length;

  const stats = [
    { label: "Monthly budget", value: fmt(selectedBiz?.monthly_budget ?? 0), icon: Wallet, color: "text-primary" },
    { label: "Budget used", value: fmt(used), icon: PieChart, color: "text-accent" },
    { label: "Activities", value: activities.length, icon: CalendarDays, color: "text-chart-3" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success" },
  ];

  if (bizLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 h-24 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Overview</h1>
          <p className="mt-1 text-muted-foreground">Your marketing month at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BusinessSelector userId={userId} selectedBusinessId={selectedBizId} onSelect={(id) => { setSelectedBizId(id); setSelectedPlanId(null); }} />
          {plans.length > 0 && (
            <Select value={selectedPlanId ?? ""} onValueChange={setSelectedPlanId}>
              <SelectTrigger id="plan-select" className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{planMonthLabel(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!selectedBizId ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <p className="text-muted-foreground">Create your first business to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
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
                <Link to="/dashboard/budget" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Edit <ArrowRight className="h-3 w-3" /></Link>
              </div>
              <div className="space-y-4">
                {CHANNELS.map((c, i) => {
                  const pct = allocations[c as ChannelEnum] ?? 0;
                  const amt = amounts[c as ChannelEnum] ?? 0;
                  return (
                    <div key={c}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{c}</span>
                        <span className="text-muted-foreground">{fmt(amt)} · {pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: `var(--chart-${(i % 5) + 1})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Upcoming</h2>
                <Link to="/dashboard/calendar" className="text-sm text-primary hover:underline inline-flex items-center gap-1">View <ArrowRight className="h-3 w-3" /></Link>
              </div>
              {!selectedPlanId ? (
                <p className="text-sm text-muted-foreground">Select a month to view activities.</p>
              ) : activLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)}</div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activities yet.</p>
              ) : (
                <ul className="space-y-3">
                  {activities.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex flex-col items-center justify-center text-[10px] font-bold uppercase shrink-0">
                        {new Date(a.activity_date).toLocaleDateString("en", { month: "short" })}
                        <span className="text-sm">{new Date(a.activity_date).getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.channel} · {fmt(a.budget_used)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
