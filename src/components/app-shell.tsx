import Link from "next/link";
import type { ReactNode } from "react";
import { COMPANY, employees } from "@/data/employees";
import { EmployeeSearch, PillNav, ViewerPill } from "./header-controls";

const CONTAINER = "mx-auto w-full max-w-[1480px] px-8";

export function AppShell({ children }: { children: ReactNode }) {
  const index = employees.map(({ id, name, title, department }) => ({ id, name, title, department }));

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className={`${CONTAINER} grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6`}>
          <Link href="/" className="pressable flex w-fit items-center gap-2.5 font-semibold tracking-tight">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm font-bold text-white">
              W
            </span>
            <span>
              WholePicture
              <span className="ml-2 hidden text-sm font-normal text-ink-faint lg:inline">{COMPANY.name}</span>
            </span>
          </Link>
          <PillNav />
          <div className="flex items-center justify-end gap-3">
            <EmployeeSearch index={index} />
            <ViewerPill />
          </div>
        </div>
      </header>
      <main id="main" className={`${CONTAINER} flex-1 py-8`}>
        <div className="animate-rise">{children}</div>
      </main>
      <footer className="border-t border-line bg-surface">
        <p className={`${CONTAINER} py-4 text-xs text-ink-faint`}>
          Prototype. Uses simulated workplace data only — no real employee accounts, messages or systems are connected. AI output is an
          assessment aid and is not an employment decision.
        </p>
      </footer>
    </>
  );
}
