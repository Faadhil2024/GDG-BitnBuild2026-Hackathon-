"use client";

import { useAssessment } from "@/store/assessment-store";
import { Card, formatTime } from "@/components/ui";
import type { AssessmentEvent, EventType } from "@/lib/types";

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

/** Consecutive "evidence found" events collapse into one entry so the log reads as a story, not a firehose. */
function groupEvents(events: AssessmentEvent[]): AssessmentEvent[] {
  const out: AssessmentEvent[] = [];
  for (const ev of events) {
    const last = out[out.length - 1];
    if (ev.type === "evidence_added" && last?.type === "evidence_added") {
      const ids = [...last.evidenceIds, ...ev.evidenceIds];
      out[out.length - 1] = { ...last, at: ev.at, title: `${ids.length} evidence items found`, description: "Across Slack, HR, reports, CRM and project sources.", evidenceIds: ids };
    } else {
      out.push(ev.type === "evidence_added" ? { ...ev, title: "1 evidence item found", description: ev.description } : ev);
    }
  }
  return out;
}

export function Timeline() {
  const { state, actions } = useAssessment();
  const events = groupEvents(state.events).reverse();

  return (
    <Card aria-labelledby="timeline-heading" className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="timeline-heading" className="text-base font-semibold">
          Assessment timeline
        </h2>
        <span className="text-xs text-ink-faint">{events.length} entries</span>
      </div>
      <ol className="relative mt-4 space-y-4 border-l border-line pl-4">
        {events.map((ev) => {
          const major = ev.type === "assessment_changed" || ev.type === "challenge_resolved" || ev.type === "assessment_frozen";
          return (
            <li key={ev.id} className="relative">
              <span aria-hidden="true" className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface ${TONE[ev.type]}`} />
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm ${major ? "font-semibold" : "font-medium"}`}>{ev.title}</p>
                <time dateTime={ev.at} className="shrink-0 font-mono text-[11px] text-ink-faint">
                  {formatTime(ev.at)}
                </time>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{ev.description}</p>
              {ev.evidenceIds.length > 0 && ev.evidenceIds.length <= 3 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {ev.evidenceIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={(e) => actions.selectEvidence(id, { x: e.clientX, y: e.clientY })}
                      className="pressable rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-accent hover:border-accent"
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
