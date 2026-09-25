"use client";

import { useAssessment } from "@/store/assessment-store";
import { Button, Card, ConfidencePill, LevelBadge, Pill } from "@/components/ui";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";

export function AssessmentCard() {
  const { state, assessment, previous, pendingEnrichment, actions } = useAssessment();
  const frozen = state.phase === "frozen";
  const discovering = state.phase === "discovering";

  return (
    <Card aria-labelledby="assessment-heading" className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="assessment-heading" className="text-sm font-semibold text-ink">
            Current AI assessment
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <LevelBadge level={assessment.level} size="lg" />
            {frozen && <Pill tone="frozen">Frozen — under review</Pill>}
            {discovering && <Pill tone="accent">Discovering evidence…</Pill>}
            {previous && previous.level !== assessment.level && (
              <span className="text-sm text-ink-muted">
                was <strong className="font-medium text-ink">{previous.level}</strong>
              </span>
            )}
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-right text-sm">
          <dt className="text-xs text-ink-faint">Contribution index</dt>
          <dt className="text-xs text-ink-faint">Evidence coverage</dt>
          <dt className="text-xs text-ink-faint">Confidence</dt>
          <dd className="text-xl font-semibold tabular-nums">
            {assessment.score}
            <span className="text-sm font-normal text-ink-faint"> / 100</span>
          </dd>
          <dd className="text-xl font-semibold tabular-nums">{Math.round(assessment.coverage * 100)}%</dd>
          <dd className="flex justify-end pt-1">
            <ConfidencePill confidence={assessment.confidence} />
          </dd>
        </dl>
      </div>

      {assessment.missingAreas.length > 0 && (
        <div className="mt-4 rounded-md border border-moderate/30 bg-moderate-soft px-3 py-2 text-sm text-ink">
          <strong className="font-medium">Incomplete picture.</strong> No evidence found for{" "}
          {assessment.missingAreas.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")} — areas expected for this role.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
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

      <p className="mt-3 text-xs text-ink-faint">
        AI assessment ≠ employment decision. This assessment describes the evidence available and requires human review.
      </p>
    </Card>
  );
}
