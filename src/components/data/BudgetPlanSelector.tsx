import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Pencil, Trash2, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from "@/hooks/usePlans";
import type { BudgetPlan } from "@/services/budget.service";

interface BudgetPlanSelectorProps {
  userId: string;
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
}

export function BudgetPlanSelector({
  userId,
  selectedPlanId,
  onSelect,
}: BudgetPlanSelectorProps) {
  const { data: plans = [], isLoading } = usePlans(userId);
  const createMutation = useCreatePlan(userId);
  const deleteMutation = useDeletePlan(userId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<BudgetPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<BudgetPlan | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBudget, setNewBudget] = useState<number>(2000);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const updateMutation = useUpdatePlan(userId, editPlan?.id ?? "");

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const plan = await createMutation.mutateAsync({
        user_id: userId,
        title: newTitle.trim(),
        total_budget: newBudget,
      });
      onSelect(plan.id);
      toast.success("Plan created!");
      setCreateOpen(false);
      setNewTitle("");
      setNewBudget(2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create plan.");
    }
  };

  const handleUpdate = async () => {
    if (!editPlan || !newTitle.trim()) return;
    try {
      await updateMutation.mutateAsync({
        title: newTitle.trim(),
        total_budget: newBudget,
      });
      toast.success("Plan updated!");
      setEditPlan(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update plan.");
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;
    try {
      await deleteMutation.mutateAsync(deletePlan.id);
      toast.success("Plan deleted.");
      setDeletePlan(null);
      // Select another plan if we deleted the selected one
      if (deletePlan.id === selectedPlanId) {
        const remaining = plans.filter((p) => p.id !== deletePlan.id);
        if (remaining.length > 0) onSelect(remaining[0].id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete plan.");
    }
  };

  const openEdit = (plan: BudgetPlan) => {
    setEditPlan(plan);
    setNewTitle(plan.title);
    setNewBudget(plan.total_budget);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              id="plan-selector-btn"
              variant="outline"
              className="gap-2 max-w-xs"
              disabled={isLoading}
            >
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate">
                {isLoading
                  ? "Loading…"
                  : selectedPlan?.title ?? "Select a plan"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {plans.length === 0 ? (
              <DropdownMenuItem disabled>No plans yet</DropdownMenuItem>
            ) : (
              plans.map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  id={`select-plan-${plan.id}`}
                  className="flex items-center justify-between gap-2 pr-1"
                  onSelect={() => onSelect(plan.id)}
                >
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    {plan.id === selectedPlanId && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="truncate">{plan.title}</span>
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(plan); }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title="Edit plan"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletePlan(plan); }}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="new-plan-btn"
              onSelect={() => { setNewTitle(""); setNewBudget(2000); setCreateOpen(true); }}
              className="text-primary font-medium"
            >
              <Plus className="h-4 w-4 mr-2" /> New plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create new plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan-title">Plan name</Label>
              <Input
                id="plan-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. May Marketing Plan"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-budget">Monthly budget ($)</Label>
              <Input
                id="plan-budget"
                type="number"
                min={0}
                step={100}
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              id="create-plan-submit"
              onClick={handleCreate}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="bg-gradient-primary text-primary-foreground"
            >
              {createMutation.isPending ? "Creating…" : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlan} onOpenChange={(o) => !o && setEditPlan(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-plan-title">Plan name</Label>
              <Input
                id="edit-plan-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-plan-budget">Monthly budget ($)</Label>
              <Input
                id="edit-plan-budget"
                type="number"
                min={0}
                step={100}
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button
              id="edit-plan-submit"
              onClick={handleUpdate}
              disabled={!newTitle.trim() || updateMutation.isPending}
              className="bg-gradient-primary text-primary-foreground"
            >
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deletePlan}
        onOpenChange={(o) => !o && setDeletePlan(null)}
        title={`Delete "${deletePlan?.title}"?`}
        description="This will permanently delete the plan and all its activities and allocations."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
