import Link from "next/link";
import { COMPANY, employees } from "@/data/employees";
import { evidence, evidenceFor } from "@/data/evidence";
import { sources, SYSTEM_LABELS } from "@/data/sources";
import { assess } from "@/lib/assessment/engine";
import { Card, LevelBadge, Pill } from "@/components/ui";

export default function OverviewPage() {
  const rows = employees.map((e) => {
    const ev = evidenceFor(e.id).filter((x) => x.discoveredIn === "initial");
    return { e, count: ev.length, a: ev.length ? assess(e, ev) : undefined };
  });
  const assessed = rows.filter((r) => r.a);
  const flagged = assessed.filter((r) => r.a!.confidence === "low" || r.a!.missingAreas.length > 0);
  const systems = Array.from(new Set(sources.map((s) => s.system)));

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

      <dl className="grid grid-cols-2 divide-x divide-line rounded-lg border border-line bg-surface md:grid-cols-4">
        {[
          { k: "Employees in cycle", v: employees.length, s: `${assessed.length} assessed so far` },
          { k: "Flagged for review", v: flagged.length, s: "Expected evidence areas missing" },
          { k: "Evidence items indexed", v: evidence.length, s: `${systems.length} connected sources` },
          { k: "Open challenges", v: 0, s: "Employees can contest any factor" },
        ].map((x) => (
          <div key={x.k} className="px-5 py-4">
            <dt className="text-xs text-ink-faint">{x.k}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{x.v}</dd>
            <dd className="mt-0.5 text-xs text-ink-muted">{x.s}</dd>
          </div>
        ))}
      </dl>

      <Card className="overflow-hidden">
        <div className="flex items-baseline justify-between px-5 py-4">
          <h2 className="text-base font-semibold">Employees</h2>
          <span className="text-xs text-ink-faint">Assessment is computed from indexed evidence only</span>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Employees in the appraisal cycle with current assessment status</caption>
          <thead className="border-y border-line bg-canvas text-left text-xs text-ink-faint">
            <tr>
              <th scope="col" className="px-5 py-2.5 font-medium">Employee</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Title</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Department</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Assessment</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Evidence</th>
              <th scope="col" className="px-5 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, a, count }) => (
              <tr key={e.id} className="border-t border-line first:border-t-0 hover:bg-canvas/60">
                <th scope="row" className="px-5 py-3.5 text-left font-medium">
                  <Link href={`/employees/${e.id}`} className="pressable inline-block text-accent underline-offset-2 hover:underline">
                    {e.name}
                  </Link>
                </th>
                <td className="px-5 py-3.5 text-ink-muted">{e.title}</td>
                <td className="px-5 py-3.5 text-ink-muted">{e.department}</td>
                <td className="px-5 py-3.5">{a ? <LevelBadge level={a.level} size="sm" /> : <span className="text-ink-faint">Not yet assessed</span>}</td>
                <td className="px-5 py-3.5 tabular-nums text-ink-muted">{count ? `${count} items` : "—"}</td>
                <td className="px-5 py-3.5">
                  {!a ? (
                    <Pill tone="neutral">Awaiting evidence</Pill>
                  ) : a.missingAreas.length > 0 || a.confidence === "low" ? (
                    <Pill tone="moderate">Requires review · {a.confidence} confidence</Pill>
                  ) : (
                    <Pill tone="high">Assessed · {a.confidence} confidence</Pill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
        <span className="mr-1">Connected sources (simulated):</span>
        {systems.map((s) => (
          <span key={s} className="rounded border border-line bg-surface px-2 py-0.5 text-ink-muted">
            {SYSTEM_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
