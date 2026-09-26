"use client";

import { useSession } from "@/lib/session";
import { useDecisions, useSelfAppraisals } from "@/lib/self-appraisal";
import { PROTOCOLS, PROTOCOLS_MET, protocolLabel } from "@/data/rubric";
import { Card, GradeBadge, gradeTone } from "@/components/ui";
import { GRADES, type Grade } from "@/lib/types";
import { GRADE_MEANING } from "@/lib/assessment/engine";

export interface StatRow {
  id: string;
  name: string;
  department: string;
  grade?: Grade;
  score?: number;
}

function GradeBars({ counts, highlight, unit }: { counts: { g: Grade; n: number }[]; highlight?: Grade; unit: string }) {
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <figure>
      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        <div className="flex flex-col justify-between py-1 text-right font-mono text-[12px] tabular-nums text-ink-faint" style={{ height: 240 }} aria-hidden="true">
          <span>{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span>0</span>
        </div>
        <div className="grid grid-cols-7 items-end gap-5 border-b border-l border-line pl-3" style={{ height: 240 }} role="img" aria-label={`Bar chart, ${unit} per grade: ${counts.map((c) => `${c.g} ${c.n}`).join(", ")}.`}>
          {counts.map(({ g, n }) => (
            <div key={g} className="flex h-full flex-col items-center justify-end gap-2">
              <span className="font-mono text-[14px] font-medium tabular-nums">{n}</span>
              <div
                className={`bar-fill w-full max-w-20 rounded-t-md ${gradeTone(g).split(" ")[0]} ${highlight && highlight !== g ? "opacity-35" : ""} ${highlight === g ? "ring-2 ring-ink ring-offset-2" : ""}`}
                style={{ height: `${Math.max((n / max) * 100, n ? 3 : 0)}%` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4">
        <span className="w-[2ch]" aria-hidden="true" />
        <div className="grid grid-cols-7 gap-5 pl-3">
          {counts.map(({ g }) => (
            <div key={g} className="flex flex-col items-center gap-1.5 text-center">
              <GradeBadge grade={g} size="sm" label={null} />
              <span className="text-[12px] leading-tight text-ink-faint">{protocolLabel(g)}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-[13px] text-ink-faint">Each bar counts {unit}. Grades read as how many of the six assessment protocols were met.</figcaption>
    </figure>
  );
}

function Rubric() {
  return (
    <Card className="p-8">
      <h2 className="text-[20px] font-semibold tracking-tight">The six protocols</h2>
      <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">Checked against indexed records only. This is what is looked at — not a score against it.</p>
      <ol className="mt-6 grid gap-x-12 gap-y-6 md:grid-cols-2">
        {PROTOCOLS.map((p, i) => (
          <li key={p.id} className="grid grid-cols-[36px_1fr] gap-4">
            <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-md bg-canvas font-mono text-[14px] font-semibold text-ink-muted">{i + 1}</span>
            <div>
              <p className="text-[17px] font-semibold leading-snug">{p.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{p.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function StatsView({ rows }: { rows: StatRow[] }) {
  const session = useSession();
  const appraisals = useSelfAppraisals();
  const decisions = useDecisions();
  if (session.status !== "in") return null;
  const a = session.account;

  if (a.role === "employer") {
    const graded = rows.filter((r) => appraisals[r.id] && r.grade);
    const counts = GRADES.map((g) => ({ g, n: graded.filter((r) => r.grade === g).length }));
    const completed = Object.keys(decisions).length;
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[30px] font-semibold tracking-tight">Grade distribution</h1>
          <p className="mt-1.5 max-w-[70ch] text-[15px] text-ink-muted">
            {graded.length} of {rows.length} employees have submitted and been AI-graded; {completed} of those are completed. Employees who have not submitted have no AI grade and are not counted.
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
          {[
            { k: "A band", v: graded.filter((r) => r.grade!.startsWith("A")).length, s: "5–6 protocols met" },
            { k: "B band", v: graded.filter((r) => r.grade!.startsWith("B")).length, s: "3–4 protocols met" },
            { k: "C band", v: graded.filter((r) => r.grade!.startsWith("C")).length, s: "1–2 protocols met" },
            { k: "D", v: graded.filter((r) => r.grade === "D").length, s: "No protocol met on record" },
          ].map((x) => (
            <div key={x.k} className="px-6 py-5">
              <dt className="text-[13px] text-ink-faint">{x.k}</dt>
              <dd className="mt-1 text-[32px] font-semibold leading-none tabular-nums">{x.v}</dd>
              <dd className="mt-2 text-[13px] text-ink-muted">{x.s}</dd>
            </div>
          ))}
        </dl>
        <Card className="p-8">
          <h2 className="text-[17px] font-semibold">Employees by AI grade</h2>
          <div className="mt-6"><GradeBars counts={counts} unit="employees" /></div>
        </Card>
        <Rubric />
      </div>
    );
  }

  // Employee: no colleague data at all. The chart is the grade ladder — what each grade requires.
  const myDecision = a.employeeId ? decisions[a.employeeId] : undefined;
  const mine = myDecision?.finalGrade;
  const submitted = !!appraisals[a.employeeId ?? ""];
  const status = mine ? `Decided by ${myDecision!.decidedBy} · ${protocolLabel(mine)} met` : submitted ? "Self-appraisal submitted · with your manager" : "Submit your self-appraisal to start the review";

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">Your appraisal</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-none tracking-tight">How grades are earned</h1>
          <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-ink-muted">
            Every grade is the number of assessment protocols met on record. Nothing else moves it — not title, not tenure, not how visible you are.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-4">
          <div className="text-right">
            <p className="text-[13px] text-ink-faint">Your grade</p>
            <p className="mt-0.5 text-[15px] font-medium">{mine ? GRADE_MEANING[mine] : "Pending"}</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">{status}</p>
          </div>
          {mine ? <GradeBadge grade={mine} size="lg" label={null} /> : <span aria-hidden="true" className="grid h-14 min-w-14 place-items-center rounded-md border-2 border-dashed border-line text-[22px] font-semibold text-ink-faint">?</span>}
        </div>
      </header>

      <Card className="p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[20px] font-semibold tracking-tight">What each grade requires</h2>
          <p className="text-[14px] text-ink-muted">Bars show protocols that must be met, out of {PROTOCOLS.length}.{mine ? " Yours is outlined." : ""}</p>
        </div>
        <GradeLadder mine={mine} />
      </Card>

      <Rubric />
    </div>
  );
}

const SHORT: Record<Grade, string> = { "A+": "Exceptional", A: "Strong", "B+": "Solid", B: "Good", "C+": "Partial", C: "Limited", D: "Unproven" };

/** The grade ladder: for each grade, how many of the six protocols must be met. No people are counted here. */
function GradeLadder({ mine }: { mine?: Grade }) {
  const N = PROTOCOLS.length;
  return (
    <figure className="mt-8">
      <div className="grid grid-cols-[auto_1fr] gap-x-5">
        <div className="flex flex-col justify-between text-right font-mono text-[13px] tabular-nums text-ink-faint" style={{ height: 260 }} aria-hidden="true">
          {Array.from({ length: N + 1 }, (_, i) => <span key={i} className="leading-none">{N - i}</span>)}
        </div>
        <div className="relative" style={{ height: 260 }}>
          {/* Gridlines, one per protocol */}
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: N + 1 }, (_, i) => <span key={i} className="block h-px w-full bg-line" />)}
          </div>
          <div className="relative grid h-full grid-cols-7 items-end gap-6 px-2" role="img" aria-label={`Grade ladder. Protocols required out of ${N}: ${GRADES.map((g) => `${g} requires ${PROTOCOLS_MET[g]}`).join(", ")}.`}>
            {GRADES.map((g) => {
              const n = PROTOCOLS_MET[g];
              const isMine = mine === g;
              return (
                <div key={g} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className={`font-mono text-[15px] font-semibold tabular-nums ${isMine ? "text-ink" : "text-ink-muted"}`}>{n}<span className="text-ink-faint">/{N}</span></span>
                  <div
                    aria-hidden="true"
                    className={`bar-fill w-full max-w-[72px] rounded-t-md ${gradeTone(g).split(" ")[0]} ${mine && !isMine ? "opacity-40" : ""} ${isMine ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
                    style={{ height: `calc(${(n / N) * 100}% + ${n ? 0 : 3}px)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-5">
        <span className="w-[1ch]" aria-hidden="true" />
        <div className="grid grid-cols-7 gap-6 px-2">
          {GRADES.map((g) => (
            <div key={g} className="flex flex-col items-center gap-2 text-center">
              <GradeBadge grade={g} size="sm" label={null} />
              <span className={`text-[13px] leading-snug ${mine === g ? "font-semibold text-ink" : "text-ink-muted"}`}>{SHORT[g]}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-5 text-[14px] text-ink-muted">
        A+ needs all {N} protocols met on record; each step down is one protocol fewer. The protocols themselves are listed below.
      </figcaption>
    </figure>
  );
}
