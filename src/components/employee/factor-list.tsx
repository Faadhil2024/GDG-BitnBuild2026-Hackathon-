"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card } from "@/components/ui";
import { effectiveImpact } from "@/lib/assessment/engine";
import type { Factor } from "@/lib/types";

export function importanceOf(weight: number) {
  return weight >= 1 ? "High" : weight >= 0.7 ? "Medium" : "Low";
}

function statusText(f: Factor, n: number) {
  if (f.status === "not_applicable") return "Not used for this role";
  if (f.status === "missing") return "No evidence found";
  if (f.status === "concern") return `Concern · ${n} item${n === 1 ? "" : "s"}`;
  return `${f.score >= 2 ? "Strong" : "Some"} evidence · ${n} item${n === 1 ? "" : "s"}`;
}

export function FactorList({ viewer = "employer" }: { viewer?: "employer" | "employee" } = {}) {
  const { assessment, allEvidence, state, actions, employee } = useAssessment();
  const weighted = assessment.factors.filter((f) => f.weight > 0).sort((a, b) => b.weight - a.weight || b.score - a.score);
  const ignored = assessment.factors.filter((f) => f.weight === 0 && f.evidenceIds.length > 0);

  const renderFactor = (f: Factor) => {
    const items = f.evidenceIds.map((id) => allEvidence.find((e) => e.id === id)!).filter(Boolean);
    const active = items.filter((e) => effectiveImpact(e, state.adjustments) !== 0);
    const pct = Math.min(100, (Math.abs(f.score) / 2) * 100);
    const tone = f.status === "concern" ? "text-low" : f.status === "missing" ? "text-moderate" : f.status === "supported" ? "text-high" : "text-ink-faint";

    return (
      <li key={f.category} className="grid grid-cols-[minmax(0,1fr)] gap-x-6 gap-y-2 border-t border-line py-4 first:border-t-0 sm:grid-cols-[220px_minmax(0,1fr)_170px]">
        <div>
          <h3 className="text-sm font-medium">{f.label}</h3>
          {f.weight > 0 && <p className="mt-0.5 text-xs text-ink-faint">{importanceOf(f.weight)} importance for {employee.department}</p>}
        </div>

        <div className="flex items-center">
          {f.weight > 0 ? (
            <div
              role="meter"
              aria-label={`${f.label}: ${statusText(f, active.length)}`}
              aria-valuemin={-2}
              aria-valuemax={2}
              aria-valuenow={f.score}
              className="h-2 w-full overflow-hidden rounded-full bg-canvas"
            >
              <div
                className={`bar-fill h-full rounded-full ${f.status === "concern" ? "bg-low" : "bg-high"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <span className="text-xs text-ink-faint">Shown for transparency only</span>
          )}
        </div>

        <p className={`text-sm sm:text-right ${tone}`}>{statusText(f, active.length)}</p>

        {items.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 sm:col-span-3" aria-label={`Evidence for ${f.label}`}>
            {items.map((e) => {
              const imp = effectiveImpact(e, state.adjustments);
              const adjusted = e.id in state.adjustments;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={(ev) => actions.selectEvidence(e.id, { x: ev.clientX, y: ev.clientY })}
                    className="pressable inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-left text-xs hover:border-accent hover:bg-accent-soft"
                    aria-label={`View evidence ${e.id}: ${e.summary}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${imp < 0 ? "bg-low" : imp > 0 ? "bg-high" : "bg-line"}`}
                    />
                    <span className="truncate">{e.summary}</span>
                    {adjusted && (
                      <span className="shrink-0 text-[10px] text-ink-faint" title="Revised after review">
                        revised
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <Card aria-labelledby="factors-heading" className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="factors-heading" className="text-base font-semibold">
          {viewer === "employee" ? "How your grade was built" : "What the assessment is based on"}
        </h2>
        <span className="text-xs text-ink-faint">{viewer === "employee" ? `Weighted by what matters for a ${employee.title}` : `Sorted by importance for a ${employee.title}`}</span>
      </div>
      <ul className="mt-3">{weighted.map(renderFactor)}</ul>
      {ignored.length > 0 && (
        <details className="mt-4 rounded-md border border-dashed border-line px-4 py-2">
          <summary className="cursor-pointer text-sm text-ink-muted">
            Seen but not weighed — {ignored.reduce((n, f) => n + f.evidenceIds.length, 0)} item(s) that do not measure a {employee.department.toLowerCase()} role
          </summary>
          <ul className="mt-1">{ignored.map(renderFactor)}</ul>
        </details>
      )}
    </Card>
  );
}
