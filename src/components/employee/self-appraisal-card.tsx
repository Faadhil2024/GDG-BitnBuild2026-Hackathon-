"use client";

import { SealCheck, Warning } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { QUESTIONS } from "@/data/self-appraisal";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { Card, GradeBadge, Pill, formatDate } from "@/components/ui";

/** The employee's own account beside the evidence-based grade, and the manager's decision if made. */
export function SelfAppraisalCard() {
  const { employee } = useAssessment();
  const sa = useSelfAppraisals()[employee.id];
  const d = useDecisions()[employee.id];
  if (!sa) return null;
  const ai = sa.ai;
  const L = (cs: string[]) => cs.map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]).join(", ");

  return (
    <Card aria-labelledby="sa-card-heading" className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="sa-card-heading" className="text-base font-semibold">Self-appraisal and review</h2>
        <span className="text-xs text-ink-faint">Submitted {formatDate(sa.submittedAt)}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-line p-4">
          <p className="text-xs text-ink-faint">Self-grade</p>
          <div className="mt-2"><GradeBadge grade={sa.grade} size="md" label={null} /></div>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-xs text-ink-faint">AI grade from evidence</p>
          <div className="mt-2">{ai ? <GradeBadge grade={ai.grade} size="md" label={null} /> : <span className="text-sm text-ink-faint">No evidence indexed</span>}</div>
        </div>
        <div className="rounded-md border border-line p-4">
          <p className="text-xs text-ink-faint">Manager decision</p>
          <div className="mt-2">
            {d ? (
              <div className="flex flex-wrap items-center gap-2">
                <GradeBadge grade={d.finalGrade} size="md" label={null} />
                {d.outcome === "override" ? (
                  <Pill tone="moderate"><Warning size={12} weight="fill" /> Human override</Pill>
                ) : (
                  <Pill tone="high"><SealCheck size={12} weight="fill" /> Verified{d.outcome === "revised" ? " · revised" : ""}</Pill>
                )}
              </div>
            ) : (
              <Pill tone="neutral">Pending</Pill>
            )}
          </div>
        </div>
      </div>

      {ai && (
        <div className="mt-4 rounded-md bg-canvas p-4 text-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-ink-muted">AI review of the self-appraisal</h3>
            <Pill tone="neutral">Evidence engine · deterministic</Pill>
          </div>
          <p className="prose-measure mt-2 text-ink">{ai.summary}</p>
          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            {ai.supported.length > 0 && <div><dt className="text-ink-faint">Claims backed by evidence</dt><dd>{L(ai.supported)}</dd></div>}
            {ai.unsupported.length > 0 && <div><dt className="text-ink-faint">Claims without indexed evidence</dt><dd>{L(ai.unsupported)}</dd></div>}
            {ai.unclaimed.length > 0 && <div><dt className="text-ink-faint">Evidence the employee did not mention</dt><dd>{L(ai.unclaimed)}</dd></div>}
            {ai.concerns.length > 0 && <div><dt className="text-ink-faint">Concerns on record</dt><dd>{L(ai.concerns)}</dd></div>}
          </dl>
        </div>
      )}

      {d && d.rounds.length > 0 && (
        <div className="mt-4 text-sm">
          <h3 className="text-xs font-semibold text-ink-muted">Review rounds</h3>
          <ol className="mt-2 space-y-2">
            {d.rounds.map((r, i) => (
              <li key={i} className="rounded-md border border-line p-3">
                <p className="text-xs text-ink-faint">Round {i + 1} · proposed {r.proposedGrade} · {r.verdict.accepted ? "accepted" : "not accepted"}</p>
                <p className="mt-1 text-ink-muted">{r.reason}</p>
                <p className="mt-1 text-xs">{r.verdict.reason}</p>
              </li>
            ))}
          </ol>
          {d.overrideNote && (
            <p className="mt-2 rounded-md border border-moderate/30 bg-moderate-soft p-3 text-sm">
              <strong className="font-medium">Override note by {d.decidedBy}:</strong> {d.overrideNote}
            </p>
          )}
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-ink-muted">Read the full self-appraisal</summary>
        <dl className="mt-3 space-y-3">
          {QUESTIONS.map((q) => (
            <div key={q.id}>
              <dt className="text-xs font-medium text-ink-muted">{q.label}</dt>
              <dd className="prose-measure mt-0.5 text-sm">{sa.answers[q.id] || <span className="text-ink-faint">—</span>}</dd>
            </div>
          ))}
        </dl>
      </details>
    </Card>
  );
}
