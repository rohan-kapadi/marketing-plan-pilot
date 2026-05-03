import { createFileRoute } from "@tanstack/react-router";
import { useAppState, fmt, CHANNELS, type Channel } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/dashboard/budget")({
  component: BudgetPage,
});

function BudgetPage() {
  const { state, setState } = useAppState();
  const used = CHANNELS.reduce((s, c) => s + (state.allocations[c] ?? 0), 0);
  const remaining = state.totalBudget - used;

  const setAlloc = (c: Channel, v: number) =>
    setState((s) => ({ ...s, allocations: { ...s.allocations, [c]: Math.max(0, v) } }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Budget Planner</h1>
        <p className="mt-1 text-muted-foreground">
          Set your monthly budget and split it across channels.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 max-w-md">
        <Label htmlFor="total" className="text-sm">Monthly budget</Label>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-display font-bold text-muted-foreground">$</span>
          <Input
            id="total"
            type="number"
            min={0}
            value={state.totalBudget}
            onChange={(e) => setState((s) => ({ ...s, totalBudget: Number(e.target.value) || 0 }))}
            className="text-2xl font-display font-bold h-14"
          />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Allocated {fmt(used)}</span>
          <span className={remaining < 0 ? "text-destructive font-medium" : "text-success font-medium"}>
            {remaining < 0 ? `Over by ${fmt(-remaining)}` : `${fmt(remaining)} left`}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="text-lg font-semibold mb-6">Channel allocation</h2>
        <div className="space-y-6">
          {CHANNELS.map((c, i) => {
            const v = state.allocations[c] ?? 0;
            const pct = state.totalBudget ? (v / state.totalBudget) * 100 : 0;
            return (
              <div key={c}>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">{c}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={v}
                      onChange={(e) => setAlloc(c, Number(e.target.value) || 0)}
                      className="w-28 h-9 text-right"
                    />
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <Slider
                  value={[v]}
                  max={Math.max(state.totalBudget, v, 100)}
                  step={10}
                  onValueChange={(val) => setAlloc(c, val[0])}
                />
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: `${pct}%`, background: `var(--chart-${(i % 5) + 1})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
