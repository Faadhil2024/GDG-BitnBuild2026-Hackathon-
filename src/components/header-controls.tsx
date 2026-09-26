"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { VIEWERS } from "@/data/employees";

export interface EmployeeIndexItem {
  id: string;
  name: string;
  title: string;
  department: string;
}

export function PillNav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Employees", active: path === "/" || path.startsWith("/employees") },
    { href: "/stats", label: "Stats", active: path.startsWith("/stats") },
  ];
  return (
    <nav aria-label="Primary" className="rounded-full border border-line bg-canvas p-1">
      <ul className="flex items-center gap-1">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={`pressable inline-block rounded-full px-4 py-1.5 text-sm ${
                it.active ? "bg-surface font-semibold text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Realtime employee search — results update on every keystroke, no Enter needed. */
export function EmployeeSearch({ index }: { index: EmployeeIndexItem[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return index
      .filter((e) => e.name.toLowerCase().includes(s) || e.title.toLowerCase().includes(s) || e.department.toLowerCase().includes(s))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(s)) - Number(a.name.toLowerCase().startsWith(s)))
      .slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    setQ("");
    router.push(`/employees/${id}`);
  };

  return (
    <div ref={wrap} className="relative">
      <label htmlFor="emp-search" className="sr-only">
        Search employees
      </label>
      <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 focus-within:border-accent">
        <svg aria-hidden="true" className="h-4 w-4 text-ink-faint" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="9" r="5.5" />
          <path d="M13.5 13.5L17 17" strokeLinecap="round" />
        </svg>
        <input
          id="emp-search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && results[active]) go(results[active].id);
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search employees"
          className="w-44 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          autoComplete="off"
        />
      </div>
      {open && q.trim() && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Employee results"
          className="animate-rise absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
        >
          {results.length === 0 && <li className="px-3 py-2 text-sm text-ink-faint">No employees match “{q}”</li>}
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-${r.id}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); go(r.id); }}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-canvas" : ""}`}
            >
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-ink-faint">
                {r.title} · {r.department}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {q.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : ""}
      </p>
    </div>
  );
}

const KEY = "wp.viewer";

/** "Viewing as" — a named reviewer context. Cosmetic in this prototype; it does not change data access. */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readViewer = () => window.localStorage.getItem(KEY) ?? VIEWERS[0].name;
const writeViewer = (name: string) => {
  window.localStorage.setItem(KEY, name);
  listeners.forEach((cb) => cb());
};

export function ViewerPill() {
  const viewerName = useSyncExternalStore(subscribe, readViewer, () => VIEWERS[0].name);
  const viewer = VIEWERS.find((v) => v.name === viewerName) ?? VIEWERS[0];
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = viewer.name.split(" ").map((p) => p[0]).join("");

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="pressable flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-sm hover:bg-canvas"
      >
        <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
          {initials}
        </span>
        <span className="text-ink-faint">Viewing as</span>
        <span className="font-medium">{viewer.name}</span>
        <svg aria-hidden="true" className="h-3 w-3 text-ink-faint" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" aria-label="View as" className="animate-rise absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          {VIEWERS.map((v) => (
            <li
              key={v.name}
              role="option"
              aria-selected={v.name === viewer.name}
              onClick={() => {
                writeViewer(v.name);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 hover:bg-canvas ${v.name === viewer.name ? "bg-canvas" : ""}`}
            >
              <p className="text-sm font-medium">{v.name}</p>
              <p className="text-xs text-ink-faint">{v.title}</p>
            </li>
          ))}
          <li className="border-t border-line px-3 py-2 text-[11px] text-ink-faint" aria-hidden="true">
            Prototype: changes the reviewer label only.
          </li>
        </ul>
      )}
    </div>
  );
}
