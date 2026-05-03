import { fmt } from "@/lib/store";

export function Preview() {
  return (
    <section id="preview" className="py-24">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Preview</p>
          <h2 className="text-3xl md:text-5xl font-bold">A dashboard you'll actually open.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-elegant">
            <p className="text-sm text-muted-foreground">Monthly budget</p>
            <p className="text-4xl font-display font-bold mt-1">{fmt(2000)}</p>
            <div className="mt-6 space-y-3">
              {[
                ["Ads", 800, "var(--chart-1)"],
                ["Content", 600, "var(--chart-2)"],
                ["Tools", 200, "var(--chart-3)"],
                ["Events", 200, "var(--chart-4)"],
                ["SEO", 200, "var(--chart-5)"],
              ].map(([name, val, color]) => (
                <div key={String(name)}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{name}</span>
                    <span className="text-muted-foreground">{fmt(val as number)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${((val as number) / 2000) * 100}%`, background: color as string }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-elegant">
            <p className="text-sm text-muted-foreground">Upcoming this week</p>
            <ul className="mt-4 space-y-3">
              {[
                ["Mon", "Google Ads campaign", "Ads"],
                ["Wed", "Blog: Local SEO guide", "Content"],
                ["Fri", "Newsletter send", "Content"],
                ["Sat", "Community meetup", "Events"],
              ].map(([d, t, c]) => (
                <li key={t} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary flex flex-col items-center justify-center text-[10px] font-bold">
                    {d}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t}</p>
                    <p className="text-xs text-muted-foreground">{c}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
