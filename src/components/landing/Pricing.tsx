import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Plan a single month with the basics.",
    features: ["1 business", "Budget planner", "Basic calendar", "1 template"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$19",
    desc: "Everything you need to run marketing seriously.",
    features: ["Unlimited months", "All templates", "Channel analytics", "Recurring activities", "Priority support"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Premium",
    price: "$49",
    desc: "For agencies and teams managing multiple brands.",
    features: ["Multiple businesses", "Team collaboration", "Custom templates", "Export & reports", "Dedicated success manager"],
    cta: "Talk to us",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-secondary/30 border-y border-border/60">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold">Start free. Grow when you're ready.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                t.featured
                  ? "border-primary/50 bg-card shadow-elegant scale-[1.02]"
                  : "border-border/60 bg-card"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-8 ${
                  t.featured
                    ? "bg-gradient-primary text-primary-foreground hover:opacity-90"
                    : ""
                }`}
                variant={t.featured ? "default" : "outline"}
              >
                <Link to="/signup">{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
