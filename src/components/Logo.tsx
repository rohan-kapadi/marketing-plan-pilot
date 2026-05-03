import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-primary shadow-glow">
        <div className="absolute inset-1.5 rounded-md bg-background/90 dark:bg-background/70 flex items-center justify-center">
          <div className="h-2 w-2 rounded-sm bg-gradient-primary" />
        </div>
      </div>
      <span className="font-display text-xl font-bold tracking-tight">Stratifyr</span>
    </Link>
  );
}
