"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card, SectionTitle, formatTime } from "@/components/ui";
import type { EventType } from "@/lib/types";

const TONE: Record<EventType, string> = {
  loaded: "bg-ink-faint",
  evidence_added: "bg-accent",
  assessment_changed: "bg-moderate",
  assessment_unchanged: "bg-ink-faint",
  challenge_opened: "bg-frozen",
  assessment_frozen: "bg-frozen",
  challenge_resolved: "bg-high",
  reclassified: "bg-high",
};

export function Timeline() {
  const { state, actions } = useAssessment();
  const events = [...state.events].reverse();

  return (
    <Card aria-labelledby="timeline-heading" className="p-5">
      <SectionTitle id="timeline-heading" hint={`${state.events.length} events`}>
        Assessment timeline
      </SectionTitle>
      <ol className="relative space-y-3 border-l border-line pl-4">
        {events.map((ev) => {
          const major = ev.type === "assessment_changed" || ev.type === "challenge_resolved" || ev.type === "assessment_frozen";
          return (
            <li key={ev.id} className="animate-rise relative">
              <span aria-hidden="true" className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${TONE[ev.type]}`} />
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm ${major ? "font-semibold" : "font-medium"}`}>{ev.title}</p>
                <time dateTime={ev.at} className="shrink-0 font-mono text-[11px] text-ink-faint">
                  {formatTime(ev.at)}
                </time>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">{ev.description}</p>
              {ev.evidenceIds.length > 0 && ev.evidenceIds.length <= 3 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {ev.evidenceIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => actions.selectEvidence(id)}
                      className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-accent hover:border-accent"
                      aria-label={`View evidence ${id}`}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
