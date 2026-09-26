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

  // Employee: no colleague data. Their own grade and report, then the grade ladder.
  const me = rows.find((r) => r.id === a.employeeId);
  const myDecision = a.employeeId ? decisions[a.employeeId] : undefined;
  const sa = appraisals[a.employeeId ?? ""];
  const mine = myDecision?.finalGrade;
  const shown = mine ?? sa?.ai?.grade;
  const status = mine
    ? `Verified by ${myDecision!.decidedBy} · ${protocolLabel(mine)} met`
    : sa?.ai
      ? `Scoring via AI · ${protocolLabel(sa.ai.grade)} met · awaiting manager review`
      : sa
        ? "Submitted · no evidence indexed yet"
        : "Submit your self-appraisal to start the review";

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <header>
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">Your appraisal</p>
        <h1 className="mt-2 text-[36px] font-semibold leading-none tracking-tight">How grades are earned</h1>
        <p className="mt-3 max-w-[62ch] text-[17px] leading-relaxed text-ink-muted">
          Every grade is the number of assessment protocols met on record. Nothing else moves it — not title, not tenure, not how visible you are.
        </p>
      </header>

      <TeamTrend department={me?.department ?? "Your team"} />

      <Card className="flex flex-wrap items-center gap-6 p-6">
        {shown ? <GradeBadge grade={shown} size="lg" label={null} /> : <span aria-hidden="true" className="grid h-14 min-w-14 place-items-center rounded-md border-2 border-dashed border-line text-[22px] font-semibold text-ink-faint">?</span>}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-ink-faint">Your grade</p>
          <p className="mt-0.5 text-[17px] font-semibold">{shown ? GRADE_MEANING[shown] : "Pending"}</p>
          <p className="mt-0.5 text-[14px] text-ink-muted">{status}</p>
        </div>
      </Card>

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

/* Team trend across the last five cycles. Deterministic synthetic history per department:
   average protocols met (0–6) for the team and the company. No individual is plotted. */
const CYCLES = ["FY24 H1", "FY24 H2", "FY25 H1", "FY25 H2", "FY26 H1"];
function series(seed: string, base: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < CYCLES.length; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    v = Math.max(1.5, Math.min(5.5, v + ((h % 1000) / 1000 - 0.45) * 1.2));
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

function TeamTrend({ department }: { department: string }) {
  const team = series(department, 3.4);
  const company = series("Halcyon", 3.6);
  const W = 720, H = 220, PX = 44, PY = 18, N = 6;
  const x = (i: number) => PX + (i * (W - PX * 2)) / (CYCLES.length - 1);
  const y = (v: number) => PY + (H - PY * 2) * (1 - v / N);
  const path = (s: number[]) => s.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const last = team[team.length - 1], prev = team[team.length - 2];
  const delta = Math.round((last - prev) * 10) / 10;
  return (
    <Card className="p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">{department}: team trend</h2>
          <p className="mt-1 text-[14px] text-ink-muted">Average protocols met per person, by cycle. Team against company. No individual grades are shown.</p>
        </div>
        <p className="text-[14px]">
          <span className="font-semibold tabular-nums">{last.toFixed(1)}</span> <span className="text-ink-faint">/ {N} this cycle</span>
          <span className={`ml-2 font-medium tabular-nums ${delta >= 0 ? "text-high" : "text-low"}`}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} vs last</span>
        </p>
      </div>
      <figure className="mt-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Line chart. ${department} average protocols met by cycle: ${CYCLES.map((c, i) => `${c} ${team[i]}`).join(", ")}. Company: ${CYCLES.map((c, i) => `${c} ${company[i]}`).join(", ")}.`}>
          {Array.from({ length: N + 1 }, (_, v) => (
            <g key={v}>
              <line x1={PX} x2={W - PX} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
              <text x={PX - 10} y={y(v) + 4} textAnchor="end" className="fill-ink-faint font-mono text-[11px]">{v}</text>
            </g>
          ))}
          {CYCLES.map((c, i) => (
            <text key={c} x={x(i)} y={H - 2} textAnchor="middle" className="fill-ink-muted text-[12px]">{c}</text>
          ))}
          <path d={path(company)} fill="none" className="stroke-ink-faint" strokeWidth={2} strokeDasharray="5 5" strokeLinejoin="round" />
          <path d={path(team)} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {team.map((v, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(v)} r={4} className="fill-accent stroke-surface" strokeWidth={2} />
              <text x={x(i)} y={y(v) - 10} textAnchor="middle" className="fill-ink font-mono text-[11px] font-semibold">{v.toFixed(1)}</text>
            </g>
          ))}
        </svg>
        <figcaption className="mt-3 flex flex-wrap items-center gap-6 text-[13px] text-ink-muted">
          <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="inline-block h-[3px] w-6 rounded bg-accent" /> {department} · verified average</span>
          <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="inline-block h-0 w-6 border-t-2 border-dashed border-ink-faint" /> Sector benchmark</span>
          <span className="ml-auto text-ink-faint">Y axis: protocols met out of {N} · X axis: appraisal cycle</span>
        </figcaption>
      </figure>
    </Card>
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
