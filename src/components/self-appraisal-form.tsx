"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_EMPLOYEE_ID, employees } from "@/data/employees";
import { NON_TECHNICAL_SEEDS, pickSeed, QUESTIONS, TECHNICAL_ROLES, TECHNICAL_SEEDS } from "@/data/self-appraisal";
import { GRADES, type Grade } from "@/lib/types";
import { GRADE_MEANING } from "@/lib/assessment/engine";
import { saveSelfAppraisal, useSelfAppraisals } from "@/lib/self-appraisal";
import { Button, Card, GradeBadge, Pill, formatDate } from "@/components/ui";

const blank = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""]));

export function SelfAppraisalForm() {
  const [employeeId, setEmployeeId] = useState(DEMO_EMPLOYEE_ID);
  const employee = employees.find((e) => e.id === employeeId)!;
  const [answers, setAnswers] = useState<Record<string, string>>(blank);
  const [grade, setGrade] = useState<Grade | "">("");
  const [seedLabel, setSeedLabel] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState<{ name: string; at: string; grade: Grade } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const submitted = useSelfAppraisals()[employeeId];
  const technical = TECHNICAL_ROLES.includes(employee.role);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (confirm && !d.open) d.showModal();
    if (!confirm && d.open) d.close();
  }, [confirm]);

  const filled = useMemo(() => QUESTIONS.filter((q) => answers[q.id].trim()).length, [answers]);
  const complete = filled === QUESTIONS.length && grade !== "";

  const preseed = () => {
    const seed = pickSeed(employee.role, seedLabel ?? undefined);
    setAnswers({ ...seed.answers });
    setGrade(seed.grade);
    setSeedLabel(seed.label);
    setStatus(`Form pre-filled from the "${seed.label}" ${technical ? "technical" : "non-technical"} dataset. Review and edit before submitting.`);
  };

  const reset = () => {
    setAnswers(blank());
    setGrade("");
    setSeedLabel(null);
    setStatus("Form cleared.");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    const at = new Date().toISOString();
    saveSelfAppraisal({ employeeId, answers, grade: grade as Grade, submittedAt: at });
    setConfirm({ name: employee.name, at, grade: grade as Grade });
    setStatus(`Self-appraisal for ${employee.name} submitted.`);
  };

  const field = "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed focus:border-accent";

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label htmlFor="sa-emp" className="text-sm font-medium">
              Employee
            </label>
            <select id="sa-emp" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); reset(); }} className={`${field} mt-1 max-w-md`}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.title}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-ink-faint">
              {employee.department} · reports to {employee.manager} ·{" "}
              <Pill tone={technical ? "accent" : "neutral"}>{technical ? "Technical role" : "Non-technical role"}</Pill>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={preseed}>
              Pre-seed from sample dataset
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        </div>
        {submitted && (
          <p className="mt-4 rounded-md border border-high/30 bg-high-soft px-3 py-2 text-sm">
            A self-appraisal for {employee.name} was submitted on {formatDate(submitted.submittedAt)} with self-grade {submitted.grade}. Submitting again replaces it.
          </p>
        )}
        <p role="status" aria-live="polite" className={`mt-3 text-xs ${status ? "text-ink-muted" : "sr-only"}`}>
          {status}
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          Pre-seed picks one of {technical ? TECHNICAL_SEEDS.length : NON_TECHNICAL_SEEDS.length} sample answers for a {technical ? "technical" : "non-technical"} role. Nothing is submitted until you press Submit.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Appraisal questions</h2>
          <span className="text-xs text-ink-faint" aria-live="polite">
            {filled} of {QUESTIONS.length} answered
          </span>
        </div>
        <ol className="mt-5 space-y-6">
          {QUESTIONS.map((q, i) => (
            <li key={q.id}>
              <label htmlFor={`sa-${q.id}`} className="block text-sm font-medium">
                <span className="mr-2 font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                {q.label}
              </label>
              {q.hint && <p className="mt-0.5 text-xs text-ink-faint">{q.hint}</p>}
              <textarea
                id={`sa-${q.id}`}
                value={answers[q.id]}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                rows={q.rows ?? 3}
                required
                className={`${field} prose-measure mt-2`}
              />
            </li>
          ))}
          <li className="border-t border-line pt-6">
            <label htmlFor="sa-grade" className="block text-sm font-medium">
              <span className="mr-2 font-mono text-xs text-ink-faint">{String(QUESTIONS.length + 1).padStart(2, "0")}</span>
              What grade would you give yourself for this cycle?
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <select id="sa-grade" value={grade} onChange={(e) => setGrade(e.target.value as Grade)} required className={`${field} w-56`}>
                <option value="">Select a grade</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g} — {GRADE_MEANING[g]}
                  </option>
                ))}
              </select>
              {grade && <GradeBadge grade={grade} size="md" label="self-grade" />}
            </div>
          </li>
        </ol>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-ink-faint">Your self-appraisal is recorded alongside the evidence-based assessment. It does not replace it.</p>
        <Button type="submit" variant="primary" disabled={!complete}>
          Submit self-appraisal
        </Button>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setConfirm(null)}
        aria-labelledby="sa-confirm-title"
        className="animate-drawer m-auto w-[min(440px,92vw)] rounded-lg border border-line bg-surface p-6 text-ink shadow-2xl"
      >
        {confirm && (
          <div className="text-center">
            <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-high text-white">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h2 id="sa-confirm-title" className="mt-4 text-lg font-semibold">
              Self-appraisal submitted
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {confirm.name} · {formatDate(confirm.at)} · self-grade {confirm.grade}
            </p>
            <p className="mt-3 text-xs text-ink-faint">The status on the Employees page now shows this submission.</p>
            <Button type="button" variant="primary" className="mt-5" onClick={() => setConfirm(null)} autoFocus>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </form>
  );
}
