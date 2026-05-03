import { CalendarDays, PieChart, Sparkles } from "lucide-react";

const features = [
  {
    icon: PieChart,
    title: "Budget Planner",
    text: "Set your monthly budget and split it across Ads, Content, and Tools with live percentages.",
  },
  {
    icon: CalendarDays,
    title: "Marketing Calendar",
    text: "Schedule every activity with assigned budget and track Planned vs Completed in one view.",
  },
  {
    icon: Sparkles,
    title: "Strategy Templates",
    text: "Pick a proven plan — Local Growth, Social Media, Product Launch — and auto-fill everything.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30 border-y border-border/60">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold">Three tools. One clear plan.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-8 hover:shadow-elegant hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
