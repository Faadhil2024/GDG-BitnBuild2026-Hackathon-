"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COMPANY, DEMO_EMPLOYEE_ID, employees } from "@/data/employees";
import { useSession } from "@/lib/session";
import { NON_TECHNICAL_SEEDS, pickSeed, QUESTIONS, TECHNICAL_ROLES, TECHNICAL_SEEDS } from "@/data/self-appraisal";
import { GRADES, type Grade } from "@/lib/types";
import { GRADE_MEANING } from "@/lib/assessment/engine";
import { MAX_SUBMISSIONS, attemptsUsed, saveSelfAppraisal, useSelfAppraisals } from "@/lib/self-appraisal";
import { reviewSelfAppraisal } from "@/lib/appraisal-review";
import { Avatar, Button, GradeBadge, formatDate } from "@/components/ui";
import { Check, LockSimple } from "@phosphor-icons/react";

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
  const [confirm, setConfirm] = useState<{ at: string; attempt: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const submitted = useSelfAppraisals()[employeeId];
  const used = attemptsUsed(submitted);
  const locked = used >= MAX_SUBMISSIONS;
  const technical = TECHNICAL_ROLES.includes(employee.role);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (confirm && !d.open) d.showModal();
    if (!confirm && d.open) d.close();
  }, [confirm]);

  const filled = useMemo(() => QUESTIONS.filter((q) => answers[q.id].trim()).length, [answers]);
  const total = QUESTIONS.length + 1;
  const done = filled + (grade ? 1 : 0);
  const complete = done === total;

  const preseed = () => {
    const seed = pickSeed(employee.role, seedLabel ?? undefined);
    setAnswers({ ...seed.answers });
    setGrade(seed.grade);
    setSeedLabel(seed.label);
    setStatus(`Form pre-filled from the "${seed.label}" ${technical ? "technical" : "non-technical"} sample. Review and edit before submitting.`);
  };

  const reset = () => {
    setAnswers(blank());
    setGrade("");
    setSeedLabel(null);
    setStatus("Form cleared.");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete || locked) return;
    const at = new Date().toISOString();
    // The AI review runs immediately on submission, from indexed evidence only.
    const ai = reviewSelfAppraisal(employee, answers, grade as Grade);
    if (!saveSelfAppraisal({ employeeId, answers, grade: grade as Grade, submittedAt: at, ai }, submitted)) {
      setStatus(`You have already used all ${MAX_SUBMISSIONS} submissions for this cycle.`);
      return;
    }
    setConfirm({ at, attempt: used + 1 });
    setStatus("Self-appraisal submitted.");
  };

  const field = "w-full rounded-md border border-line bg-surface px-4 py-3 text-[16px] leading-relaxed focus:border-accent disabled:opacity-60";

  return (
    <form onSubmit={submit} className="mx-auto max-w-[960px] space-y-4">
      {/* Form header, the way a company form opens: brand band, title, respondent */}
      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="h-2.5 bg-accent" aria-hidden="true" />
        <div className="p-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">{COMPANY.name} · {COMPANY.cycle}</p>
          <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight">Self-appraisal</h1>
          <p className="mt-2 max-w-[70ch] text-[16px] leading-relaxed text-ink-muted">
            Your account of the cycle, in your own words. Answer all {QUESTIONS.length} questions and give yourself a grade. It goes to {employee.manager} and is read alongside the evidence-based assessment.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <div className="flex items-center gap-3">
              <Avatar employee={employee} size={44} />
              <div>
                <p className="text-[16px] font-semibold leading-tight">{employee.name}</p>
                <p className="text-[14px] text-ink-muted">{employee.title} · {employee.department} · {technical ? "Technical" : "Non-technical"} role</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-ink-faint">Submissions this cycle</p>
              <p className="text-[18px] font-semibold tabular-nums">
                {used} <span className="text-ink-faint">of {MAX_SUBMISSIONS}</span>
              </p>
            </div>
          </div>

          {submitted && (
            <p className={`mt-5 rounded-md border px-4 py-3 text-[15px] ${locked ? "border-moderate/30 bg-moderate-soft" : "border-high/30 bg-high-soft"}`}>
              {locked ? (
                <>You submitted on {formatDate(submitted.submittedAt)} and have used both submissions. The form is now closed for this cycle.</>
              ) : (
                <>You submitted on {formatDate(submitted.submittedAt)}. You may submit once more; it will replace this one and reopen the review.</>
              )}
            </p>
          )}
          <p role="status" aria-live="polite" className={`mt-3 text-[14px] ${status ? "text-ink-muted" : "sr-only"}`}>{status}</p>
        </div>
      </section>

      {locked ? (
        <section className="rounded-lg border border-line bg-surface p-10 text-center">
          <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-canvas text-ink-muted"><LockSimple size={22} /></span>
          <h2 className="mt-4 text-[20px] font-semibold">No submissions remaining</h2>
          <p className="mx-auto mt-2 max-w-[52ch] text-[15px] text-ink-muted">Your latest answers are on record and with {employee.manager}. You can read them on your profile.</p>
          <Link href={`/employees/${employeeId}`} className="mt-5 inline-block"><Button variant="secondary">Back to my profile</Button></Link>
        </section>
      ) : (
        <>
          {/* Progress + helpers */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface px-6 py-4">
            <div className="min-w-[240px] flex-1">
              <div className="flex items-baseline justify-between text-[14px]">
                <span className="font-medium">Progress</span>
                <span className="tabular-nums text-ink-muted" aria-live="polite">{done} of {total} answered</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
                <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${(done / total) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={preseed} title={`Fills one of ${technical ? TECHNICAL_SEEDS.length : NON_TECHNICAL_SEEDS.length} sample answer sets. Nothing is submitted until you press Submit.`}>
                Fill with sample answers
              </Button>
              <Button type="button" variant="ghost" onClick={reset}>Clear</Button>
            </div>
          </section>

          {/* One question per card, full width */}
          <ol className="space-y-4">
            {QUESTIONS.map((q, i) => (
              <li key={q.id} className="rounded-lg border border-line bg-surface p-7">
                <label htmlFor={`sa-${q.id}`} className="block">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Question {i + 1} of {total}</span>
                  <span className="mt-1.5 block text-[18px] font-semibold leading-snug">{q.label} <span aria-hidden="true" className="text-low">*</span></span>
                </label>
                {q.hint && <p className="mt-1.5 text-[15px] text-ink-muted">{q.hint}</p>}
                <textarea
                  id={`sa-${q.id}`}
                  value={answers[q.id]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  rows={q.rows ?? 4}
                  required
                  placeholder="Type your answer"
                  className={`${field} mt-4`}
                />
              </li>
            ))}
            <li className="rounded-lg border border-line bg-surface p-7">
              <label htmlFor="sa-grade" className="block">
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Question {total} of {total}</span>
                <span className="mt-1.5 block text-[18px] font-semibold leading-snug">What grade would you give yourself for this cycle? <span aria-hidden="true" className="text-low">*</span></span>
              </label>
              <p className="mt-1.5 text-[15px] text-ink-muted">Your manager will see this beside the evidence-based grade.</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <select id="sa-grade" value={grade} onChange={(e) => setGrade(e.target.value as Grade)} required className={`${field} max-w-[420px]`}>
                  <option value="">Select a grade</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g} — {GRADE_MEANING[g]}</option>
                  ))}
                </select>
                {grade && <GradeBadge grade={grade} size="md" label="self-grade" />}
              </div>
            </li>
          </ol>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface px-6 py-5">
            <p className="max-w-[60ch] text-[14px] text-ink-muted">
              Submitting uses {used + 1} of your {MAX_SUBMISSIONS} submissions. Your self-appraisal is recorded alongside the evidence-based assessment; it does not replace it.
            </p>
            <Button type="submit" variant="primary" disabled={!complete} className="px-6 py-3 text-[16px]">
              Submit self-appraisal
            </Button>
          </div>
        </>
      )}

      <dialog
        ref={dialog}
        onClose={() => {
          setConfirm(null);
          router.push(`/employees/${employeeId}`);
        }}
        aria-labelledby="sa-confirm-title"
        className="animate-drawer m-auto w-[min(420px,92vw)] rounded-lg border border-line bg-surface p-8 text-ink shadow-2xl"
      >
        {confirm && (
          <div className="text-center">
            <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-high text-white"><Check size={24} weight="bold" /></span>
            <h2 id="sa-confirm-title" className="mt-4 text-[24px] font-semibold">Completed</h2>
            <p className="mt-1 text-[16px] text-ink-muted">Submitted {formatDate(confirm.at)} · submission {confirm.attempt} of {MAX_SUBMISSIONS}.</p>
            <p className="mt-3 text-[14px] text-ink-faint">It is now with {employee.manager}. You will be taken back to your profile.</p>
            <Button type="button" variant="primary" className="mt-5" onClick={() => setConfirm(null)} autoFocus>Done</Button>
          </div>
        )}
      </dialog>
    </form>
  );
}
