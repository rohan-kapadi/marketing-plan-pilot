import { Link } from "@tanstack/react-router";
import logo from "@/assets/stratifyr-logo.jpg";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`} aria-label="Stratifyr">
      <img
        src={logo}
        alt="Stratifyr"
        className="h-9 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert"
      />
    </Link>
  );
}
