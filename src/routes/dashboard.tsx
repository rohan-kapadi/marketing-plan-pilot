import { createFileRoute, Link, Outlet, useRouterState, redirect } from "@tanstack/react-router";
import { LayoutDashboard, PieChart, CalendarDays, Sparkles, LogOut, Database } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({ meta: [{ title: "Dashboard — Stratifyr" }] }),
  beforeLoad: async ({ context }) => {
    // If auth context is available via router context, guard here
    // Otherwise guarding is done in the component
    void context;
  },
});

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/budget", label: "Budget", icon: PieChart, exact: false },
  { to: "/dashboard/calendar", label: "Calendar", icon: CalendarDays, exact: false },
  { to: "/dashboard/templates", label: "Templates", icon: Sparkles, exact: false },
  { to: "/dashboard/data", label: "Data Explorer", icon: Database, exact: false },
] as const;

function DashboardLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading, signOut } = useAuthContext();
  const navigate = useRouterState({ select: (s) => s.location });

  // Auth guard: redirect to login if not authenticated
  if (!loading && !user) {
    // Use window.location for SSR safety
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  void navigate;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar p-4">
        <div className="px-2 py-2">
          <Logo />
        </div>
        <nav className="mt-6 flex-1 space-y-1">
          {items.map((it) => {
            const active = it.exact ? path === it.to : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 pt-4 border-t border-border/60">
          {user && (
            <p className="px-3 text-xs text-muted-foreground truncate" title={user.email}>
              {user.email}
            </p>
          )}
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <Button
              id="signout-btn"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between border-b border-border/60 px-4 h-14">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-6 md:p-10 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
