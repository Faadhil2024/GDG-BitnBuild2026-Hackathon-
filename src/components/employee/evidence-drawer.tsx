"use client";

import { useEffect, useRef } from "react";
import { useAssessment } from "@/store/assessment-store";
import { getSource, SYSTEM_LABELS } from "@/data/sources";
import { Button, ConfidencePill, DirectionPill, Pill, formatDate } from "@/components/ui";
import { CATEGORY_LABELS, roleProfiles } from "@/lib/assessment/roles";
import { effectiveImpact } from "@/lib/assessment/engine";

export function EvidenceDrawer() {
  const { state, allEvidence, actions, employee } = useAssessment();
  const ref = useRef<HTMLDialogElement>(null);
  const ev = state.selectedEvidenceId ? allEvidence.find((e) => e.id === state.selectedEvidenceId) : undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ev && !d.open) d.showModal();
    if (!ev && d.open) d.close();
  }, [ev]);

  const src = ev ? getSource(ev.sourceId) : undefined;
  const weight = ev ? roleProfiles[employee.role].weights[ev.category] : 0;
  const impact = ev ? effectiveImpact(ev, state.adjustments) : 0;
  const included = ev ? state.includedIds.includes(ev.id) : false;

  return (
    <dialog
      ref={ref}
      onClose={() => actions.selectEvidence(undefined)}
      aria-labelledby="evidence-title"
      className="m-auto w-[min(640px,92vw)] rounded-lg border border-line bg-surface p-0 text-ink shadow-2xl"
    >
      {ev && (
        <article className="p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-ink-faint">
                {ev.id} · {CATEGORY_LABELS[ev.category]}
              </p>
              <h2 id="evidence-title" className="mt-1 text-lg font-semibold leading-snug">
                {ev.summary}
              </h2>
            </div>
            <Button variant="ghost" onClick={() => actions.selectEvidence(undefined)} aria-label="Close evidence details">
              ✕
            </Button>
          </header>

          <div className="mt-3 flex flex-wrap gap-2">
            <DirectionPill direction={ev.direction} />
            <ConfidencePill confidence={ev.confidence} />
            <Pill tone={included ? "accent" : "neutral"}>{included ? "In assessment" : "Not yet in assessment"}</Pill>
            {ev.id in state.adjustments && <Pill tone="high">Revised after review</Pill>}
          </div>

          <section aria-labelledby="src-h" className="mt-5 rounded-md border border-line bg-canvas p-4">
            <h3 id="src-h" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Source
            </h3>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-ink-faint">System</dt>
              <dd>{src ? SYSTEM_LABELS[src.system] : "—"}</dd>
              <dt className="text-ink-faint">Record</dt>
              <dd>{src?.name}</dd>
              <dt className="text-ink-faint">Reference</dt>
              <dd className="font-mono text-xs">{src?.ref}</dd>
              <dt className="text-ink-faint">Recorded</dt>
              <dd>{formatDate(ev.recordedAt)}</dd>
            </dl>
            <blockquote className="mt-3 border-l-2 border-accent bg-surface p-3 font-mono text-xs leading-relaxed text-ink">
              {ev.excerpt}
            </blockquote>
          </section>

          <section aria-labelledby="detail-h" className="mt-4">
            <h3 id="detail-h" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              What it shows
            </h3>
            <p className="mt-1 text-sm text-ink-muted">{ev.detail}</p>
            {ev.metrics && (
              <dl className="mt-3 grid grid-cols-2 gap-2">
                {ev.metrics.map((m) => (
                  <div key={m.label} className="rounded-md border border-line px-3 py-2">
                    <dt className="text-xs text-ink-faint">{m.label}</dt>
                    <dd className="text-base font-semibold tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section aria-labelledby="weigh-h" className="mt-4 rounded-md border border-line p-4">
            <h3 id="weigh-h" className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
              How it is weighed for a {employee.title}
            </h3>
            <p className="mt-1 text-sm">
              {weight === 0 ? (
                <>
                  <strong>Not weighed.</strong> {CATEGORY_LABELS[ev.category]} carries weight 0 for this role. The item is shown so you can see what the system saw, but it does not move the assessment.
                </>
              ) : impact === 0 ? (
                <>
                  <strong>Neutral.</strong> Recorded, but it does not bear on contribution in either direction.
                </>
              ) : (
                <>
                  Impact <strong className="font-mono">{impact > 0 ? "+" : ""}{impact}</strong> × role weight <strong className="font-mono">{weight.toFixed(1)}</strong> on {CATEGORY_LABELS[ev.category].toLowerCase()}.
                  {ev.id in state.adjustments && ` Original impact was ${ev.impact}; revised after a reviewed challenge.`}
                </>
              )}
            </p>
            {ev.mitigates && <p className="mt-2 text-xs text-ink-muted">Provides context for {ev.mitigates}.</p>}
          </section>
        </article>
      )}
    </dialog>
  );
}
