"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_EMPLOYEE_ID, employees } from "@/data/employees";
import { useSession } from "@/lib/session";
import { NON_TECHNICAL_SEEDS, pickSeed, QUESTIONS, TECHNICAL_ROLES, TECHNICAL_SEEDS } from "@/data/self-appraisal";
import { GRADES, type Grade } from "@/lib/types";
import { GRADE_MEANING } from "@/lib/assessment/engine";
import { saveSelfAppraisal, useSelfAppraisals } from "@/lib/self-appraisal";
import { reviewSelfAppraisal } from "@/lib/appraisal-review";
import { Button, Card, GradeBadge, Pill, formatDate } from "@/components/ui";
import { Check } from "@phosphor-icons/react";

const blank = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, ""]));

export function SelfAppraisalForm() {
  const session = useSession();
  const router = useRouter();
  // Bound to the signed-in employee. There is no picking someone else.
  const employeeId = (session.status === "in" && session.account.employeeId) || DEMO_EMPLOYEE_ID;
  const employee = employees.find((e) => e.id === employeeId)!;
  const [answers, setAnswers] = useState<Record<string, string>>(blank);
  const [grade, setGrade] = useState<Grade | "">("");
  const [seedLabel, setSeedLabel] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [confirm, setConfirm] = useState<{ at: string } | null>(null);
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
    // The AI review runs immediately on submission, from indexed evidence only.
    const ai = reviewSelfAppraisal(employee, answers, grade as Grade);
    saveSelfAppraisal({ employeeId, answers, grade: grade as Grade, submittedAt: at, ai });
    setConfirm({ at });
    setStatus("Self-appraisal submitted.");
  };

  const field = "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed focus:border-accent";

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[13px] text-ink-faint">Employee</p>
            <p className="mt-0.5 text-[17px] font-semibold">{employee.name}</p>
            <p className="mt-1 text-[15px] text-ink-muted">{employee.title}</p>
            <p className="mt-1.5 text-[13px] text-ink-faint">
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
            You submitted your self-appraisal on {formatDate(submitted.submittedAt)}. Submitting again replaces it.
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
        onClose={() => {
          setConfirm(null);
          router.push(`/employees/${employeeId}`);
        }}
        aria-labelledby="sa-confirm-title"
        className="animate-drawer m-auto w-[min(400px,92vw)] rounded-lg border border-line bg-surface p-8 text-ink shadow-2xl"
      >
        {confirm && (
          <div className="text-center">
            <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-high text-white">
              <Check size={24} weight="bold" />
            </span>
            <h2 id="sa-confirm-title" className="mt-4 text-[22px] font-semibold">Completed</h2>
            <p className="mt-1 text-[15px] text-ink-muted">Your self-appraisal was submitted on {formatDate(confirm.at)}.</p>
            <p className="mt-3 text-[13px] text-ink-faint">It is now with {employee.manager}. You will be taken back to your profile.</p>
            <Button type="button" variant="primary" className="mt-5" onClick={() => setConfirm(null)} autoFocus>
              Done
            </Button>
          </div>
        )}
      </dialog>
    </form>
  );
}
