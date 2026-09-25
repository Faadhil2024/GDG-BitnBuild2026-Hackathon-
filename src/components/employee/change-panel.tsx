"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";
import { Card, LevelBadge, Pill, SectionTitle } from "@/components/ui";
import { diff } from "@/lib/assessment/engine";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";

/**
 * Before → after. Receives focus when an assessment change lands so keyboard and
 * screen-reader users are taken to the explanation, not left where they were.
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

  return (
    <Card aria-labelledby="change-heading" className="animate-rise border-accent/40 p-5">
      <SectionTitle id="change-heading">
        <span ref={headingRef} tabIndex={-1} className="outline-none">
          What changed, and why
        </span>
      </SectionTitle>

      <div className="flex flex-wrap items-center gap-3">
        <LevelBadge level={d.from} />
        <span aria-hidden="true" className="text-ink-faint">
          →
        </span>
        <LevelBadge level={d.to} />
        <span className="text-sm text-ink-muted">
          index {previous.score} → {assessment.score} · confidence {previous.confidence} → {assessment.confidence}
        </span>
        {!d.changed && <Pill tone="neutral">Level unchanged</Pill>}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Changed</h3>
          {d.improved.length + d.worsened.length === 0 ? (
            <p className="mt-1 text-sm text-ink-muted">No factor moved.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {d.improved.map((c) => (
                <li key={c} className="flex gap-2">
                  <span aria-hidden="true" className="text-high">
                    ▲
                  </span>
                  <span>
                    <span className="sr-only">Improved: </span>
                    {CATEGORY_LABELS[c]}
                  </span>
                </li>
              ))}
              {d.worsened.map((c) => (
                <li key={c} className="flex gap-2">
                  <span aria-hidden="true" className="text-low">
                    ▼
                  </span>
                  <span>
                    <span className="sr-only">Worsened: </span>
                    {CATEGORY_LABELS[c]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Did not change</h3>
          {d.unchangedConcerns.length === 0 ? (
            <p className="mt-1 text-sm text-ink-muted">No open concerns.</p>
          ) : (
            <ul className="mt-1 space-y-1 text-sm">
              {d.unchangedConcerns.map((c) => (
                <li key={c} className="flex gap-2">
                  <span aria-hidden="true" className="text-low">
                    ●
                  </span>
                  {CATEGORY_LABELS[c]} — still a concern
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4" aria-busy={state.explanationLoading}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">AI explanation</h3>
          {ex && (
            <Pill tone={ex.provenance === "live" ? "accent" : "neutral"}>
              {ex.provenance === "live" ? `Generated live · ${ex.model}` : "Deterministic explanation (no live model)"}
            </Pill>
          )}
        </div>
        {state.explanationLoading && !ex && <p className="mt-2 text-sm text-ink-muted">Generating explanation from the structured diff…</p>}
        {ex && (
          <div className="mt-2 space-y-3 text-sm">
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
                        onClick={() => actions.selectEvidence(c.evidenceId)}
                        className="shrink-0 rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-accent hover:border-accent"
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
