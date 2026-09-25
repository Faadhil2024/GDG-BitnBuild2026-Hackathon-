"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";
import { Card, LevelBadge, Pill } from "@/components/ui";
import { diff } from "@/lib/assessment/engine";

function WeightedScore({ f }: { f: { weight: number; score: number } }) {
  const v = f.weight * f.score;
  return (
    <span className={`font-mono tabular-nums ${v < 0 ? "text-low" : v > 0 ? "text-ink" : "text-ink-faint"}`}>{v > 0 ? "+" : ""}{v.toFixed(1)}</span>
  );
}

/**
 * The centerpiece: before → after. Receives focus when a change lands so
 * keyboard and screen-reader users are taken to the explanation.
 */
export function ChangePanel() {
  const { state, assessment, previous, allEvidence, actions } = useAssessment();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.lastChangeFocusKey > 0) headingRef.current?.focus();
  }, [state.lastChangeFocusKey]);

  if (!previous) return null;
  const d = diff(previous, assessment);
  const ex = state.explanation;

  const beforeByCat = Object.fromEntries(previous.factors.map((f) => [f.category, f]));
  const rows = assessment.factors
    .filter((f) => f.weight > 0)
    .map((f) => {
      const b = beforeByCat[f.category]!;
      const delta = f.weight * f.score - b.weight * b.score;
      return { after: f, before: b, delta };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.after.weight - a.after.weight);
  const newEvidence = assessment.evidenceIds.filter((id) => !previous.evidenceIds.includes(id));

  return (
    <Card aria-labelledby="change-heading" className="animate-rise border-2 border-ink/80 p-0">
      <div className="border-b border-line px-5 py-3">
        <h2 id="change-heading" ref={headingRef} tabIndex={-1} className="flex flex-wrap items-center gap-3 text-sm font-semibold outline-none">
          Assessment correction
          {!d.changed && <Pill tone="neutral">Level unchanged</Pill>}
          <span className="ml-auto text-xs font-normal text-ink-faint">
            {previous.score} → {assessment.score} index · confidence {previous.confidence} → {assessment.confidence}
          </span>
        </h2>
      </div>

      {/* The verdict moment — the only place the interface is allowed to be loud. */}
      <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-6">
        <div className="rounded-md border border-line bg-canvas p-4 text-center">
          <p className="mb-2 text-xs font-medium text-ink-faint">Before — title-driven signals only</p>
          <div className="flex justify-center"><LevelBadge level={d.from} size="lg" /></div>
          <p className="mt-2 text-xs text-ink-faint">
            {Math.round(previous.coverage * 100)}% coverage · {previous.missingAreas.length} expected areas unproven
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 px-2 text-center">
          <span aria-hidden="true" className="text-2xl text-ink-faint">→</span>
          <span className="max-w-[12rem] text-xs text-ink-muted">
            {newEvidence.length > 0 ? `${newEvidence.length} evidence item(s) incorporated` : "factor re-weighted after review"}
          </span>
        </div>
        <div className="rounded-md border border-line bg-surface p-4 text-center">
          <p className="mb-2 text-xs font-medium text-ink-faint">After — {state.challenge?.status === "resolved" && state.phase === "reviewed" ? "reviewed challenge" : "full evidence picture"}</p>
          <div className="flex justify-center"><LevelBadge level={d.to} size="lg" /></div>
          <p className="mt-2 text-xs text-ink-faint">
            {Math.round(assessment.coverage * 100)}% coverage · {assessment.missingAreas.length === 0 ? "all expected areas have evidence" : `${assessment.missingAreas.length} still unproven`}
          </p>
        </div>
      </div>

      {/* Factor-level diff — every row is checkable. Changed rows get a tint, not just an icon. */}
      <div className="px-5 pb-2">
        <table className="w-full text-sm">
          <caption className="sr-only">Factor scores before and after the correction. Changed rows are tinted.</caption>
          <thead className="text-left text-xs text-ink-faint">
            <tr>
              <th scope="col" className="py-1.5 pr-4 font-medium">Factor</th>
              <th scope="col" className="w-20 py-1.5 pr-4 font-medium">Before</th>
              <th scope="col" className="w-20 py-1.5 font-medium">After</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ before, after, delta }) => (
              <tr
                key={after.category}
                className={
                  delta > 0
                    ? "bg-high-soft"
                    : delta < 0
                      ? "bg-low-soft"
                      : after.status === "concern"
                        ? "bg-moderate-soft/50"
                        : ""
                }
              >
                <th scope="row" className="py-1.5 pl-2 pr-4 text-left font-normal">
                  <span className="mr-1.5 inline-block w-4 text-center" aria-hidden="true">
                    {delta > 0 ? "▲" : delta < 0 ? "▼" : after.status === "concern" ? "●" : "—"}
                  </span>
                  {after.label}
                  {delta === 0 && after.status === "concern" && <span className="sr-only"> — unchanged concern</span>}
                </th>
                <td className="py-1.5 pr-4"><WeightedScore f={before} /></td>
                <td className="py-1.5"><WeightedScore f={after} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-[11px] text-ink-faint">Scores are weight × impact (−2…+2). Click any evidence chip below or in the factor list to inspect the source.</p>
      </div>

      {/* AI explanation — constrained line length, honest provenance. */}
      <div className="border-t border-line bg-canvas px-5 py-4" aria-busy={state.explanationLoading}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-ink-muted">AI explanation</h3>
          {ex && (
            <Pill tone={ex.provenance === "live" ? "accent" : "neutral"}>
              {ex.provenance === "live" ? `Generated live · ${ex.model}` : "Deterministic explanation (no live model)"}
            </Pill>
          )}
        </div>
        {state.explanationLoading && !ex && <p className="mt-2 text-sm text-ink-muted">Generating explanation from the structured diff…</p>}
        {ex && (
          <div className="prose-measure mt-2 space-y-3 text-sm">
            <p className="font-medium">{ex.headline}</p>
            <p className="text-ink-muted">{ex.summary}</p>
            {ex.changes.length > 0 && (
              <ul className="space-y-1.5">
                {ex.changes.map((c) => {
                  const e = allEvidence.find((x) => x.id === c.evidenceId);
                  return (
                    <li key={c.evidenceId} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={(ev) => actions.selectEvidence(c.evidenceId, { x: ev.clientX, y: ev.clientY })}
                        className="pressable shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-accent hover:border-accent"
                        aria-label={`View evidence ${c.evidenceId}${e ? `: ${e.summary}` : ""}`}
                      >
                        {c.evidenceId}
                      </button>
                      <span>{c.statement}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {(ex.unchanged.length > 0 || ex.caveats.length > 0) && (
              <ul className="space-y-1 text-xs text-ink-muted">
                {ex.unchanged.map((u, i) => <li key={`u${i}`}>• {u}</li>)}
                {ex.caveats.map((c, i) => <li key={`c${i}`}>• {c}</li>)}
              </ul>
            )}
            {ex.fallbackReason && <p className="text-xs text-ink-faint">Fallback reason: {ex.fallbackReason}</p>}
          </div>
        )}
      </div>
    </Card>
  );
}
