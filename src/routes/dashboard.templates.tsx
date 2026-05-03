import { createFileRoute } from "@tanstack/react-router";
import { TEMPLATES, useAppState, fmt } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { setState } = useAppState();

  const apply = (id: string) => {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const today = new Date();
    setState((s) => ({
      ...s,
      allocations: tpl.allocations,
      totalBudget: Object.values(tpl.allocations).reduce((a, b) => a + (b ?? 0), 0),
      activities: [
        ...s.activities,
        ...tpl.activities.map((a, i) => ({
          ...a,
          id: crypto.randomUUID(),
          date: new Date(today.getFullYear(), today.getMonth(), Math.min(28, (i + 1) * 5))
            .toISOString()
            .slice(0, 10),
        })),
      ],
    }));
    toast.success(`Applied "${tpl.name}" template`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Strategy Templates</h1>
        <p className="mt-1 text-muted-foreground">
          Start with a proven plan and customize from there.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => {
          const total = Object.values(t.allocations).reduce((a, b) => a + (b ?? 0), 0);
          return (
            <div
              key={t.id}
              className="group rounded-2xl border border-border/60 bg-card p-6 hover:shadow-elegant hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className="text-4xl mb-4">{t.emoji}</div>
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed flex-1">
                {t.description}
              </p>
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
                onClick={() => apply(t.id)}
                className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 mr-1" /> Apply template
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
