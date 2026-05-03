import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState, fmt, CHANNELS, type Channel, type Activity } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/calendar")({
  component: CalendarPage,
});

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function CalendarPage() {
  const { state, setState } = useAppState();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Activity, "id">>({
    title: "",
    channel: "Ads",
    date: new Date().toISOString().slice(0, 10),
    budget: 0,
    status: "Planned",
  });

  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = month.getDay();
  const cells = Array.from({ length: firstDay + days }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const monthActivities = state.activities.filter((a) => a.date.startsWith(monthKey));

  const addActivity = () => {
    if (!draft.title.trim()) return;
    setState((s) => ({
      ...s,
      activities: [...s.activities, { ...draft, id: crypto.randomUUID() }],
    }));
    setOpen(false);
    setDraft({ ...draft, title: "", budget: 0 });
  };

  const removeActivity = (id: string) =>
    setState((s) => ({ ...s, activities: s.activities.filter((a) => a.id !== id) }));

  const toggleStatus = (id: string) =>
    setState((s) => ({
      ...s,
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, status: a.status === "Planned" ? "Completed" : "Planned" } : a
      ),
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Marketing Calendar</h1>
          <p className="mt-1 text-muted-foreground">Schedule and track every activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            ←
          </Button>
          <span className="font-display font-semibold w-36 text-center">
            {month.toLocaleString("en", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            →
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 ml-2">
                <Plus className="h-4 w-4 mr-1" /> Add activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New activity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder="Instagram boost campaign"
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Channel</Label>
                    <Select
                      value={draft.channel}
                      onValueChange={(v) => setDraft({ ...draft, channel: v as Channel })}
                    >
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CHANNELS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.budget}
                    onChange={(e) => setDraft({ ...draft, budget: Number(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>
                <Button onClick={addActivity} className="w-full bg-gradient-primary text-primary-foreground">
                  Add to calendar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-xs font-semibold text-muted-foreground p-2 text-center">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square rounded-lg bg-transparent" />;
            const ds = `${monthKey}-${String(day).padStart(2, "0")}`;
            const dayActs = monthActivities.filter((a) => a.date === ds);
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

      <div>
        <h2 className="text-lg font-semibold mb-4">All activities ({monthActivities.length})</h2>
        <div className="space-y-2">
          {monthActivities.length === 0 && (
            <p className="text-sm text-muted-foreground">No activities planned for this month.</p>
          )}
          {monthActivities.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4"
            >
              <button
                onClick={() => toggleStatus(a.id)}
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
                  {new Date(a.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <Badge variant="secondary">{a.channel}</Badge>
              <span className="text-sm font-medium tabular-nums">{fmt(a.budget)}</span>
              <Button variant="ghost" size="icon" onClick={() => removeActivity(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
