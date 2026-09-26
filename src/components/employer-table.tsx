"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowsDownUp, Check, SealCheck, Warning, X } from "@phosphor-icons/react";
import { employees } from "@/data/employees";
import { evidenceFor } from "@/data/evidence";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { CHALLENGEABLE } from "@/lib/assessment/challenge";
import { evaluateDisagreement, gradeIndex } from "@/lib/appraisal-review";
import { saveDecision, useDecisions, useSelfAppraisals, type Decision, type ReviewRound } from "@/lib/self-appraisal";
import { hasUnseenFor, useUpdates, useVisited } from "@/lib/updates";
import { GRADES, type ContributionCategory, type Grade } from "@/lib/types";
import { useSession } from "@/lib/session";
import { Avatar, Button, GradeBadge, Pill, formatDate } from "@/components/ui";

export interface EmployerRow {
  id: string;
  name: string;
  title: string;
  department: string;
  aiGrade?: Grade;
}

type SortKey = "name" | "department" | "self" | "ai" | "status";

const MAX_ROUNDS = 3;

type StatusFilter = "all" | "completed" | "awaiting" | "not_submitted";

export function EmployerTable({ rows }: { rows: EmployerRow[] }) {
  const session = useSession();
  const reviewer = session.status === "in" ? session.account.name : "Reviewer";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const appraisals = useSelfAppraisals();
  const decisions = useDecisions();
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "status", dir: 1 });
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [reviewing, setReviewing] = useState<EmployerRow | null>(null);
  const updates = useUpdates();
  const visited = useVisited();

  const depts = useMemo(() => Array.from(new Set(rows.map((r) => r.department))).sort(), [rows]);

  const statusRank = (r: EmployerRow) => (decisions[r.id] ? 2 : appraisals[r.id] ? 0 : 1); // awaiting decision first

  const sorted = useMemo(() => {
    const s = q.trim().toLowerCase();
    const statusOf = (r: EmployerRow): StatusFilter => (decisions[r.id] ? "completed" : appraisals[r.id] ? "awaiting" : "not_submitted");
    const list = rows.filter(
      (r) =>
        (!dept || dept === "All" || r.department === dept) &&
        (statusFilter === "all" || statusOf(r) === statusFilter) &&
        (!s || r.name.toLowerCase().includes(s) || r.title.toLowerCase().includes(s)),
    );
    const val = (r: EmployerRow) => {
      switch (sort.key) {
        case "name": return r.name;
        case "department": return r.department;
        case "self": return appraisals[r.id] ? gradeIndex(appraisals[r.id].grade) : 99;
        case "ai": return appraisals[r.id] && r.aiGrade ? gradeIndex(r.aiGrade) : 99;
        case "status": return statusRank(r);
      }
    };
    return list.sort((a, b) => {
      const x = val(a), y = val(b);
      const c = typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : (x as number) - (y as number);
      return (c || a.name.localeCompare(b.name)) * sort.dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, dept, statusFilter, sort, appraisals, decisions]);

  const toggle = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const agree = (r: EmployerRow) => {
    if (!r.aiGrade) return;
    saveDecision({ employeeId: r.id, outcome: "agreed", finalGrade: r.aiGrade, aiGrade: r.aiGrade, rounds: [], decidedAt: new Date().toISOString(), decidedBy: reviewer });
  };

  const th = (k: SortKey, label: string, className = "") => <SortTh k={k} sort={sort} onToggle={toggle} className={className}>{label}</SortTh>;

  const select = "rounded-md border border-line bg-surface px-2.5 py-1.5 text-[14px]";
  const awaiting = rows.filter((r) => appraisals[r.id] && !decisions[r.id]).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        <h2 className="text-[17px] font-semibold">Team review</h2>
        <span className="text-[13px] text-ink-faint" role="status" aria-live="polite">
          {sorted.length} of {rows.length} · {awaiting} awaiting your decision
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="er-q">Filter</label>
          <input id="er-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name or title" className={select + " w-56"} autoComplete="off" />
          <label className="sr-only" htmlFor="er-dept">Department</label>
          <select id="er-dept" value={dept} onChange={(e) => setDept(e.target.value)} className={select}>
            <option value="" disabled>Departments</option>
            <option value="All">All departments</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <label className="sr-only" htmlFor="er-status">Status</label>
          <select id="er-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} className={select}>
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="awaiting">Not reviewed</option>
            <option value="not_submitted">Not submitted</option>
          </select>
        </div>
      </div>

      <table className="w-full text-[15px]">
        <caption className="sr-only">Employees with self-grade, AI grade and review decision</caption>
        <thead className="border-y border-line bg-canvas text-left text-xs text-ink-faint">
          <tr>
            {th("name", "Name")}
            {th("department", "Department")}
            <th scope="col" className="px-5 py-2.5 font-medium">Title</th>
            {th("self", "Self grade")}
            {th("ai", "AI grade")}
            {th("status", "Decision", "w-[360px]")}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const sa = appraisals[r.id];
            const d = decisions[r.id];
            return (
              <tr key={r.id} className="row-link border-t border-line first:border-t-0">
                <th scope="row" className="whitespace-nowrap px-5 py-3 text-left font-medium">
                  <Link href={`/employees/${r.id}`} className="pressable inline-flex items-center gap-2.5 text-accent underline-offset-2 hover:underline" title="Open report">
                    <Avatar employee={r} size={30} />
                    {r.name}
                    {hasUnseenFor(r.id, visited, updates) && <span aria-label="New changes since you last opened this report" className="h-2 w-2 rounded-full bg-accent" />}
                  </Link>
                </th>
                <td className="whitespace-nowrap px-5 py-3 text-ink-muted">{r.department}</td>
                <td className="whitespace-nowrap px-5 py-3 text-ink-muted">{r.title}</td>
                <td className="px-5 py-3">{sa ? <GradeBadge grade={sa.grade} size="sm" label={null} /> : <span className="text-[13px] text-ink-faint">Not submitted</span>}</td>
                <td className="px-5 py-3">{sa && r.aiGrade ? <GradeBadge grade={r.aiGrade} size="sm" label={null} /> : <span className="text-[13px] text-ink-faint">{sa ? "No evidence indexed" : "Graded on submission"}</span>}</td>
                <td className="px-5 py-3">
                  {d ? (
                    <DecisionPill d={d} />
                  ) : !sa ? (
                    <span className="text-xs text-ink-faint">Awaiting self-appraisal</span>
                  ) : !r.aiGrade ? (
                    <span className="text-xs text-ink-faint">No evidence indexed to review against</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="primary" onClick={() => agree(r)} className="py-1.5">
                        <Check size={14} weight="bold" /> Agree
                      </Button>
                      <Button variant="secondary" onClick={() => setReviewing(r)} className="py-1.5">
                        <X size={14} weight="bold" /> Disagree
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-faint">No employees match these filters.</td>
            </tr>
          )}
        </tbody>
      </table>

      {reviewing && reviewing.aiGrade && (
        <DisagreeDialog row={reviewing} aiGrade={reviewing.aiGrade} reviewer={reviewer} onClose={() => setReviewing(null)} />
      )}
    </>
  );
}

function SortTh({ k, sort, onToggle, className = "", children }: { k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onToggle: (k: SortKey) => void; className?: string; children: React.ReactNode }) {
  const active = sort.key === k;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`px-5 py-2.5 font-medium ${className}`}>
      <button type="button" onClick={() => onToggle(k)} className="pressable inline-flex items-center gap-1 rounded hover:text-ink">
        {children}
        {active ? sort.dir === 1 ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" /> : <ArrowsDownUp size={12} className="opacity-50" />}
      </button>
    </th>
  );
}

function DecisionPill({ d }: { d: Decision }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <GradeBadge grade={d.finalGrade} size="sm" label={null} />
      {d.outcome === "agreed" && (
        <Pill tone="high"><SealCheck size={12} weight="fill" /> Verified · Completed</Pill>
      )}
      {d.outcome === "revised" && (
        <Pill tone="high"><SealCheck size={12} weight="fill" /> Verified · Revised {d.aiGrade} → {d.finalGrade}</Pill>
      )}
      {d.outcome === "override" && (
        <Pill tone="moderate"><Warning size={12} weight="fill" /> Human override · Final</Pill>
      )}
      <span className="text-xs text-ink-faint">{formatDate(d.decidedAt)}</span>
    </div>
  );
}

/**
 * Disagreement review. Three rounds against explicit rules; the reviewer sees
 * which rule failed each time. On the third failure the human override unlocks.
 */
function DisagreeDialog({ row, aiGrade, reviewer, onClose }: { row: EmployerRow; aiGrade: Grade; reviewer: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const employee = employees.find((e) => e.id === row.id)!;
  const appraisal = useSelfAppraisals()[row.id];
  const evidence = evidenceFor(row.id);
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [proposed, setProposed] = useState<Grade>(appraisal?.grade ?? aiGrade);
  const [factor, setFactor] = useState<ContributionCategory | "">("");
  const [reason, setReason] = useState("");
  const [overrideGrade, setOverrideGrade] = useState<Grade>(aiGrade);
  const [overrideNote, setOverrideNote] = useState("");
  const [done, setDone] = useState<Decision | null>(null);
  const firstField = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) {
      d.showModal();
      firstField.current?.focus();
    }
  }, []);

  const failed = rounds.filter((r) => !r.verdict.accepted).length;
  const overrideUnlocked = failed >= MAX_ROUNDS;
  const last = rounds[rounds.length - 1];

  const submitRound = (e: React.FormEvent) => {
    e.preventDefault();
    const verdict = evaluateDisagreement(employee, aiGrade, { proposedGrade: proposed, reason, factor: factor || undefined });
    const round: ReviewRound = { proposedGrade: proposed, reason, verdict, at: new Date().toISOString() };
    const next = [...rounds, round];
    setRounds(next);
    if (verdict.accepted) {
      const decision: Decision = { employeeId: row.id, outcome: "revised", finalGrade: proposed, aiGrade, rounds: next, decidedAt: round.at, decidedBy: reviewer };
      saveDecision(decision);
      setDone(decision);
    } else {
      setReason("");
    }
  };

  const submitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideNote.trim().length < 20) return;
    const decision: Decision = { employeeId: row.id, outcome: "override", finalGrade: overrideGrade, aiGrade, rounds, overrideNote, decidedAt: new Date().toISOString(), decidedBy: reviewer };
    saveDecision(decision);
    setDone(decision);
  };

  const field = "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm focus:border-accent";

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dg-title" className="animate-drawer m-auto w-[min(680px,94vw)] rounded-lg border border-line bg-surface p-0 text-ink shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 id="dg-title" className="text-lg font-semibold">Review {row.name}&apos;s grade</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Self-grade <strong>{appraisal?.grade}</strong> · AI grade <strong>{aiGrade}</strong> · {row.title}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} aria-label="Close review">
          <X size={16} />
        </Button>
      </div>

      {done ? (
        <div className="px-6 py-8 text-center">
          <span aria-hidden="true" className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-white ${done.outcome === "override" ? "bg-moderate" : "bg-high"}`}>
            {done.outcome === "override" ? <Warning size={24} weight="fill" /> : <Check size={24} weight="bold" />}
          </span>
          <h3 className="mt-4 text-base font-semibold">{done.outcome === "override" ? "Human override recorded as final" : "Review accepted — grade revised"}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {row.name}: {aiGrade} → <strong>{done.finalGrade}</strong> · {formatDate(done.decidedAt)} · by {done.decidedBy}
          </p>
          <Button variant="primary" className="mt-5" onClick={onClose} autoFocus>Done</Button>
        </div>
      ) : (
        <div className="grid gap-0 md:grid-cols-[1fr_260px]">
          <div className="px-6 py-5">
            {!overrideUnlocked ? (
              <form onSubmit={submitRound} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Round {rounds.length + 1} of {MAX_ROUNDS}</h3>
                  <ol className="flex gap-1" aria-label="Rounds">
                    {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
                      <li key={i} aria-hidden="true" className={`h-1.5 w-6 rounded-full ${i < rounds.length ? (rounds[i].verdict.accepted ? "bg-high" : "bg-low") : "bg-line"}`} />
                    ))}
                  </ol>
                </div>

                {last && !last.verdict.accepted && (
                  <div role="alert" className="rounded-md border border-low/30 bg-low-soft px-3 py-2 text-sm">
                    <strong className="font-medium">Not accepted.</strong> {last.verdict.reason}
                  </div>
                )}

                <div>
                  <label htmlFor="dg-grade" className="block text-sm font-medium">1. What grade do you believe is right?</label>
                  <select id="dg-grade" ref={firstField} value={proposed} onChange={(e) => setProposed(e.target.value as Grade)} className={`${field} mt-1`}>
                    {GRADES.map((g) => <option key={g} value={g}>{g}{g === aiGrade ? " — current AI grade" : ""}{g === appraisal?.grade ? " — employee's self-grade" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="dg-factor" className="block text-sm font-medium">2. Which factor did the AI misjudge? <span className="font-normal text-ink-faint">(optional)</span></label>
                  <select id="dg-factor" value={factor} onChange={(e) => setFactor(e.target.value as ContributionCategory)} className={`${field} mt-1`}>
                    <option value="">Not specific to one factor</option>
                    {CHALLENGEABLE.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="dg-reason" className="block text-sm font-medium">3. Why? Cite the evidence by ID.</label>
                  <textarea id="dg-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required placeholder={`e.g. ${evidence[0]?.id ?? "EV-…"} shows … which the grade under-weights because …`} className={`${field} mt-1`} />
                  <p className="mt-1 text-xs text-ink-faint">The review accepts a change of one grade step when it is tied to a specific indexed record. Evidence IDs are listed on the right.</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="primary">Submit for review</Button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitOverride} className="space-y-4">
                <div role="alert" className="rounded-md border border-moderate/30 bg-moderate-soft px-3 py-2 text-sm">
                  <strong className="font-medium">Human override unlocked.</strong> Three review rounds did not meet the evidence rules. You may set the final grade directly; your note is recorded as the decision of record, not the AI&apos;s.
                </div>
                <div>
                  <label htmlFor="ov-grade" className="block text-sm font-medium">Final grade</label>
                  <select id="ov-grade" value={overrideGrade} onChange={(e) => setOverrideGrade(e.target.value as Grade)} className={`${field} mt-1`}>
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ov-note" className="block text-sm font-medium">Justification <span className="font-normal text-ink-faint">(required, recorded)</span></label>
                  <textarea id="ov-note" value={overrideNote} onChange={(e) => setOverrideNote(e.target.value)} rows={4} required minLength={20} className={`${field} mt-1`} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button type="submit" variant="danger" disabled={overrideNote.trim().length < 20}>Claim as final submission</Button>
                </div>
              </form>
            )}
          </div>

          <aside className="border-t border-line bg-canvas px-5 py-5 md:border-l md:border-t-0" aria-label="Indexed evidence">
            <h3 className="text-xs font-semibold text-ink-muted">Indexed evidence for {row.name}</h3>
            <ul className="mt-2 max-h-[340px] space-y-2 overflow-y-auto pr-1 text-xs">
              {evidence.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-accent">{e.id}</span> <span className="text-ink-muted">{e.summary}</span>
                </li>
              ))}
            </ul>
            {rounds.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <h4 className="text-xs font-semibold text-ink-muted">Earlier rounds</h4>
                <ol className="mt-1 space-y-1 text-xs text-ink-faint">
                  {rounds.map((r, i) => <li key={i}>{i + 1}. Proposed {r.proposedGrade} — {r.verdict.accepted ? "accepted" : "not accepted"}</li>)}
                </ol>
              </div>
            )}
          </aside>
        </div>
      )}
    </dialog>
  );
}
