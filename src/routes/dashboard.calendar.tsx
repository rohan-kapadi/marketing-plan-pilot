import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { BusinessSelector } from "@/components/data/BusinessSelector";
import { ActivityForm, type ActivityFormValues } from "@/components/data/ActivityForm";
import { useAuthContext } from "@/lib/auth-context";
import { useBusinesses } from "@/hooks/useBusinesses";
import { usePlans, useCreatePlan } from "@/hooks/usePlans";
import {
  useActivities,
  useCreateActivity,
  useDeleteActivity,
  useToggleActivityStatus,
} from "@/hooks/useActivities";
import { fmt } from "@/lib/store";
import { planMonthLabel } from "@/services/budget.service";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const { user } = useAuthContext();
  const userId = user?.id ?? "";

  const { data: businesses = [] } = useBusinesses(userId);
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) {
      setSelectedBizId(businesses[0].id);
    }
  }, [businesses, selectedBizId]);

  const { data: plans = [] } = usePlans(selectedBizId ?? undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const month = selectedPlan ? new Date(selectedPlan.year, selectedPlan.month - 1, 1) : new Date();

  const [createOpen, setCreateOpen] = useState(false);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const { data: activitiesResult, isLoading } = useActivities(
    selectedPlanId ?? undefined,
    { dateFrom: `${monthKey}-01`, dateTo: `${monthKey}-31` },
    { column: "activity_date", ascending: true }
  );

  const createPlan = useCreatePlan(selectedBizId ?? "");
  const createMutation = useCreateActivity(selectedPlanId ?? "");
  const deleteMutation = useDeleteActivity(selectedPlanId ?? "");
  const toggleMutation = useToggleActivityStatus(selectedPlanId ?? "");

  const monthActivities = activitiesResult?.data ?? [];

  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = month.getDay();
  const cells = Array.from({ length: firstDay + days }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const handleCreateMonth = async () => {
    if (!selectedBizId) return;
    const now = new Date();
    try {
      const p = await createPlan.mutateAsync({
        business_id: selectedBizId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setSelectedPlanId(p.id);
      toast.success("Created plan for this month!");
    } catch (err) {
      toast.error("Failed to create month plan.");
    }
  };

  const handleCreate = async (values: ActivityFormValues) => {
    if (!selectedPlanId) return;
    try {
      await createMutation.mutateAsync({
        ...values,
        plan_id: selectedPlanId,
      });
      toast.success("Activity added!");
      setCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add activity.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Activity removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete activity.");
    }
  };

  const handleToggle = async (id: string, status: "Planned" | "Completed") => {
    try {
      await toggleMutation.mutateAsync({ id, status });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Marketing Calendar</h1>
          <p className="mt-1 text-muted-foreground">Schedule and track every activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BusinessSelector userId={userId} selectedBusinessId={selectedBizId} onSelect={(id) => { setSelectedBizId(id); setSelectedPlanId(null); }} />
          {plans.length > 0 ? (
            <Select value={selectedPlanId ?? ""} onValueChange={setSelectedPlanId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{planMonthLabel(p)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button variant="outline" size="sm" onClick={handleCreateMonth} disabled={!selectedBizId || createPlan.isPending}>
              Create Plan for {new Date().toLocaleString("en", { month: "long" })}
            </Button>
          )}
          <Button
            id="cal-add-activity"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 ml-2"
            onClick={() => setCreateOpen(true)}
            disabled={!selectedPlanId}
          >
            <Plus className="h-4 w-4 mr-1" /> Add activity
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-border/60 bg-card p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs font-semibold text-muted-foreground p-2 text-center">{d}</div>
          ))}
          {!selectedPlanId ? (
             <div className="col-span-7 p-10 text-center text-muted-foreground border-t border-border/40 mt-2">
               Select or create a month plan to view the calendar.
             </div>
          ) : isLoading ? (
            Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square min-h-[80px] rounded-lg border border-border/40 bg-muted/20 animate-pulse" />
            ))
          ) : cells.map((day, i) => {
                if (!day) return <div key={i} className="aspect-square rounded-lg bg-transparent" />;
                const ds = `${monthKey}-${String(day).padStart(2, "0")}`;
                const dayActs = monthActivities.filter((a) => a.activity_date === ds);
                return (
                  <div
                    key={i}
                    className="aspect-square min-h-[80px] rounded-lg border border-border/60 p-1.5 flex flex-col gap-1 hover:bg-secondary/40 transition-colors"
                  >
                    <span className="text-xs font-medium text-muted-foreground">{day}</span>
                    {dayActs.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${
                          a.status === "Completed"
                            ? "bg-success/20 text-success-foreground line-through"
                            : "bg-primary/20 text-foreground"
                        }`}
                        title={a.title}
                      >
                        {a.title}
                      </div>
                    ))}
                    {dayActs.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{dayActs.length - 2}</div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>

      {/* Activity list */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All activities ({monthActivities.length})</h2>
        <div className="space-y-2">
          {monthActivities.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">No activities planned for this month.</p>
          )}
          {monthActivities.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4">
              <button
                onClick={() => handleToggle(a.id, a.status)}
                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  a.status === "Completed"
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/40 hover:border-primary"
                }`}
                aria-label="Toggle status"
              >
                {a.status === "Completed" && (
                  <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${a.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.activity_date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <Badge variant="secondary">{a.channel}</Badge>
              <span className="text-sm font-medium tabular-nums">{fmt(a.budget_used)}</span>
              <Button
                id={`cal-delete-${a.id}`}
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(a.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            defaultValues={{ activity_date: `${monthKey}-01` }}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Add to calendar"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
