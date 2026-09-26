"use client";

import { useAssessment } from "@/store/assessment-store";
import { Button, Card, GradeBadge, Pill } from "@/components/ui";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { GRADE_MEANING } from "@/lib/assessment/engine";

export function AssessmentCard() {
  const { state, assessment, previous, pendingEnrichment, actions } = useAssessment();
  const frozen = state.phase === "frozen";
  const discovering = state.phase === "discovering";
  const conf = { high: "High", medium: "Medium", low: "Low" }[assessment.confidence];

  return (
    <Card aria-labelledby="assessment-heading" className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-6">
        <div>
          <h2 id="assessment-heading" className="text-base font-semibold">
            Current AI assessment
          </h2>
          <p className="mt-0.5 text-xs text-ink-faint">Computed from indexed evidence · not an employment decision</p>
        </div>
        <div className="flex items-center gap-2">
          {frozen && <Pill tone="frozen">Frozen — under review</Pill>}
          {discovering && <Pill tone="accent">Discovering evidence</Pill>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-6 py-5">
        <GradeBadge grade={assessment.grade} size="lg" label={null} />
        <div>
          <p className="text-sm font-medium">{GRADE_MEANING[assessment.grade]}</p>
          {previous && previous.grade !== assessment.grade && (
            <p className="mt-0.5 text-sm text-ink-muted">
              previously <strong className="font-medium text-ink">{previous.grade}</strong>
            </p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line border-t border-line bg-canvas/60">
        <div className="px-6 py-3">
          <dt className="text-xs text-ink-faint">Contribution index</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">
            {assessment.score}
            <span className="text-xs font-normal text-ink-faint"> / 100</span>
          </dd>
        </div>
        <div className="px-6 py-3">
          <dt className="text-xs text-ink-faint">Evidence coverage</dt>
          <dd className="mt-0.5 text-lg font-semibold tabular-nums">{Math.round(assessment.coverage * 100)}%</dd>
        </div>
        <div className="px-6 py-3">
          <dt className="text-xs text-ink-faint">Confidence</dt>
          <dd className="mt-0.5 text-lg font-semibold">{conf}</dd>
        </div>
      </dl>

      {assessment.missingAreas.length > 0 && (
        <div className="border-t border-line px-6 py-3 text-sm">
          <span className="font-medium text-moderate">Incomplete picture.</span>{" "}
          <span className="text-ink-muted">
            No evidence yet for {assessment.missingAreas.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")} — areas expected for this role.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-4">
        {state.phase === "initial" && (
          <Button variant="primary" onClick={actions.discover} disabled={pendingEnrichment.length === 0}>
            Discover evidence across connected sources
          </Button>
        )}
        {(state.phase === "enriched" || state.phase === "reviewed") && (
          <Button variant="secondary" onClick={actions.openChallenge}>
            Challenge a factor
          </Button>
        )}
        <Button variant="ghost" onClick={actions.reset} className="ml-auto text-xs">
          Reset demo
        </Button>
      </div>
    </Card>
  );
}
