import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="py-20 border-t border-border/60">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-gradient-primary p-10 md:p-16 text-center shadow-glow">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
            Plan your next month in 5 minutes.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Join the small businesses replacing chaos with a clear marketing system.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-8 h-12 px-6 text-base font-semibold"
          >
            <Link to="/signup">
              Get started free <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Logo />
          <p>© {new Date().getFullYear()} Stratifyr. Plan smarter.</p>
        </div>
      </div>
    </footer>
  );
}
