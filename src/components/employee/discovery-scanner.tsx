"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";
import { SCAN_STEPS } from "@/data/scan-steps";
import { SYSTEM_LABELS } from "@/data/sources";
import { Card } from "@/components/ui";

/**
 * Shown in place of the factor list while sources are being read. One step
 * at a time: blinking dot → green check. The current step is exposed via a
 * polite status region so the sequence is not visual-only.
 */
export function DiscoveryScanner() {
  const { state, employee } = useAssessment();
  const step = state.scanStep;
  const total = SCAN_STEPS.length;
  const done = step >= total;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Bring the scanner into view and hand it focus so the sequence is seen and heard.
  useEffect(() => {
    headingRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <Card aria-labelledby="scan-heading" className="animate-rise border-ink/30 p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="scan-heading" ref={headingRef} tabIndex={-1} className="text-base font-semibold outline-none">
          {done ? "Evidence collected" : "Discovering evidence"}
        </h2>
        <span className="font-mono text-xs tabular-nums text-ink-faint">
          {Math.min(step, total)} / {total}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        {done ? "Incorporating findings into the assessment…" : `Reading connected sources for ${employee.name}. Nothing is written back to any system.`}
      </p>

      <ol className="mt-5 space-y-3">
        {SCAN_STEPS.map((s, i) => {
          const st = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`scan-dot grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                  st === "done" ? "border-high bg-high" : st === "active" ? "border-ink bg-ink" : "border-line bg-surface"
                }`}
                data-state={st}
                aria-hidden="true"
              >
                <svg className="scan-check h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6.5l2.5 2.5 4.5-5" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${st === "pending" ? "text-ink-faint" : "text-ink"}`}>{s.label(employee.name)}</p>
                <p className="text-xs text-ink-faint">{s.systems.map((x) => SYSTEM_LABELS[x]).join(" · ")}</p>
              </div>
              <span className="w-16 text-right text-xs text-ink-faint">
                {st === "done" ? "Done" : st === "active" ? "Reading…" : ""}
              </span>
            </li>
          );
        })}
      </ol>

      <p role="status" aria-live="polite" className="sr-only">
        {done ? "All sources read. Evidence collected." : `Step ${step + 1} of ${total}: ${SCAN_STEPS[step]?.label(employee.name)}`}
      </p>
    </Card>
  );
}
