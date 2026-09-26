"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "@phosphor-icons/react";
import { markVisited, useUpdates, useVisited, type Update } from "@/lib/updates";
import { formatDate } from "@/components/ui";

/**
 * Global announcer: every logged change is spoken (polite/assertive live
 * regions) AND shown as a transient toast. The permanent record lives in the
 * Updates menu — the toast is the now, the log is the proof nothing was silent.
 */
export function GlobalAnnouncer() {
  const updates = useUpdates();
  const latest = updates[0];
  const lastId = useRef(0);
  const [toast, setToast] = useState<Update | null>(null);
  const polite = useRef<HTMLDivElement>(null);
  const assertive = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!latest || latest.id <= lastId.current) return;
    lastId.current = latest.id;
    const el = (latest.priority === "assertive" ? assertive : polite).current;
    if (el) {
      el.textContent = "";
      const t = setTimeout(() => (el.textContent = latest.text), 30);
      const t2 = setTimeout(() => setToast(null), 9000);
      setToast(latest);
      return () => {
        clearTimeout(t);
        clearTimeout(t2);
      };
    }
  }, [latest]);

  return (
    <>
      <div ref={polite} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
      <div ref={assertive} role="alert" aria-live="assertive" aria-atomic="true" className="sr-only" />
      {toast && (
        <div aria-hidden="true" className={`animate-rise fixed bottom-4 right-4 z-40 max-w-md rounded-lg border px-4 py-3 text-[14px] shadow-lg ${toast.priority === "assertive" ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-surface text-ink-muted"}`}>
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {toast.priority === "assertive" ? "Decision update" : "Status"}
          </div>
          {toast.text}
        </div>
      )}
    </>
  );
}

/** Header bell: unread count + the reviewable change log. */
export function UpdatesMenu() {
  const updates = useUpdates();
  const visited = useVisited();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const unseen = updates.filter((u) => u.at > (visited.feed ?? "")).length;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrap} className="relative">
      <button type="button" aria-label={`Updates${unseen ? `, ${unseen} unread` : ""}`} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="pressable relative grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-muted hover:text-ink">
        <Bell size={17} />
        {unseen > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">{unseen}</span>}
      </button>
      {open && (
        <div role="region" aria-label="Change log" className="animate-rise absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-semibold">Updates</p>
            <button type="button" onClick={() => markVisited("feed")} className="pressable text-[13px] text-accent hover:underline">Mark all read</button>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto">
            {updates.length === 0 && <li className="px-4 py-6 text-center text-[13px] text-ink-faint">No changes yet. Every change in this app is recorded here.</li>}
            {updates.map((u) => (
              <li key={u.id} className={`px-4 py-3 text-[13px] ${u.at > (visited.feed ?? "") ? "" : "opacity-60"}`}>
                <p className="flex items-center gap-2">
                  {u.priority === "assertive" && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  <span className="text-ink">{u.text}</span>
                </p>
                <p className="mt-0.5 text-[12px] text-ink-faint">{formatDate(u.at)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
