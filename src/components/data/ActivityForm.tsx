import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHANNELS } from "@/lib/store";
import type { Activity } from "@/services/activity.service";

const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  channel: z.enum(["Ads", "Content", "Tools", "Events", "SEO"]),
  activity_date: z.string().min(1, "Date is required"),
  budget_used: z.coerce.number().min(0, "Budget cannot be negative"),
  status: z.enum(["Planned", "Completed"]),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  defaultValues?: Partial<ActivityFormValues>;
  onSubmit: (data: ActivityFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isEditing?: boolean;
}

export function ActivityForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save activity", isEditing = false }: ActivityFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      channel: "Ads",
      activity_date: new Date().toISOString().slice(0, 10),
      budget_used: 0,
      status: "Planned",
      ...defaultValues,
    },
  });

  const channel = watch("channel");
  const status = watch("status");

  return (
    <form id={isEditing ? "edit-activity-form" : "create-activity-form"} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="act-title">Activity title</Label>
        <Input id="act-title" {...register("title")} placeholder="e.g. Google Ads campaign" aria-invalid={!!errors.title} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Channel + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="act-channel">Channel</Label>
          <Select value={channel} onValueChange={(v) => setValue("channel", v as ActivityFormValues["channel"])}>
            <SelectTrigger id="act-channel"><SelectValue placeholder="Select channel" /></SelectTrigger>
            <SelectContent>
              {CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-status">Status</Label>
          <Select value={status} onValueChange={(v) => setValue("status", v as ActivityFormValues["status"])}>
            <SelectTrigger id="act-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date + Budget Used */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="act-date">Date</Label>
          <Input id="act-date" type="date" {...register("activity_date")} aria-invalid={!!errors.activity_date} />
          {errors.activity_date && <p className="text-xs text-destructive">{errors.activity_date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-budget">Budget used ($)</Label>
          <Input id="act-budget" type="number" min={0} step={10} {...register("budget_used")} aria-invalid={!!errors.budget_used} />
          {errors.budget_used && <p className="text-xs text-destructive">{errors.budget_used.message}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button id="act-cancel-btn" type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button id="act-submit-btn" type="submit" disabled={isSubmitting} className="bg-gradient-primary text-primary-foreground">
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function activityToFormValues(a: Activity): ActivityFormValues {
  return {
    title: a.title,
    channel: a.channel,
    activity_date: a.activity_date,
    budget_used: a.budget_used,
    status: a.status,
  };
}
