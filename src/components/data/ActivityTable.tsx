import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown, ChevronLeft, ChevronRight, Edit2, Plus, Search, Trash2, CheckCircle2, Clock, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ActivityForm, activityToFormValues, type ActivityFormValues } from "./ActivityForm";
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity, useToggleActivityStatus } from "@/hooks/useActivities";
import type { Activity, ActivityFilters } from "@/services/activity.service";
import type { ChannelEnum } from "@/integrations/supabase/types";
import { fmt, CHANNELS } from "@/lib/store";

const PAGE_SIZE = 10;

const CHANNEL_COLORS: Record<ChannelEnum, string> = {
  Ads: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Content: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  Tools: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  Events: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  SEO: "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

interface ActivityTableProps {
  planId: string;
}

export function ActivityTable({ planId }: ActivityTableProps) {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [sortAsc, setSortAsc] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [deleteActivity, setDeleteActivity] = useState<Activity | null>(null);

  const { data, isLoading, isFetching } = useActivities(planId, filters, { column: "activity_date", ascending: sortAsc }, page, PAGE_SIZE);
  const createMutation = useCreateActivity(planId);
  const updateMutation = useUpdateActivity(planId);
  const deleteMutation = useDeleteActivity(planId);
  const toggleMutation = useToggleActivityStatus(planId);

  const activities = data?.data ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleCreate = async (values: ActivityFormValues) => {
    try {
      await createMutation.mutateAsync({ ...values, plan_id: planId });
      toast.success("Activity created!");
      setCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create activity.");
    }
  };

  const handleUpdate = async (values: ActivityFormValues) => {
    if (!editActivity) return;
    try {
      await updateMutation.mutateAsync({ id: editActivity.id, data: values });
      toast.success("Activity updated!");
      setEditActivity(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update activity.");
    }
  };

  const handleDelete = async () => {
    if (!deleteActivity) return;
    try {
      await deleteMutation.mutateAsync(deleteActivity.id);
      toast.success("Activity deleted.");
      setDeleteActivity(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete activity.");
    }
  };

  const handleToggle = async (a: Activity) => {
    try { await toggleMutation.mutateAsync({ id: a.id, status: a.status }); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update status."); }
  };

  const updateFilter = (key: keyof ActivityFilters, value: string | undefined) => {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value || undefined }));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input id="activity-search" placeholder="Search activities…" className="pl-8 h-9 w-52" value={filters.search ?? ""} onChange={(e) => updateFilter("search", e.target.value)} />
          </div>
          <Select value={filters.channel ?? ""} onValueChange={(v) => updateFilter("channel", v === "all" ? "" : v)}>
            <SelectTrigger id="filter-channel" className="h-9 w-36">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" /><SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.status ?? ""} onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}>
            <SelectTrigger id="filter-status" className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button id="sort-date-btn" variant="outline" size="sm" className="h-9" onClick={() => setSortAsc((v) => !v)}>
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />Date {sortAsc ? "↑" : "↓"}
          </Button>
        </div>
        <Button id="create-activity-btn" size="sm" onClick={() => setCreateOpen(true)} className="bg-gradient-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-1" /> Add activity
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading activities…</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {Object.values(filters).some(Boolean) ? "No activities match your filters." : "No activities yet. Add your first one!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  {["Activity", "Channel", "Date", "Budget Used", "Status", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 font-medium text-muted-foreground ${h === "Budget Used" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activities.map((a) => (
                  <tr key={a.id} className={`group transition-colors hover:bg-muted/30 ${isFetching ? "opacity-70" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[200px]" title={a.title}>{a.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs font-medium ${CHANNEL_COLORS[a.channel]}`}>{a.channel}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(a.activity_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">{fmt(a.budget_used)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(a)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:scale-105 ${
                          a.status === "Completed" ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-border/60 hover:border-primary/40"
                        }`}
                      >
                        {a.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {a.status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <Button id={`edit-${a.id}`} variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditActivity(a)} title="Edit"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button id={`delete-${a.id}`} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteActivity(a)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="border-t border-border/60 px-4 py-3 flex items-center justify-between bg-muted/20">
            <p className="text-xs text-muted-foreground">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}</p>
            <div className="flex items-center gap-1">
              <Button id="prev-page-btn" variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs font-medium px-2">{page + 1} / {totalPages}</span>
              <Button id="next-page-btn" variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add new activity</DialogTitle></DialogHeader>
          <ActivityForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Create activity" />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editActivity} onOpenChange={(o) => !o && setEditActivity(null)}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit activity</DialogTitle></DialogHeader>
          {editActivity && <ActivityForm defaultValues={activityToFormValues(editActivity)} onSubmit={handleUpdate} onCancel={() => setEditActivity(null)} submitLabel="Save changes" isEditing />}
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog open={!!deleteActivity} onOpenChange={(o) => !o && setDeleteActivity(null)}
        title={`Delete "${deleteActivity?.title}"?`} description="This activity will be permanently removed."
        onConfirm={handleDelete} loading={deleteMutation.isPending} />
    </div>
  );
}
