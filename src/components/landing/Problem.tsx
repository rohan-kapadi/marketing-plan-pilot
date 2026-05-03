import { AlertCircle, Shuffle, TrendingDown } from "lucide-react";

const pains = [
  { icon: Shuffle, title: "Random activities", text: "Posting, boosting, pausing — with no system or strategy behind it." },
  { icon: TrendingDown, title: "Wasted budget", text: "Money disappears into channels with no clear return or accountability." },
  { icon: AlertCircle, title: "Inconsistent results", text: "Some months crush it. Others go silent. There's no rhythm." },
];

export function Problem() {
  return (
    <section className="py-24 border-t border-border/60">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">The Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Marketing without a plan is just expensive guessing.
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {pains.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
