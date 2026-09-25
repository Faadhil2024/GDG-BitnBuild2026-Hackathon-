"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card, DirectionPill, SectionTitle } from "@/components/ui";
import { getSource, SYSTEM_LABELS } from "@/data/sources";

/** Every evidence item the system has seen for this employee, in discovery order. */
export function EvidenceFeed() {
  const { includedEvidence, pendingEnrichment, actions, state } = useAssessment();
  const discovering = state.phase === "discovering";

  return (
    <Card aria-labelledby="evidence-heading" className="p-5">
      <SectionTitle id="evidence-heading" hint={`${includedEvidence.length} seen${pendingEnrichment.length && !discovering ? ` · ${pendingEnrichment.length} not yet discovered` : ""}`}>
        Evidence seen by the system
      </SectionTitle>
      <ul className="divide-y divide-line">
        {includedEvidence.map((e) => {
          const src = getSource(e.sourceId);
          return (
            <li key={e.id} className="animate-rise py-2.5">
              <button
                type="button"
                onClick={() => actions.selectEvidence(e.id)}
                className="group flex w-full items-start justify-between gap-3 text-left"
                aria-label={`View evidence ${e.id}: ${e.summary}`}
              >
                <div className="min-w-0">
                  <p className="text-sm group-hover:text-accent">{e.summary}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    <span className="font-mono">{e.id}</span> · {src ? SYSTEM_LABELS[src.system] : ""} · {src?.name}
                  </p>
                </div>
                <DirectionPill direction={e.direction} />
              </button>
            </li>
          );
        })}
        {discovering && (
          <li className="py-2.5 text-sm text-ink-muted" aria-hidden="true">
            Scanning connected sources…
          </li>
        )}
      </ul>
    </Card>
  );
}
