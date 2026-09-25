import Link from "next/link";
import type { ReactNode } from "react";
import { COMPANY } from "@/data/employees";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
        Skip to main content
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-md bg-ink text-xs font-bold text-white">
                W
              </span>
              WholePicture
            </Link>
            <span className="hidden text-sm text-ink-faint sm:inline" aria-hidden="true">
              /
            </span>
            <span className="hidden text-sm text-ink-muted sm:inline">{COMPANY.name}</span>
          </div>
          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            <Link href="/" className="rounded-md px-3 py-1.5 text-ink-muted hover:bg-canvas hover:text-ink">
              Appraisal cycle
            </Link>
            <Link href="/employees/emp-sarah-lim" className="rounded-md px-3 py-1.5 text-ink-muted hover:bg-canvas hover:text-ink">
              Demo case
            </Link>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-line bg-surface">
        <p className="mx-auto max-w-7xl px-6 py-3 text-xs text-ink-faint">
          Prototype. Uses simulated workplace data only — no real employee accounts, messages or systems are connected. AI output is an
          assessment aid and is not an employment decision.
        </p>
      </footer>
    </>
  );
}
