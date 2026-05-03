import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import * as authService from "@/services/auth.service";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create account — Stratifyr" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const company = String(data.get("company") || "");

    setLoading(true);
    try {
      await authService.signUp({
        email,
        password,
        fullName: name,
        companyName: company || undefined,
      });
      toast.success(`Welcome to Stratifyr, ${name.split(" ")[0]}! Check your email to confirm your account.`);
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex relative overflow-hidden bg-gradient-primary p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <Logo className="relative text-primary-foreground" />
        <div className="relative">
          <h2 className="text-4xl font-display font-bold text-primary-foreground leading-tight">
            Your marketing,<br /> finally on a plan.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-sm">
            Join small businesses turning random activity into clear strategy.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Stratifyr
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8"><Logo /></div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Free forever for your first plan.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full name</Label>
              <Input id="signup-name" name="name" placeholder="Alex Doe" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-company">Company (optional)</Label>
              <Input id="signup-company" name="company" placeholder="Acme Inc." autoComplete="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" placeholder="yourname@gmail.com" required autoComplete="email" />
              <p className="text-xs text-muted-foreground">
                Use a personal email — addresses like "admin@…", "root@…", or "noreply@…" are blocked by the auth provider.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" name="password" type="password" placeholder="At least 6 characters" minLength={6} required autoComplete="new-password" />
            </div>
            {error && (
              <div id="signup-error" className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 space-y-1">
                <p className="text-sm text-destructive font-medium">Sign up failed</p>
                <p className="text-sm text-destructive/90">{error}</p>
              </div>
            )}
            <Button
              id="signup-submit"
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
