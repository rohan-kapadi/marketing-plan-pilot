import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Pencil, Trash2, Check, Building2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from "@/hooks/useBusinesses";
import type { Business } from "@/services/business.service";

interface BusinessSelectorProps {
  userId: string;
  selectedBusinessId: string | null;
  onSelect: (businessId: string) => void;
}

export function BusinessSelector({ userId, selectedBusinessId, onSelect }: BusinessSelectorProps) {
  const { data: businesses = [], isLoading } = useBusinesses(userId);
  const createMutation = useCreateBusiness(userId);
  const deleteMutation = useDeleteBusiness(userId);

  const [createOpen, setCreateOpen] = useState(false);
  const [editBusiness, setEditBusiness] = useState<Business | null>(null);
  const [deleteBusiness, setDeleteBusiness] = useState<Business | null>(null);

  const [form, setForm] = useState({ business_name: "", industry_type: "", monthly_budget: 2000, goal: "" });

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const updateMutation = useUpdateBusiness(userId, editBusiness?.id ?? "");

  const handleCreate = async () => {
    if (!form.business_name.trim()) return;
    try {
      const biz = await createMutation.mutateAsync({
        user_id: userId,
        business_name: form.business_name.trim(),
        industry_type: form.industry_type,
        monthly_budget: form.monthly_budget,
        goal: form.goal,
      });
      onSelect(biz.id);
      toast.success("Business created!");
      setCreateOpen(false);
      setForm({ business_name: "", industry_type: "", monthly_budget: 2000, goal: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create business.");
    }
  };

  const handleUpdate = async () => {
    if (!editBusiness || !form.business_name.trim()) return;
    try {
      await updateMutation.mutateAsync({
        business_name: form.business_name.trim(),
        industry_type: form.industry_type,
        monthly_budget: form.monthly_budget,
        goal: form.goal,
      });
      toast.success("Business updated!");
      setEditBusiness(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update business.");
    }
  };

  const handleDelete = async () => {
    if (!deleteBusiness) return;
    try {
      await deleteMutation.mutateAsync(deleteBusiness.id);
      toast.success("Business deleted.");
      setDeleteBusiness(null);
      if (deleteBusiness.id === selectedBusinessId) {
        const remaining = businesses.filter((b) => b.id !== deleteBusiness.id);
        if (remaining.length > 0) onSelect(remaining[0].id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete business.");
    }
  };

  const openEdit = (b: Business) => {
    setEditBusiness(b);
    setForm({ business_name: b.business_name, industry_type: b.industry_type, monthly_budget: b.monthly_budget, goal: b.goal });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button id="business-selector-btn" variant="outline" className="gap-2 max-w-xs" disabled={isLoading}>
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{isLoading ? "Loading…" : selectedBusiness?.business_name ?? "Select business"}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {businesses.length === 0 ? (
            <DropdownMenuItem disabled>No businesses yet</DropdownMenuItem>
          ) : businesses.map((b) => (
            <DropdownMenuItem key={b.id} id={`select-biz-${b.id}`} className="flex items-center justify-between gap-2 pr-1" onSelect={() => onSelect(b.id)}>
              <span className="flex items-center gap-2 flex-1 min-w-0">
                {b.id === selectedBusinessId && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                <span className="truncate">{b.business_name}</span>
              </span>
              <span className="flex items-center gap-0.5 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); openEdit(b); }} className="p-1 rounded hover:bg-muted transition-colors" title="Edit">
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteBusiness(b); }} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem id="new-business-btn" onSelect={() => { setForm({ business_name: "", industry_type: "", monthly_budget: 2000, goal: "" }); setCreateOpen(true); }} className="text-primary font-medium">
            <Plus className="h-4 w-4 mr-2" /> New business
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create/Edit Dialog */}
      {[{ open: createOpen, onClose: () => setCreateOpen(false), onSave: handleCreate, title: "Create business", isPending: createMutation.isPending },
        { open: !!editBusiness, onClose: () => setEditBusiness(null), onSave: handleUpdate, title: "Edit business", isPending: updateMutation.isPending }
      ].map(({ open, onClose, onSave, title, isPending }) => (
        <Dialog key={title} open={open} onOpenChange={(o) => !o && onClose()}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Business name *</Label>
                <Input id="biz-name" value={form.business_name} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} placeholder="Acme Marketing" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-industry">Industry</Label>
                <Input id="biz-industry" value={form.industry_type} onChange={(e) => setForm((f) => ({ ...f, industry_type: e.target.value }))} placeholder="e.g. E-commerce, SaaS" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-budget">Monthly budget ($)</Label>
                <Input id="biz-budget" type="number" min={0} value={form.monthly_budget} onChange={(e) => setForm((f) => ({ ...f, monthly_budget: Number(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="biz-goal">Goal</Label>
                <Textarea id="biz-goal" value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))} placeholder="Grow brand awareness by 30%..." rows={2} className="resize-none" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={onSave} disabled={!form.business_name.trim() || isPending} className="bg-gradient-primary text-primary-foreground">
                {isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      <DeleteConfirmDialog
        open={!!deleteBusiness}
        onOpenChange={(o) => !o && setDeleteBusiness(null)}
        title={`Delete "${deleteBusiness?.business_name}"?`}
        description="This will permanently delete the business and all its plans, allocations, and activities."
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
