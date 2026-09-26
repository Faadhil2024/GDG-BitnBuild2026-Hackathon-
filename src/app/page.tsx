import { COMPANY, employees } from "@/data/employees";
import { evidence, evidenceFor } from "@/data/evidence";
import { sources, SYSTEM_LABELS, SYSTEM_ORDER } from "@/data/sources";
import { assess } from "@/lib/assessment/engine";
import { Card, Pill } from "@/components/ui";
import { EmployeeTable, type EmployeeRow } from "@/components/employee-table";
import { SourcePeek } from "@/components/source-peek";

export default function OverviewPage() {
  const rows: EmployeeRow[] = employees.map((e) => {
    const ev = evidenceFor(e.id).filter((x) => x.discoveredIn === "initial");
    const a = ev.length ? assess(e, ev) : undefined;
    return { id: e.id, name: e.name, title: e.title, department: e.department, level: a?.level, confidence: a?.confidence, missing: a?.missingAreas.length ?? 0, count: ev.length };
  });
  const assessed = rows.filter((r) => r.level);
  const flagged = assessed.filter((r) => r.confidence === "low" || r.missing > 0);

  const groups = SYSTEM_ORDER.map((system) => {
    const ofSystem = sources.filter((s) => s.system === system);
    return {
      system,
      label: SYSTEM_LABELS[system],
      count: evidence.filter((e) => ofSystem.some((s) => s.id === e.sourceId)).length,
      sources: Array.from(new Set(ofSystem.map((s) => s.name))),
    };
  }).filter((g) => g.count > 0);

  const stats = [
    { k: "Employees in cycle", v: employees.length, s: `${assessed.length} assessed · ${rows.length - assessed.length} awaiting evidence` },
    { k: "Flagged for review", v: flagged.length, s: "Expected evidence areas missing or low confidence" },
    { k: "Evidence items indexed", v: evidence.length, s: `${groups.length} connected sources`, peek: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-faint">{COMPANY.name}</p>
          <h1 className="mt-0.5 text-[28px] font-semibold tracking-tight">{COMPANY.cycle}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">{COMPANY.cycleWindow} · every assessment is evidence-based and requires human review before any decision.</p>
        </div>
        <Pill tone="accent">Simulated data</Pill>
      </div>

      <dl className="grid grid-cols-1 divide-y divide-line rounded-lg border border-line bg-surface md:grid-cols-3 md:divide-x md:divide-y-0">
        {stats.map((x) => (
          <div key={x.k} className="relative px-6 py-5">
            {x.peek && (
              <div className="absolute right-4 top-4">
                <SourcePeek groups={groups} />
              </div>
            )}
            <dt className="text-xs text-ink-faint">{x.k}</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums">{x.v}</dd>
            <dd className="mt-1 text-xs text-ink-muted">{x.s}</dd>
          </div>
        ))}
      </dl>

      <Card className="overflow-hidden">
        <EmployeeTable rows={rows} />
      </Card>
    </div>
  );
}
