import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/lib/auth-context";
import { useBusinesses } from "@/hooks/useBusinesses";
import { usePlans, useAllocations } from "@/hooks/usePlans";
import { BusinessSelector } from "@/components/data/BusinessSelector";
import { ActivityTable } from "@/components/data/ActivityTable";
import { useUser } from "@/hooks/useUser";
import { fmt, CHANNELS } from "@/lib/store";
import type { ChannelEnum } from "@/integrations/supabase/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { planMonthLabel } from "@/services/budget.service";

export const Route = createFileRoute("/dashboard/data")({
  component: DataExplorerPage,
  head: () => ({ meta: [{ title: "Data Explorer — Stratifyr" }] }),
});

function DataExplorerPage() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";

  const { data: profile, isLoading: profileLoading } = useUser(userId);
  const { data: businesses = [], isLoading: bizLoading, refetch: refetchBiz } = useBusinesses(userId);
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) setSelectedBizId(businesses[0].id);
  }, [businesses, selectedBizId]);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);

  const { data: plans = [] } = usePlans(selectedBizId ?? undefined);
  const { data: allocData } = useAllocations(selectedBizId ?? undefined);
  const allocations = allocData?.rows ?? [];

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Data Explorer</h1>
          </div>
          <p className="text-muted-foreground">
            Full CRUD access to your business and marketing data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BusinessSelector userId={userId} selectedBusinessId={selectedBizId} onSelect={(id) => { setSelectedBizId(id); setSelectedPlanId(null); }} />
          {plans.length > 0 && (
            <Select value={selectedPlanId ?? ""} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{planMonthLabel(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button id="refresh-all" variant="outline" size="sm" onClick={() => refetchBiz()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* DB Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Businesses", value: bizLoading ? "…" : String(businesses.length), badge: "businesses" },
          { label: "Plans (selected biz)", value: String(plans.length), badge: "marketing_plans" },
          { label: "Your email", value: user?.email?.split("@")[0] ?? "—", badge: "users" },
          { label: "Allocations", value: allocations.length > 0 ? `${allocations.length} / 5` : "0 / 5", badge: "budget_allocations" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-xl font-display font-bold">{s.value}</p>
            <Badge variant="secondary" className="mt-2 text-[10px] font-mono">{s.badge}</Badge>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activities">
        <TabsList className="mb-4 overflow-x-auto w-full justify-start">
          <TabsTrigger value="activities" id="tab-activities">activities</TabsTrigger>
          <TabsTrigger value="businesses" id="tab-businesses">businesses</TabsTrigger>
          <TabsTrigger value="marketing_plans" id="tab-plans">marketing_plans</TabsTrigger>
          <TabsTrigger value="allocations" id="tab-allocations">budget_allocations</TabsTrigger>
          <TabsTrigger value="users" id="tab-profile">users</TabsTrigger>
        </TabsList>

        {/* ── activities tab ─── */}
        <TabsContent value="activities">
          {!selectedPlanId ? (
            <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
              <p className="text-muted-foreground">Select a business and a plan to view its activities.</p>
            </div>
          ) : (
            <ActivityTable planId={selectedPlanId} />
          )}
        </TabsContent>

        {/* ── businesses tab ─── */}
        <TabsContent value="businesses">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-muted-foreground">businesses · {businesses.length} rows</span>
              <Badge variant="outline" className="font-mono text-[10px]">RLS enabled</Badge>
            </div>
            {bizLoading ? (
              <div className="p-8 text-center"><div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" /></div>
            ) : businesses.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No businesses yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      {["id", "business_name", "industry_type", "monthly_budget", "goal", "created_at"].map((col) => (
                        <th key={col} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {businesses.map((b) => (
                      <tr key={b.id} className={`hover:bg-muted/20 ${b.id === selectedBizId ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 font-medium">{b.business_name}</td>
                        <td className="px-4 py-3">{b.industry_type || "—"}</td>
                        <td className="px-4 py-3 font-mono">{fmt(b.monthly_budget)}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate" title={b.goal}>{b.goal || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── marketing_plans tab ─── */}
        <TabsContent value="marketing_plans">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-muted-foreground">marketing_plans · {plans.length} rows for selected business</span>
              <Badge variant="outline" className="font-mono text-[10px]">RLS enabled</Badge>
            </div>
            {!selectedBizId ? (
               <div className="p-8 text-center text-sm text-muted-foreground">Select a business to view its plans.</div>
            ) : plans.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No plans yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      {["id", "month/year", "total_budget", "created_at"].map((col) => (
                        <th key={col} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {plans.map((p) => (
                      <tr key={p.id} className={`hover:bg-muted/20 ${p.id === selectedPlanId ? "bg-primary/5" : ""}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.id.slice(0, 8)}…</td>
                        <td className="px-4 py-3 font-medium">{planMonthLabel(p)}</td>
                        <td className="px-4 py-3 font-mono">{fmt(p.total_budget)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── budget_allocations tab ─── */}
        <TabsContent value="allocations">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-muted-foreground">
                budget_allocations · {allocations.length} channels for selected business
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">RLS enabled</Badge>
            </div>
            {!selectedBizId ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Select a business to view allocations.</div>
            ) : allocations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No allocations yet. Set them in Budget Planner.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      {["channel", "allocated_amount", "percentage"].map((col) => (
                        <th key={col} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {CHANNELS.map((ch, i) => {
                      const row = allocations.find(a => a.channel === ch);
                      if (!row) return null;
                      return (
                        <tr key={ch} className="hover:bg-muted/20">
                          <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-[10px]">{ch}</Badge></td>
                          <td className="px-4 py-3 font-mono font-medium">{fmt(row.allocated_amount)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${row.percentage}%`, background: `var(--chart-${(i % 5) + 1})` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{row.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── users tab ─── */}
        <TabsContent value="users">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex items-center justify-between">
              <span className="text-sm font-mono font-medium text-muted-foreground">users · 1 row (yours)</span>
              <Badge variant="outline" className="font-mono text-[10px]">RLS enabled</Badge>
            </div>
            {profileLoading ? (
              <div className="p-8 text-center"><div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" /></div>
            ) : !profile ? (
              <div className="p-8 text-center text-sm text-muted-foreground">User record not found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      {["field", "value"].map((col) => (
                        <th key={col} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {[
                      ["id", profile.id],
                      ["name", profile.name],
                      ["email", profile.email],
                      ["plan_type", profile.plan_type],
                      ["created_at", new Date(profile.created_at).toLocaleString()],
                    ].map(([field, value]) => (
                      <tr key={field} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{field}</td>
                        <td className="px-4 py-3 font-medium truncate max-w-xs" title={String(value)}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
