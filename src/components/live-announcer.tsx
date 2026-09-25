"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";

/**
 * Meaningful state changes are announced twice: programmatically via ARIA live
 * regions (for assistive tech) and visually via a persistent update banner.
 * Two regions are used so that assessment-level changes (assertive) are not
 * drowned out by routine progress updates (polite).
 */
export function LiveAnnouncer() {
  const { state } = useAssessment();
  const a = state.announcement;
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!a) return;
    const el = (a.priority === "assertive" ? assertiveRef : politeRef).current;
    if (!el) return;
    // Clear then set so identical consecutive messages are still announced.
    el.textContent = "";
    const t = setTimeout(() => {
      el.textContent = a.text;
    }, 30);
    return () => clearTimeout(t);
  }, [a]);

  return (
    <>
      <div ref={politeRef} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
      <div ref={assertiveRef} role="alert" aria-live="assertive" aria-atomic="true" className="sr-only" />
      {a && (
        <div
          key={a.id}
          aria-hidden="true"
          className={`animate-rise fixed bottom-4 right-4 z-40 max-w-md rounded-lg border px-4 py-3 text-sm shadow-lg ${
            a.priority === "assertive" ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-surface text-ink-muted"
          }`}
        >
          <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
            {a.priority === "assertive" ? "Assessment update" : "Status"}
          </div>
          {a.text}
        </div>
      )}
    </>
  );
}
