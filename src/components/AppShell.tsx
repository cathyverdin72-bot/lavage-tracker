import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-10 text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto grid max-w-lg grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Lavage International
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Car Progress Tracker
            </p>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </header>

      <nav className="mx-auto flex max-w-lg gap-2 px-6 py-4">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-muted-foreground transition-colors data-[status=active]:border-transparent data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-[var(--shadow-cta)]"
        >
          Track Vehicle
        </Link>
        <Link
          to="/staff"
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-muted-foreground transition-colors data-[status=active]:border-transparent data-[status=active]:bg-primary data-[status=active]:text-primary-foreground data-[status=active]:shadow-[var(--shadow-cta)]"
        >
          Staff Portal
        </Link>
      </nav>

      <main className="mx-auto max-w-lg space-y-8 px-6">{children}</main>
    </div>
  );
}
