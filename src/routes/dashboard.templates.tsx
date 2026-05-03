import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TEMPLATES, fmt } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useAuthContext } from "@/lib/auth-context";
import { useBusinesses } from "@/hooks/useBusinesses";
import { BusinessSelector } from "@/components/data/BusinessSelector";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";

  const { data: businesses = [] } = useBusinesses(userId);
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) {
      setSelectedBizId(businesses[0].id);
    }
  }, [businesses, selectedBizId]);

  const [applying, setApplying] = useState<string | null>(null);

  const apply = async (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl || !selectedBizId) return;
    setApplying(id);

    try {
      const now = new Date();
      
      // 1. Calculate total budget from template allocations
      const totalBudget = Object.values(tpl.allocations).reduce((a, b) => a + (b ?? 0), 0);
      
      // 2. Create marketing plan for current month
      const { data: plan, error: planError } = await import("@/integrations/supabase/client")
        .then(m => m.supabase.from('marketing_plans').insert({
          business_id: selectedBizId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          total_budget: totalBudget,
        }).select().single());
      
      if (planError) throw planError;

      // 3. Upsert allocations (convert raw amounts to percentages based on totalBudget)
      const { error: allocError } = await import("@/services/budget.service").then((m) => {
        const percentages: Record<string, number> = {};
        Object.entries(tpl.allocations).forEach(([channel, amount]) => {
          percentages[channel] = totalBudget > 0 ? (amount! / totalBudget) * 100 : 0;
        });
        return m.upsertAllocations(selectedBizId, totalBudget, percentages as any).then(() => ({ error: null })).catch((e) => ({ error: e }));
      });
      if (allocError) throw allocError;

      // 4. Create template activities
      await Promise.all(
        tpl.activities.map((a, i) =>
          import("@/services/activity.service").then((m) =>
            m.createActivity({
              plan_id: plan.id,
              title: a.title,
              channel: a.channel as any,
              budget_used: a.budget,
              status: a.status as any,
              activity_date: new Date(now.getFullYear(), now.getMonth(), Math.min(28, (i + 1) * 5))
                .toISOString()
                .slice(0, 10),
            })
          )
        )
      );

      toast.success(`"${tpl.name}" template applied to current month!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply template.");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Strategy Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Apply a proven strategy to your current business. This creates a plan for this month.
          </p>
        </div>
        <BusinessSelector userId={userId} selectedBusinessId={selectedBizId} onSelect={setSelectedBizId} />
      </div>

      {!selectedBizId && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <p className="text-muted-foreground">Select or create a business first to apply templates.</p>
        </div>
      )}

      {selectedBizId && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((t) => {
            const total = Object.values(t.allocations).reduce((a, b) => a + (b ?? 0), 0);
            const isApplying = applying === t.id;
            return (
              <div
                key={t.id}
                className="group rounded-2xl border border-border/60 bg-card p-6 hover:shadow-elegant hover:-translate-y-1 transition-all flex flex-col"
              >
                <div className="text-4xl mb-4">{t.emoji}</div>
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed flex-1">{t.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suggested budget</span>
                  <span className="font-display font-bold">{fmt(total)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.keys(t.allocations).map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <Button
                  id={`apply-template-${t.id}`}
                  onClick={() => apply(t.id)}
                  disabled={isApplying || !userId}
                  className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isApplying ? "Applying…" : "Apply template"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
