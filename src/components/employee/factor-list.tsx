"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { effectiveImpact } from "@/lib/assessment/engine";
import type { Factor } from "@/lib/types";

const STATUS: Record<Factor["status"], { label: string; tone: "high" | "low" | "moderate" | "frozen" }> = {
  supported: { label: "Supported", tone: "high" },
  concern: { label: "Concern", tone: "low" },
  missing: { label: "No evidence", tone: "moderate" },
  not_applicable: { label: "Not used for role", tone: "frozen" },
};

export function FactorList() {
  const { assessment, allEvidence, state, actions, employee } = useAssessment();
  const weighted = assessment.factors.filter((f) => f.weight > 0).sort((a, b) => b.weight - a.weight);
  const ignored = assessment.factors.filter((f) => f.weight === 0 && f.evidenceIds.length > 0);

  const renderFactor = (f: Factor) => {
    const items = f.evidenceIds.map((id) => allEvidence.find((e) => e.id === id)!).filter(Boolean);
    const s = STATUS[f.status];
    const pct = ((f.score + 2) / 4) * 100;
    return (
      <li key={f.category} className="animate-rise border-t border-line py-3 first:border-t-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{f.label}</h3>
            <Pill tone={s.tone}>{s.label}</Pill>
          </div>
          <span className="text-xs text-ink-faint">
            weight {f.weight.toFixed(1)} · score {f.score > 0 ? "+" : ""}
            {f.score}
          </span>
        </div>
        {f.weight > 0 && (
          <div
            role="meter"
            aria-label={`${f.label} score`}
            aria-valuemin={-2}
            aria-valuemax={2}
            aria-valuenow={f.score}
            className="relative mt-2 h-1.5 w-full overflow-hidden rounded bg-canvas"
          >
            <div className="absolute left-1/2 top-0 h-full w-px bg-line" aria-hidden="true" />
            <div
              aria-hidden="true"
              className={`absolute top-0 h-full transition-all duration-500 ${f.score < 0 ? "bg-low" : "bg-high"}`}
              style={f.score < 0 ? { left: `${pct}%`, width: `${50 - pct}%` } : { left: "50%", width: `${pct - 50}%` }}
            />
          </div>
        )}
        <p className="mt-1.5 text-sm text-ink-muted">{f.summary}</p>
        {items.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Evidence for ${f.label}`}>
            {items.map((e) => {
              const imp = effectiveImpact(e, state.adjustments);
              const adjusted = e.id in state.adjustments;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={(ev) => actions.selectEvidence(e.id, { x: ev.clientX, y: ev.clientY })}
                    className="pressable group inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-left text-xs hover:border-accent hover:bg-accent-soft"
                    aria-label={`View evidence ${e.id}: ${e.summary}`}
                  >
                    <span className="font-mono text-[10px] text-ink-faint">{e.id}</span>
                    <span className="truncate">{e.summary}</span>
                    <span className={`shrink-0 font-mono text-[10px] ${imp < 0 ? "text-low" : imp > 0 ? "text-high" : "text-ink-faint"}`}>
                      {imp > 0 ? "+" : ""}
                      {imp}
                      {adjusted && <span title="Revised after review"> ↺</span>}
                    </span>
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
    <Card aria-labelledby="factors-heading" className="p-5">
      <SectionTitle id="factors-heading" hint={`Role profile: ${employee.department}`}>
        What the assessment is based on
      </SectionTitle>
      <ul>{weighted.map(renderFactor)}</ul>
      {ignored.length > 0 && (
        <details className="mt-3 rounded-md border border-dashed border-line bg-canvas px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-ink-muted">
            Seen but not weighed ({ignored.reduce((n, f) => n + f.evidenceIds.length, 0)} items) — not a measure of value for a {employee.department.toLowerCase()} role
          </summary>
          <ul className="mt-1">{ignored.map(renderFactor)}</ul>
        </details>
      )}
    </Card>
  );
}
