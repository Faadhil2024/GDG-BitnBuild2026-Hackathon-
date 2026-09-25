"use client";

import { useEffect, useRef, useState } from "react";
import { useAssessment } from "@/store/assessment-store";
import { Button, Card, Pill, SectionTitle } from "@/components/ui";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { CHALLENGEABLE } from "@/lib/assessment/challenge";
import { getSource } from "@/data/sources";
import type { ContributionCategory } from "@/lib/types";

export function ChallengePanel() {
  const { state, assessment, submittableEvidence, actions, allEvidence } = useAssessment();
  const [category, setCategory] = useState<ContributionCategory>("delivery_reliability");
  const [statement, setStatement] = useState("The Northwind delay was caused by the external agency and approved by my manager — it should not count as my delivery failure.");
  const [selected, setSelected] = useState<string[]>([]);
  const firstField = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (state.phase === "challenging") firstField.current?.focus();
  }, [state.phase]);

  if (state.phase === "challenging") {
    const concernFirst = [...CHALLENGEABLE].sort((a, b) => {
      const s = (c: ContributionCategory) => (assessment.factors.find((f) => f.category === c)?.status === "concern" ? 0 : 1);
      return s(a) - s(b);
    });
    return (
      <Card aria-labelledby="challenge-heading" className="animate-rise border-frozen/40 p-5">
        <SectionTitle id="challenge-heading">Challenge this assessment</SectionTitle>
        <p className="mb-4 text-sm text-ink-muted">
          Contest one factor by attaching evidence. The assessment is frozen while the review runs. A challenge is reviewed on its evidence — it is not guaranteed to change the result.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            actions.submitChallenge({ category, statement, evidenceIds: selected });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="ch-factor" className="block text-sm font-medium">
              Factor being contested
            </label>
            <select
              id="ch-factor"
              ref={firstField}
              value={category}
              onChange={(e) => setCategory(e.target.value as ContributionCategory)}
              className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
            >
              {concernFirst.map((c) => {
                const f = assessment.factors.find((x) => x.category === c);
                return (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                    {f?.status === "concern" ? " — currently a concern" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label htmlFor="ch-statement" className="block text-sm font-medium">
              Your statement
            </label>
            <textarea
              id="ch-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Attach supporting evidence</legend>
            <p id="ch-evidence-hint" className="text-xs text-ink-muted">
              Only evidence about the contested factor is admitted. Attaching unrelated items will not help.
            </p>
            <ul className="mt-2 space-y-1.5" aria-describedby="ch-evidence-hint">
              {submittableEvidence.map((e) => {
                const src = getSource(e.sourceId);
                const id = `ch-ev-${e.id}`;
                return (
                  <li key={e.id} className="flex items-start gap-2 rounded-md border border-line p-2">
                    <input
                      id={id}
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(e.id)}
                      onChange={(ev) => setSelected((s) => (ev.target.checked ? [...s, e.id] : s.filter((x) => x !== e.id)))}
                    />
                    <label htmlFor={id} className="flex-1 text-sm">
                      <span className="font-mono text-[10px] text-ink-faint">{e.id}</span> {e.summary}
                      <span className="block text-xs text-ink-faint">
                        {src?.name} · {CATEGORY_LABELS[e.category]}
                        {e.discoveredIn === "challenge" ? " · submitted by employee" : ""}
                      </span>
                    </label>
                    <button type="button" onClick={(ev) => actions.selectEvidence(e.id, { x: ev.clientX, y: ev.clientY })} className="pressable text-xs text-accent hover:underline" aria-label={`View evidence ${e.id}`}>
                      View
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Submit challenge for review
            </Button>
            <Button type="button" variant="ghost" onClick={actions.cancelChallenge}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  const ch = state.challenge;
  if (!ch) return null;
  return (
    <Card aria-labelledby="challenge-status-heading" aria-busy={ch.status !== "resolved"} className="animate-rise p-5">
      <SectionTitle id="challenge-status-heading">Challenge</SectionTitle>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{CATEGORY_LABELS[ch.category]}</span>
        {ch.status !== "resolved" ? (
          <Pill tone="frozen">Under review — assessment frozen</Pill>
        ) : ch.outcome === "updated" ? (
          <Pill tone="high">Upheld — factor revised</Pill>
        ) : (
          <Pill tone="low">Not upheld — unchanged</Pill>
        )}
      </div>
      <blockquote className="mt-2 border-l-2 border-line pl-3 text-sm text-ink-muted">{ch.statement}</blockquote>
      <p className="mt-2 text-xs text-ink-faint">
        Evidence attached: {ch.evidenceIds.length ? ch.evidenceIds.map((id) => allEvidence.find((e) => e.id === id)?.id ?? id).join(", ") : "none"}
      </p>
      {ch.status !== "resolved" && <p className="mt-3 text-sm text-ink-muted">Reviewing submitted evidence against the contested factor…</p>}
      {ch.resolution && (
        <div className="mt-3 rounded-md bg-canvas p-3 text-sm">
          <strong className="font-medium">Review outcome.</strong> {ch.resolution}
        </div>
      )}
      <p className="mt-3 text-xs text-ink-faint">Outcome recorded for human review. The reviewer, not the system, makes any employment decision.</p>
    </Card>
  );
}
