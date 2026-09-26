"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise, Check, EnvelopeSimple, Warning, X } from "@phosphor-icons/react";
import type { ContributionCategory, Employee } from "@/lib/types";
import { CATEGORY_LABELS, roleProfiles } from "@/lib/assessment/roles";
import { fullAssessment } from "@/lib/appraisal-review";
import { MANAGER_EMAIL, REEVAL_SAMPLES, reevaluate, type ReevaluationResult } from "@/lib/reevaluation";
import { recordReevaluation, type SelfAppraisal } from "@/lib/self-appraisal";
import { TECHNICAL_ROLES } from "@/data/self-appraisal";
import { Button, GradeBadge, Pill } from "@/components/ui";

const STEPS = ["Rechecking records", "Rechecking Slack", "Analysing with your new data"];
const STEP_MS = 800;

/**
 * Employee-side re-evaluation. The employee names what the assessment missed
 * and where the record lives; the engine checks each area in turn, visibly,
 * and either admits the record or says why not. Two failures escalate to the
 * manager — the system never pretends a weak note found something.
 */
export function ReevaluationPanel({ employee, sa }: { employee: Employee; sa: SelfAppraisal }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<ContributionCategory[]>([]);
  const [text, setText] = useState("");
  const [running, setRunning] = useState<{ i: number; step: number } | null>(null);
  const [result, setResult] = useState<ReevaluationResult | null>(null);
  const [error, setError] = useState("");
  const escalate = useRef<HTMLDialogElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const failures = sa.reevalFailures ?? 0;

  const base = fullAssessment(employee);
  const expected = roleProfiles[employee.role].expected;
  const candidates = (base?.factors ?? []).filter((f) => expected.includes(f.category) && f.weight > 0);
  const samples = TECHNICAL_ROLES.includes(employee.role) ? REEVAL_SAMPLES.technical : REEVAL_SAMPLES.nonTechnical;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggle = (c: ContributionCategory) => setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const fill = (kind: "correct" | "incorrect") => {
    setText(samples[kind].text);
    setPicked(kind === "correct" ? candidates.filter((f) => f.score < 2).map((f) => f.category).slice(0, 2) : candidates.filter((f) => f.score >= 2).map((f) => f.category).slice(0, 1).concat(candidates.filter((f) => f.score < 2).map((f) => f.category).slice(0, 1)));
    setResult(null);
    setError("");
  };

  const run = () => {
    if (!picked.length) return setError("Choose at least one area the assessment missed.");
    if (text.trim().length < 40) return setError("Explain what was missed and where the record lives (at least a sentence).");
    setError("");
    setResult(null);
    const total = picked.length * STEPS.length;
    setRunning({ i: 0, step: 0 });
    for (let k = 1; k <= total; k++) {
      timers.current.push(setTimeout(() => setRunning({ i: Math.floor(k / STEPS.length), step: k % STEPS.length }), STEP_MS * k));
    }
    timers.current.push(
      setTimeout(() => {
        const r = reevaluate(employee, picked, text) ?? null;
        setRunning(null);
        setResult(r);
        if (!r || !r.ok) {
          recordReevaluation(sa, null);
          if (failures + 1 >= 2) escalate.current?.showModal();
        } else {
          recordReevaluation(sa, { from: r.from, to: r.to, categories: picked, statement: text, admittedIds: r.admitted.map((e) => e.id), checks: r.checks.map(({ category, ok, reason }) => ({ category, ok, reason })), at: new Date().toISOString() });
        }
      }, STEP_MS * (total + 1)),
    );
  };

  if (sa.reevaluation) {
    const r = sa.reevaluation;
    return (
      <section className="rounded-lg border border-line bg-surface p-6" aria-labelledby="reeval-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="reeval-title" className="text-[17px] font-semibold">Re-evaluation</h2>
          <Pill tone={r.to === r.from ? "neutral" : "high"}>{r.to === r.from ? "Records admitted · grade unchanged" : `AI grade changed ${r.from} → ${r.to}`}</Pill>
        </div>
        <p className="mt-2 text-[15px] text-ink-muted">{r.to === r.from ? "The record is on file but did not move the grade." : "Your manager has been notified and will decide on the revised grade."}</p>
        <ul className="mt-4 space-y-2">
          {r.checks.map((c) => (
            <li key={c.category} className="flex items-start gap-2 text-[14px]">
              {c.ok ? <Check size={16} weight="bold" className="mt-0.5 shrink-0 text-high" /> : <X size={16} weight="bold" className="mt-0.5 shrink-0 text-low" />}
              <span><span className="font-medium">{CATEGORY_LABELS[c.category]}</span> · {c.reason}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-ink-faint">One re-evaluation per cycle. Your note is on record beside the appraisal.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-6" aria-labelledby="reeval-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="reeval-title" className="text-[17px] font-semibold">Think the assessment missed something?</h2>
          <p className="mt-1 max-w-[62ch] text-[15px] text-ink-muted">Tell the engine what it did not see and where the record lives. It rechecks each area and shows you what it found.</p>
        </div>
        {!open && (
          <Button variant="primary" onClick={() => setOpen(true)} disabled={failures >= 2}>
            <ArrowsClockwise size={16} /> Ask for re-evaluation
          </Button>
        )}
      </div>
      {failures >= 2 && <p className="mt-3 rounded-md border border-moderate/30 bg-moderate-soft px-3 py-2 text-[14px]">Two attempts did not locate records. Please contact {employee.manager} at <a className="underline" href={`mailto:${MANAGER_EMAIL(employee.manager)}`}>{MANAGER_EMAIL(employee.manager)}</a>.</p>}

      {open && (
        <div className="animate-rise mt-6 space-y-5">
          <fieldset disabled={!!running}>
            <legend className="text-[14px] font-medium">Which areas were missed?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {candidates.map((f) => {
                const on = picked.includes(f.category);
                return (
                  <button key={f.category} type="button" aria-pressed={on} onClick={() => toggle(f.category)} className={`pressable rounded-full border px-3.5 py-1.5 text-[14px] ${on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-muted hover:text-ink"}`}>
                    {CATEGORY_LABELS[f.category]}
                    <span className="ml-1.5 text-[12px] opacity-70">{f.score >= 2 ? "evidenced" : f.status === "concern" ? "concern" : f.evidenceIds.length ? "thin" : "none"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <label htmlFor="reeval-text" className="text-[14px] font-medium">What did the assessment miss, and where is the record?</label>
              <span className="flex gap-3 text-[13px]">
                <button type="button" className="text-accent hover:underline" onClick={() => fill("correct")}>Sample: {samples.correct.label}</button>
                <button type="button" className="text-ink-faint hover:underline" onClick={() => fill("incorrect")}>Sample: {samples.incorrect.label}</button>
              </span>
            </div>
            <textarea id="reeval-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} disabled={!!running} placeholder="Name the system (Slack, project tracker, GitHub, CRM, HR records, documents) and a date or identifier." className="mt-2 w-full rounded-md border border-line bg-surface px-4 py-3 text-[15px] leading-relaxed focus:border-accent" />
            <p className="mt-1.5 text-[13px] text-ink-faint">Rules: the area must be expected for your role and not already fully evidenced; the note must name a connected system and a date or identifier.</p>
          </div>

          {error && <p role="alert" className="rounded-md border border-low/30 bg-low-soft px-3 py-2 text-[14px]">{error}</p>}

          {running && (
            <ol className="space-y-2 rounded-md border border-line bg-canvas/60 p-4" aria-live="polite">
              {picked.map((c, i) => {
                const done = i < running.i;
                const active = i === running.i;
                return (
                  <li key={c} className="flex items-center gap-3 text-[14px]">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${done ? "bg-high text-white" : active ? "border-2 border-accent" : "border border-line"}`}>{done && <Check size={12} weight="bold" />}</span>
                    <span className={`w-48 font-medium ${done || active ? "" : "text-ink-faint"}`}>{CATEGORY_LABELS[c]}</span>
                    {active && (
                      <span className="flex items-center gap-2 text-ink-muted">
                        {STEPS[running.step]}
                        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
                      </span>
                    )}
                    {done && <span className="text-ink-faint">Checked</span>}
                  </li>
                );
              })}
            </ol>
          )}

          {result && !running && (
            <div className={`rounded-md border p-4 ${result.ok ? (result.to !== result.from ? "border-high/30 bg-high-soft" : "border-line bg-canvas/60") : "border-low/30 bg-low-soft"}`} role="status">
              <div className="flex flex-wrap items-center gap-3">
                {result.ok ? <Check size={18} weight="bold" className="text-high" /> : <Warning size={18} className="text-low" />}
                <p className="text-[15px] font-medium">
                  {result.ok ? (result.to !== result.from ? `AI grade changed. Manager notified.` : "Records admitted; grade unchanged.") : failures + 1 >= 2 ? "Records not found again." : "Records not found. Try again with a system and a date, or inform your manager."}
                </p>
                {result.ok && result.to !== result.from && <span className="ml-auto flex items-center gap-2"><GradeBadge grade={result.from} size="sm" label={null} /><span aria-hidden="true">→</span><GradeBadge grade={result.to} size="sm" label={null} /></span>}
              </div>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                {result.checks.map((c) => (
                  <li key={c.category} className="flex items-start gap-2">
                    {c.ok ? <Check size={14} weight="bold" className="mt-1 shrink-0 text-high" /> : <X size={14} weight="bold" className="mt-1 shrink-0 text-low" />}
                    <span><span className="font-medium">{CATEGORY_LABELS[c.category]}</span> · {c.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!result?.ok && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={!!running}>Cancel</Button>
              <Button variant="primary" onClick={run} disabled={!!running || failures >= 2}>
                <ArrowsClockwise size={16} className={running ? "animate-spin" : ""} /> {running ? "Rechecking" : result ? "Try again" : "Recheck the records"}
              </Button>
            </div>
          )}
        </div>
      )}

      <dialog ref={escalate} aria-labelledby="esc-title" className="animate-drawer m-auto w-[min(440px,92vw)] rounded-lg border border-line bg-surface p-8 text-ink shadow-2xl">
        <div className="text-center">
          <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-moderate-soft text-moderate"><EnvelopeSimple size={24} /></span>
          <h2 id="esc-title" className="mt-4 text-[22px] font-semibold">Please inform your manager</h2>
          <p className="mt-2 text-[15px] text-ink-muted">Two attempts did not locate any record. This now needs a person. Contact {employee.manager}:</p>
          <a href={`mailto:${MANAGER_EMAIL(employee.manager)}`} className="mt-3 inline-block font-mono text-[14px] text-accent underline">{MANAGER_EMAIL(employee.manager)}</a>
          <div className="mt-5"><Button variant="primary" onClick={() => escalate.current?.close()} autoFocus>Close</Button></div>
        </div>
      </dialog>
    </section>
  );
}
