import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      {/* Ambient glow */}
      <div className="animate-glow pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-red-900/15 to-transparent blur-[160px]" />

      {/* Top nav */}
      <nav className="animate-fade-up delay-1 relative z-10 flex items-center justify-between px-8 py-6 sm:px-12">
        <span className="font-display text-base font-bold tracking-[0.25em] uppercase">
          Edify
        </span>
        <Link
          href="/login"
          className="text-muted hover:text-foreground text-xs tracking-[0.15em] uppercase transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="overflow-hidden">
          <h1
            className="animate-letter-reveal font-display text-center font-extrabold uppercase leading-[0.85] tracking-[-0.04em]"
            style={{ fontSize: "clamp(4rem, 15vw, 14rem)" }}
          >
            Edify
          </h1>
        </div>

        <p className="animate-fade-up delay-3 text-muted mt-8 max-w-xs text-center text-sm leading-relaxed sm:text-base">
          Prototype the future in 48 hours.
        </p>

        <Link
          href="/login"
          className="animate-fade-up delay-4 bg-accent text-white hover:opacity-90 font-display mt-12 inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-[0.1em] uppercase transition-opacity"
        >
          Get Started
          <ArrowRightIcon width={14} height={14} />
        </Link>
      </div>

      {/* Bottom line */}
      <div className="animate-fade-up delay-5 relative z-10 px-8 py-6 sm:px-12">
        <div className="bg-border h-px w-full" />
        <p className="font-mono text-muted/40 mt-4 text-center text-[10px] tracking-[0.3em] uppercase">
          March 2026
        </p>
      </div>
    </div>
  );
}
