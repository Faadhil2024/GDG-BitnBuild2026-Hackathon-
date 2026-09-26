"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card, DirectionPill } from "@/components/ui";
import { getSource, SYSTEM_LABELS } from "@/data/sources";

/** Every evidence item the system has seen for this employee, newest discovery first. */
export function EvidenceFeed() {
  const { includedEvidence, pendingEnrichment, actions, state } = useAssessment();
  const discovering = state.phase === "discovering";
  const items = [...includedEvidence].reverse();

  return (
    <Card aria-labelledby="evidence-heading" className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="evidence-heading" className="text-base font-semibold">
          Evidence collected
        </h2>
        <span className="text-xs text-ink-faint">
          {includedEvidence.length} items{pendingEnrichment.length && !discovering ? ` · ${pendingEnrichment.length} undiscovered` : ""}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {items.map((e) => {
          const src = getSource(e.sourceId);
          return (
            <li key={e.id} className="py-3">
              <button
                type="button"
                onClick={(ev) => actions.selectEvidence(e.id, { x: ev.clientX, y: ev.clientY })}
                className="pressable group flex w-full items-start justify-between gap-4 text-left"
                aria-label={`View evidence ${e.id}: ${e.summary}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm leading-snug group-hover:text-accent" title={e.summary}>
                    {e.summary}
                  </p>
                  <p className="mt-1 truncate text-xs text-ink-faint">
                    {src ? SYSTEM_LABELS[src.system] : ""} · {src?.name} · <span className="font-mono">{e.id}</span>
                  </p>
                </div>
                <span className="shrink-0 pt-0.5">
                  <DirectionPill direction={e.direction} />
                </span>
              </button>
            </li>
          );
        })}
        {discovering && (
          <li className="py-3 text-sm text-ink-muted" aria-hidden="true">
            Reading sources…
          </li>
        )}
      </ul>
    </Card>
  );
}
