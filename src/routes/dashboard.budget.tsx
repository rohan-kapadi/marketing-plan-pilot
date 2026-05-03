import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "@/lib/auth-context";
import { useBusinesses, useUpdateBusiness } from "@/hooks/useBusinesses";
import { usePlans, useAllocations, useUpsertAllocations, useCreatePlan } from "@/hooks/usePlans";
import { BusinessSelector } from "@/components/data/BusinessSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmt, CHANNELS } from "@/lib/store";
import type { ChannelEnum } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/budget")({
  component: BudgetPage,
});

function BudgetPage() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";

  const { data: businesses = [] } = useBusinesses(userId);
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) {
      setSelectedBizId(businesses[0].id);
    }
  }, [businesses, selectedBizId]);

  const selectedBiz = businesses.find((b) => b.id === selectedBizId);
  
  // Need a plan to save to, or create one for the current month if it doesn't exist
  const { data: plans = [] } = usePlans(selectedBizId ?? undefined);
  const currentMonthPlan = plans.find(
    (p) => p.month === new Date().getMonth() + 1 && p.year === new Date().getFullYear()
  );

  const { data: savedAllocations } = useAllocations(selectedBizId ?? undefined);
  const upsertAllocations = useUpsertAllocations(selectedBizId ?? "", selectedBiz?.monthly_budget ?? 0);
  const updateBusiness = useUpdateBusiness(userId, selectedBizId ?? "");
  const createPlan = useCreatePlan(selectedBizId ?? "");

  // Local state for editing
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [allocations, setAllocations] = useState<Partial<Record<ChannelEnum, number>>>({}); // Percentages
  const [dirty, setDirty] = useState(false);

  // Sync from server state
  useEffect(() => {
    if (selectedBiz) setMonthlyBudget(selectedBiz.monthly_budget);
  }, [selectedBiz]);

  useEffect(() => {
    if (savedAllocations) {
      setAllocations(savedAllocations.percentages);
      setDirty(false);
    }
  }, [savedAllocations]);

  const setAlloc = useCallback((c: ChannelEnum, v: number) => {
    setAllocations((prev) => ({ ...prev, [c]: Math.max(0, v) }));
    setDirty(true);
  }, []);

  const totalPct = CHANNELS.reduce((s, c) => s + (allocations[c as ChannelEnum] ?? 0), 0);
  const remainingPct = 100 - totalPct;

  const handleSave = async () => {
    if (!selectedBizId || !selectedBiz) return;
    
    // Ensure we have a plan for the current month so activities can be added
    if (!currentMonthPlan) {
      try {
        await createPlan.mutateAsync({
          business_id: selectedBizId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          total_budget: monthlyBudget,
        });
      } catch (err) {
        toast.error("Failed to initialize plan for the current month.");
        return;
      }
    }

    try {
      await Promise.all([
        selectedBiz.monthly_budget !== monthlyBudget
          ? updateBusiness.mutateAsync({ monthly_budget: monthlyBudget })
          : Promise.resolve(),
        upsertAllocations.mutateAsync(allocations),
      ]);
      toast.success("Budget and allocations saved!");
      setDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save budget.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Budget Planner</h1>
          <p className="mt-1 text-muted-foreground">Set your monthly budget and percentage splits across channels.</p>
        </div>
        <BusinessSelector userId={userId} selectedBusinessId={selectedBizId} onSelect={setSelectedBizId} />
      </div>

      {!selectedBizId ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <p className="text-muted-foreground">Select or create a business to manage its budget.</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border/60 bg-card p-6 max-w-md">
            <Label htmlFor="total" className="text-sm">Monthly budget</Label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-2xl font-display font-bold text-muted-foreground">$</span>
              <Input
                id="total"
                type="number"
                min={0}
                value={monthlyBudget}
                onChange={(e) => { setMonthlyBudget(Number(e.target.value) || 0); setDirty(true); }}
                className="text-2xl font-display font-bold h-14"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This budget applies to all months for this business.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Channel allocation (%)</h2>
              <span className={`text-sm font-medium ${remainingPct < 0 ? "text-destructive" : remainingPct > 0 ? "text-accent" : "text-success"}`}>
                {remainingPct < 0 ? `Over by ${-remainingPct}%` : remainingPct > 0 ? `${remainingPct}% unallocated` : "Perfectly balanced"}
              </span>
            </div>
            
            <div className="space-y-6">
              {CHANNELS.map((c, i) => {
                const pct = allocations[c as ChannelEnum] ?? 0;
                const amt = (pct / 100) * monthlyBudget;
                return (
                  <div key={c}>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium">{c}</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground font-mono">{fmt(amt)}</span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={pct}
                            onChange={(e) => setAlloc(c as ChannelEnum, Number(e.target.value) || 0)}
                            className="w-20 h-9 text-right"
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[pct]}
                      max={100}
                      step={1}
                      onValueChange={(val) => setAlloc(c as ChannelEnum, val[0])}
                    />
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: `var(--chart-${(i % 5) + 1})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {dirty && (
            <div className="flex justify-end">
              <Button
                id="save-budget-btn"
                onClick={handleSave}
                disabled={upsertAllocations.isPending || updateBusiness.isPending}
                className="bg-gradient-primary text-primary-foreground"
              >
                {upsertAllocations.isPending ? "Saving…" : "Save budget"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
