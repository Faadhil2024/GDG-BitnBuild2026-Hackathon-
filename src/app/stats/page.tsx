import { COMPANY, employees } from "@/data/employees";
import { evidenceFor } from "@/data/evidence";
import { assess, GRADE_MEANING } from "@/lib/assessment/engine";
import { Card, GradeBadge, gradeTone } from "@/components/ui";
import { GRADES } from "@/lib/types";

export default function StatsPage() {
  const assessed = employees
    .map((e) => ({ e, ev: evidenceFor(e.id).filter((x) => x.discoveredIn === "initial") }))
    .filter((x) => x.ev.length)
    .map((x) => assess(x.e, x.ev));
  const unassessed = employees.length - assessed.length;
  const counts = GRADES.map((g) => ({ g, n: assessed.filter((a) => a.grade === g).length }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  const band = (p: string) => assessed.filter((a) => a.grade.startsWith(p)).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-faint">{COMPANY.cycle}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold tracking-tight">Grade distribution</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {assessed.length} of {employees.length} employees have an evidence-based grade · {unassessed} awaiting evidence. Computed from indexed evidence, not entered by hand.
        </p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
        {[
          { k: "A band", v: band("A"), s: "A+ and A" },
          { k: "B band", v: band("B"), s: "B+ and B" },
          { k: "C band", v: band("C"), s: "C+ and C" },
          { k: "D", v: band("D"), s: "Little or no evidence" },
        ].map((x) => (
          <div key={x.k} className="px-6 py-5">
            <dt className="text-xs text-ink-faint">{x.k}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{x.v}</dd>
            <dd className="mt-1 text-xs text-ink-muted">{x.s}</dd>
          </div>
        ))}
      </dl>

      <Card className="p-8">
        <h2 className="text-base font-semibold">Employees by grade</h2>
        <figure className="mt-8">
          <div className="grid grid-cols-7 items-end gap-6" style={{ height: 260 }} role="img" aria-label={`Bar chart of employees by grade: ${counts.map((c) => `${c.g} ${c.n}`).join(", ")}; ${unassessed} unassessed.`}>
            {counts.map(({ g, n }) => (
              <div key={g} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="font-mono text-sm tabular-nums text-ink-muted">{n}</span>
                <div className={`bar-fill w-full max-w-24 rounded-t-md ${gradeTone(g).split(" ")[0]}`} style={{ height: `${Math.max((n / max) * 100, n ? 3 : 0)}%` }} aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-6 border-t border-line pt-3">
            {counts.map(({ g }) => (
              <div key={g} className="flex flex-col items-center gap-1 text-center">
                <GradeBadge grade={g} size="sm" label={null} />
                <span className="hidden text-[11px] leading-tight text-ink-faint lg:block">{GRADE_MEANING[g]}</span>
              </div>
            ))}
          </div>
          <figcaption className="sr-only">Distribution of evidence-based grades across assessed employees.</figcaption>
        </figure>
        <table className="sr-only">
          <caption>Employees by grade</caption>
          <thead><tr><th scope="col">Grade</th><th scope="col">Employees</th></tr></thead>
          <tbody>
            {counts.map(({ g, n }) => (<tr key={g}><th scope="row">{g}</th><td>{n}</td></tr>))}
            <tr><th scope="row">Unassessed</th><td>{unassessed}</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
