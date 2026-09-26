import { COMPANY, employees } from "@/data/employees";
import { evidence, evidenceFor } from "@/data/evidence";
import { sources, SYSTEM_LABELS, SYSTEM_ORDER } from "@/data/sources";
import { assess } from "@/lib/assessment/engine";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import { Card } from "@/components/ui";
import type { ContributionCategory, Level } from "@/lib/types";

const LEVELS: Level[] = ["High", "Moderate", "Low"];
const TONE: Record<Level, string> = { High: "bg-high", Moderate: "bg-moderate", Low: "bg-low" };

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
      <div className={`bar-fill h-full rounded-full ${className}`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

export default function StatsPage() {
  const assessed = employees
    .map((e) => ({ e, ev: evidenceFor(e.id).filter((x) => x.discoveredIn === "initial") }))
    .filter((x) => x.ev.length)
    .map((x) => ({ ...x, a: assess(x.e, x.ev) }));

  const byLevel = LEVELS.map((l) => ({ l, n: assessed.filter((x) => x.a.level === l).length }));
  const unassessed = employees.length - assessed.length;

  const depts = Array.from(new Set(employees.map((e) => e.department))).sort();
  const byDept = depts.map((d) => {
    const rows = assessed.filter((x) => x.e.department === d);
    return {
      d,
      total: employees.filter((e) => e.department === d).length,
      levels: LEVELS.map((l) => rows.filter((x) => x.a.level === l).length),
      flagged: rows.filter((x) => x.a.missingAreas.length > 0 || x.a.confidence === "low").length,
    };
  });

  const missingCounts = new Map<ContributionCategory, number>();
  assessed.forEach((x) => x.a.missingAreas.forEach((c) => missingCounts.set(c, (missingCounts.get(c) ?? 0) + 1)));
  const missing = Array.from(missingCounts.entries()).sort((a, b) => b[1] - a[1]);

  const bySystem = SYSTEM_ORDER.map((s) => ({
    s,
    n: evidence.filter((e) => sources.find((src) => src.id === e.sourceId)?.system === s).length,
  })).filter((x) => x.n > 0);
  const maxSys = Math.max(...bySystem.map((x) => x.n));

  const direction = (["strengthens", "weakens", "neutral", "irrelevant"] as const).map((d) => ({ d, n: evidence.filter((e) => e.direction === d).length }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-faint">{COMPANY.name}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold tracking-tight">Cycle statistics</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Everything below is computed from indexed evidence. No figure is entered by hand.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Assessment distribution</h2>
          <p className="mt-0.5 text-xs text-ink-faint">{assessed.length} assessed · {unassessed} awaiting evidence</p>
          <ul className="mt-5 space-y-3">
            {byLevel.map(({ l, n }) => (
              <li key={l} className="grid grid-cols-[110px_1fr_48px] items-center gap-4 text-sm">
                <span className="font-medium">{l}</span>
                <Bar value={n} max={assessed.length} className={TONE[l]} />
                <span className="text-right font-mono tabular-nums text-ink-muted">{n}</span>
              </li>
            ))}
            <li className="grid grid-cols-[110px_1fr_48px] items-center gap-4 text-sm">
              <span className="text-ink-faint">Unassessed</span>
              <Bar value={unassessed} max={employees.length} className="bg-line" />
              <span className="text-right font-mono tabular-nums text-ink-muted">{unassessed}</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Where the picture is incomplete</h2>
          <p className="mt-0.5 text-xs text-ink-faint">Expected evidence areas with nothing indexed, across assessed employees</p>
          <ul className="mt-5 space-y-3">
            {missing.map(([c, n]) => (
              <li key={c} className="grid grid-cols-[180px_1fr_48px] items-center gap-4 text-sm">
                <span>{CATEGORY_LABELS[c]}</span>
                <Bar value={n} max={missing[0]?.[1] ?? 1} className="bg-moderate" />
                <span className="text-right font-mono tabular-nums text-ink-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">By department</h2>
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Assessment counts by department</caption>
            <thead className="text-left text-xs text-ink-faint">
              <tr>
                <th scope="col" className="py-2 font-medium">Department</th>
                <th scope="col" className="py-2 font-medium">People</th>
                <th scope="col" className="py-2 font-medium">Mix</th>
                <th scope="col" className="py-2 text-right font-medium">High</th>
                <th scope="col" className="py-2 text-right font-medium">Moderate</th>
                <th scope="col" className="py-2 text-right font-medium">Low</th>
                <th scope="col" className="py-2 text-right font-medium">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {byDept.map((r) => {
                const tot = r.levels.reduce((a, b) => a + b, 0);
                return (
                  <tr key={r.d} className="border-t border-line">
                    <th scope="row" className="py-2.5 text-left font-medium">{r.d}</th>
                    <td className="py-2.5 tabular-nums text-ink-muted">{r.total}</td>
                    <td className="py-2.5 pr-6">
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                        {LEVELS.map((l, i) => (
                          <div key={l} className={TONE[l]} style={{ width: `${tot ? (r.levels[i] / r.total) * 100 : 0}%` }} />
                        ))}
                      </div>
                    </td>
                    {r.levels.map((n, i) => (
                      <td key={i} className="py-2.5 text-right font-mono tabular-nums">{n}</td>
                    ))}
                    <td className="py-2.5 text-right font-mono tabular-nums text-moderate">{r.flagged}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Evidence by source</h2>
          <ul className="mt-5 space-y-3">
            {bySystem.map(({ s, n }) => (
              <li key={s} className="grid grid-cols-[150px_1fr_48px] items-center gap-4 text-sm">
                <span>{SYSTEM_LABELS[s]}</span>
                <Bar value={n} max={maxSys} className="bg-accent" />
                <span className="text-right font-mono tabular-nums text-ink-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">What the evidence says</h2>
          <p className="mt-0.5 text-xs text-ink-faint">Not every item helps — the system also records neutral and role-irrelevant material</p>
          <ul className="mt-5 space-y-3">
            {direction.map(({ d, n }) => (
              <li key={d} className="grid grid-cols-[150px_1fr_48px] items-center gap-4 text-sm">
                <span className="capitalize">{d === "irrelevant" ? "Not applicable" : d}</span>
                <Bar value={n} max={evidence.length} className={d === "strengthens" ? "bg-high" : d === "weakens" ? "bg-low" : d === "neutral" ? "bg-ink-faint" : "bg-na"} />
                <span className="text-right font-mono tabular-nums text-ink-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
