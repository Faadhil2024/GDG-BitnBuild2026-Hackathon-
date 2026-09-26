"use client";

import { SealCheck, Warning } from "@phosphor-icons/react";
import { useAssessment } from "@/store/assessment-store";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { reasonPerQuestion } from "@/lib/appraisal-review";
import { QUESTIONS } from "@/data/self-appraisal";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { GRADE_MEANING } from "@/lib/assessment/engine";
import { Avatar, Card, GradeBadge, Pill, gradeTone, formatDate } from "@/components/ui";
import type { Grade } from "@/lib/types";

function GradeBox({ grade, label }: { grade: Grade; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`grid h-24 w-24 place-items-center rounded-lg text-[40px] font-bold tracking-tight shadow-sm ${gradeTone(grade)}`}>
        <span className="sr-only">Grade </span>
        {grade}
      </span>
      <span className="text-[13px] text-ink-muted">{label}</span>
    </div>
  );
}

/**
 * Employer-only report. Reads like a completed form: who, the two grades,
 * each question with the employee's answer and the AI's evidence-bound
 * reasoning beside it, and finally why the grade landed where it did.
 */
export function ReportSheet() {
  const { employee, assessment } = useAssessment();
  const sa = useSelfAppraisals()[employee.id];
  const d = useDecisions()[employee.id];

  if (!sa) {
    return (
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <Avatar employee={employee} size={48} />
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight">{employee.name}</h2>
            <p className="text-[15px] text-ink-muted">{employee.title} · {employee.department} · reports to {employee.manager}</p>
          </div>
        </div>
        <div className="mt-6 rounded-md border border-dashed border-line bg-canvas/60 px-5 py-6">
          <p className="text-[17px] font-semibold">Appraisal not yet submitted</p>
          <p className="mt-1 max-w-[60ch] text-[15px] text-ink-muted">The report, AI grade and review controls appear here once {employee.name.split(" ")[0]} submits the self-appraisal.</p>
        </div>
      </Card>
    );
  }

  const ai = sa.ai;
  const reasons = reasonPerQuestion(employee, sa.answers);
  const factors = assessment.factors.filter((f) => f.weight > 0).sort((a, b) => b.weight - a.weight);
  const L = (cs: string[]) => cs.map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS]).join(", ");

  return (
    <Card className="overflow-hidden">
      {/* Form header */}
      <div className="grid gap-8 border-b border-line px-8 py-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <dl className="grid grid-cols-[120px_1fr] gap-x-6 gap-y-3 text-[15px]">
          <dt className="text-ink-faint">Name</dt>
          <dd className="font-semibold">{employee.name}</dd>
          <dt className="text-ink-faint">Title</dt>
          <dd>{employee.title}</dd>
          <dt className="text-ink-faint">Department</dt>
          <dd>{employee.department}</dd>
          <dt className="text-ink-faint">Reports to</dt>
          <dd>{employee.manager}</dd>
          <dt className="text-ink-faint">Submitted</dt>
          <dd>{formatDate(sa.submittedAt)}</dd>
          <dt className="text-ink-faint">Decision</dt>
          <dd>
            {d ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <GradeBadge grade={d.finalGrade} size="sm" label={null} />
                {d.outcome === "override" ? (
                  <Pill tone="moderate"><Warning size={12} weight="fill" /> Human override · Final</Pill>
                ) : (
                  <Pill tone="high"><SealCheck size={12} weight="fill" /> Verified · {d.outcome === "revised" ? `Revised ${d.aiGrade} → ${d.finalGrade}` : "Completed"}</Pill>
                )}
                <span className="text-[13px] text-ink-faint">{formatDate(d.decidedAt)} · {d.decidedBy}</span>
              </span>
            ) : (
              <Pill tone="neutral">Awaiting your decision</Pill>
            )}
          </dd>
        </dl>
        <div className="flex items-center justify-end gap-4 self-center">
          {ai ? <GradeBox grade={ai.grade} label="AI grade" /> : <p className="text-sm text-ink-faint">No evidence indexed</p>}
          <GradeBox grade={sa.grade} label="Self-appraisal" />
        </div>
      </div>

      {ai && (
        <div className="border-b border-line bg-canvas/60 px-8 py-4 text-[15px]">
          <span className="font-medium">{GRADE_MEANING[ai.grade]}.</span> <span className="text-ink-muted">{ai.summary}</span>
        </div>
      )}

      {/* Questions */}
      <ol className="divide-y divide-line">
        {QUESTIONS.map((q, i) => {
          const r = reasons.find((x) => x.questionId === q.id);
          return (
            <li key={q.id} className="grid gap-6 px-8 py-6 lg:grid-cols-2">
              <div>
                <p className="text-[13px] font-medium text-ink-faint">Question {i + 1}</p>
                <h3 className="mt-1 text-[15px] font-semibold">{q.label}</h3>
                <p className="prose-measure mt-3 text-[15px] leading-relaxed">{sa.answers[q.id] || <span className="text-ink-faint">No answer given.</span>}</p>
              </div>
              <div className="rounded-md border border-accent/20 bg-accent-soft/40 p-4">
                <p className="text-[13px] font-medium text-accent">AI reasoning</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{r?.note}</p>
                {r && (r.backed.length > 0 || r.contradicted.length > 0) && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {r.backed.map((b) => (
                      <li key={b.category}><Pill tone="high">+ {CATEGORY_LABELS[b.category]} · {b.evidenceIds.join(", ")}</Pill></li>
                    ))}
                    {r.contradicted.map((c) => (
                      <li key={c.category}><Pill tone="low">− {CATEGORY_LABELS[c.category]} · {c.evidenceIds.join(", ")}</Pill></li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
        <li className="grid gap-6 px-8 py-6 lg:grid-cols-2">
          <div>
            <p className="text-[13px] font-medium text-ink-faint">Question {QUESTIONS.length + 1}</p>
            <h3 className="mt-1 text-[15px] font-semibold">What grade would you give yourself for this cycle?</h3>
            <div className="mt-3"><GradeBadge grade={sa.grade} size="md" label={GRADE_MEANING[sa.grade]} /></div>
          </div>
          {ai && (
            <div className="rounded-md border border-accent/20 bg-accent-soft/40 p-4 text-[14px] leading-relaxed">
              <p className="text-[13px] font-medium text-accent">AI reasoning</p>
              <p className="mt-1.5">
                {ai.gap === 0
                  ? `The self-grade matches the evidence. No gap to resolve.`
                  : ai.gap > 0
                    ? `The employee rates themselves ${ai.gap} step${ai.gap > 1 ? "s" : ""} above the evidence. ${ai.unsupported.length ? `The gap comes from claims with nothing indexed behind them (${L(ai.unsupported).toLowerCase()})` : "The gap is not explained by unsupported claims"}${ai.concerns.length ? `, and from the concern on record in ${L(ai.concerns).toLowerCase()}` : ""}.`
                    : `The employee under-rates themselves by ${-ai.gap} step${ai.gap < -1 ? "s" : ""}. Evidence exists for ${L(ai.unclaimed).toLowerCase() || "areas"} they did not mention.`}
              </p>
            </div>
          )}
        </li>
      </ol>

      {/* Why this grade */}
      {ai && (
        <div className="border-t border-line bg-canvas/60 px-8 py-6">
          <h3 className="text-[15px] font-semibold">Why the AI gave {ai.grade}</h3>
          <p className="mt-1 text-[14px] text-ink-muted">
            Contribution index {ai.score} / 100 across the factors that matter for a {employee.title}. Each factor below is weighted by importance to the role; the grade is the weighted total.
          </p>
          <table className="mt-4 w-full text-[14px]">
            <caption className="sr-only">Factor contribution to the grade</caption>
            <thead className="text-left text-[13px] text-ink-faint">
              <tr>
                <th scope="col" className="py-2 font-medium">Factor</th>
                <th scope="col" className="py-2 font-medium">Importance</th>
                <th scope="col" className="py-2 font-medium">Finding</th>
                <th scope="col" className="py-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((f) => (
                <tr key={f.category} className="border-t border-line">
                  <th scope="row" className="py-2.5 text-left font-medium">{CATEGORY_LABELS[f.category]}</th>
                  <td className="py-2.5 text-ink-muted">{f.weight >= 0.9 ? "High" : f.weight >= 0.5 ? "Medium" : "Low"}</td>
                  <td className="py-2.5">
                    {f.status === "supported" && <Pill tone="high">Evidenced</Pill>}
                    {f.status === "concern" && <Pill tone="low">Concern</Pill>}
                    {f.status === "missing" && <Pill tone="moderate">No evidence</Pill>}
                    {f.status === "not_applicable" && <Pill tone="na">Not applicable</Pill>}
                  </td>
                  <td className="py-2.5 font-mono text-[12px] text-ink-muted">{f.evidenceIds.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px] text-ink-faint">Evidence engine · deterministic. The AI grade never comes from the self-appraisal text — only from indexed records. The text is compared against those records.</p>
        </div>
      )}

      {d && d.rounds.length > 0 && (
        <div className="border-t border-line px-8 py-6">
          <h3 className="text-[15px] font-semibold">Review rounds</h3>
          <ol className="mt-3 space-y-2 text-[14px]">
            {d.rounds.map((r, i) => (
              <li key={i} className="rounded-md border border-line p-3">
                <p className="text-[13px] text-ink-faint">Round {i + 1} · proposed {r.proposedGrade} · {r.verdict.accepted ? "accepted" : "not accepted"}</p>
                <p className="mt-1">{r.reason}</p>
                <p className="mt-1 text-ink-muted">{r.verdict.reason}</p>
              </li>
            ))}
          </ol>
          {d.overrideNote && (
            <p className="mt-3 rounded-md border border-moderate/30 bg-moderate-soft p-3 text-[14px]">
              <strong className="font-medium">Override note by {d.decidedBy}:</strong> {d.overrideNote}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
