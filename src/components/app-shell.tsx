"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CaretDown, SignOut } from "@phosphor-icons/react";
import { COMPANY } from "@/data/employees";
import { signOut, useSession } from "@/lib/session";
import { applyTheme } from "@/lib/theme";
import { Login } from "./login";
import { Landing } from "./landing/landing";
import { SkynetMark } from "./brand";
import { Avatar } from "./ui";
import { GlobalAnnouncer, HeaderControls } from "./announcer";

const CONTAINER = "mx-auto w-full max-w-[1480px] px-8";

export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const path = usePathname();
  const router = useRouter();

  const onLogin = path === "/login";

  // Route scoping. Signed out: the landing page at "/", the sign-in at "/login", everything else goes to sign-in.
  // Signed in: an employee only ever sees their own profile; an employer never sees the self-appraisal form.
  useEffect(() => {
    if (session.status === "loading") return;
    if (session.status === "out") {
      applyTheme("light"); // night mode is a signed-in preference; the door is always lit
      if (path !== "/" && !onLogin) router.replace("/login");
      return;
    }
    const a = session.account;
    if (onLogin) {
      router.replace(a.role === "employer" ? "/" : `/employees/${a.employeeId}`);
      return;
    }
    if (a.role === "employee") {
      const own = `/employees/${a.employeeId}`;
      if (path === "/" || (path.startsWith("/employees/") && !path.startsWith(own))) router.replace(own);
    } else if (path.startsWith("/self-appraisal")) router.replace("/");
    else if (path.endsWith("/report")) router.replace(path.replace(/\/report$/, ""));
  }, [session, path, onLogin, router]);

  if (session.status === "loading") return <div className="min-h-[100dvh]" aria-busy="true" />;
  if (session.status === "out") return onLogin ? <Login /> : path === "/" ? <Landing /> : <div className="min-h-[100dvh]" aria-busy="true" />;
  if (onLogin) return <div className="min-h-[100dvh]" aria-busy="true" />;

  const a = session.account;
  const employer = a.role === "employer";
  const nav = employer
    ? [
        { href: "/", label: "Employees", active: path === "/" || path.startsWith("/employees") },
        { href: "/stats", label: "Stats", active: path.startsWith("/stats") },
      ]
    : [
        { href: `/employees/${a.employeeId}`, label: "My profile", active: path.startsWith("/employees") },
        { href: "/stats", label: "Stats", active: path.startsWith("/stats") },
        { href: "/self-appraisal", label: "Self appraisal", active: path.startsWith("/self-appraisal") },
      ];

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className={`${CONTAINER} grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6`}>
          <Link href={employer ? "/" : `/employees/${a.employeeId}`} className="pressable flex w-fit items-center gap-2.5">
            <SkynetMark size={32} className="text-ink" />
            <span className="leading-none">
              <span className="block text-[15px] font-semibold tracking-[0.12em]">SKYNET</span>
              <span className="mt-0.5 hidden text-[11px] text-ink-faint lg:block">{COMPANY.name}</span>
            </span>
          </Link>
          <nav aria-label="Primary" className="rounded-full border border-line bg-canvas p-1">
            <ul className="flex items-center gap-1">
              {nav.map((it) => (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={it.active ? "page" : undefined}
                    className={`pressable inline-block rounded-full px-4 py-1.5 text-[15px] ${it.active ? "bg-surface font-semibold text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center justify-end gap-3">
            <HeaderControls />
            <AccountMenu name={a.name} title={employer ? "Employer" : a.title} employeeId={a.employeeId} />
          </div>
        </div>
      </header>
      <GlobalAnnouncer />
      <main id="main" className={`${CONTAINER} flex-1 py-8`}>
        <div className="animate-rise">{children}</div>
      </main>
      <footer className="border-t border-line bg-surface">
        <p className={`${CONTAINER} py-4 text-xs text-ink-faint`}>
          Prototype. Uses simulated workplace data only — no real employee accounts, messages or systems are connected. AI output is an assessment aid and is not an employment decision.
        </p>
      </footer>
    </>
  );
}

function AccountMenu({ name, title, employeeId }: { name: string; title: string; employeeId?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={wrap} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="pressable flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-[15px] hover:bg-canvas">
        <Avatar employee={{ id: employeeId ?? `mgr-${name.toLowerCase().replace(/\s+/g, "-")}`, name }} size={28} />
        <span className="font-medium">{name}</span>
        <CaretDown aria-hidden="true" size={12} weight="bold" className="text-ink-faint" />
      </button>
      {open && (
        <div role="menu" className="animate-rise absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-ink-faint">{title}</p>
          </div>
          <button type="button" role="menuitem" onClick={signOut} className="pressable flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-canvas">
            <SignOut size={16} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
