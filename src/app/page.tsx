import Link from "next/link";
import { COMPANY, DEMO_EMPLOYEE_ID, employees } from "@/data/employees";
import { evidence, evidenceFor } from "@/data/evidence";
import { sources, SYSTEM_LABELS } from "@/data/sources";
import { assess } from "@/lib/assessment/engine";
import { Card, LevelBadge, Pill, SectionTitle } from "@/components/ui";

export default function OverviewPage() {
  const sarah = employees.find((e) => e.id === DEMO_EMPLOYEE_ID)!;
  const initial = assess(sarah, evidenceFor(sarah.id).filter((e) => e.discoveredIn === "initial"));
  const systems = Array.from(new Set(sources.map((s) => s.system)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{COMPANY.name}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{COMPANY.cycle}</h1>
          <p className="mt-1 text-sm text-ink-muted">Window: {COMPANY.cycleWindow} · Assessments are evidence-based and require human review before any decision.</p>
        </div>
        <Pill tone="accent">Simulated data</Pill>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Employees in cycle</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{employees.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Assessments flagged for review</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">1</p>
          <p className="mt-1 text-xs text-ink-muted">Low confidence — expected evidence areas missing</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Evidence items indexed</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{evidence.length}</p>
          <p className="mt-1 text-xs text-ink-muted">across {systems.length} connected sources</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="px-4 pt-4">
          <SectionTitle hint="Only one case has evidence loaded in this prototype">Employees</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <caption className="sr-only">Employees in the appraisal cycle with current assessment status</caption>
          <thead className="bg-canvas text-left text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th scope="col" className="px-4 py-2 font-medium">Employee</th>
              <th scope="col" className="px-4 py-2 font-medium">Title</th>
              <th scope="col" className="px-4 py-2 font-medium">Department</th>
              <th scope="col" className="px-4 py-2 font-medium">Assessment</th>
              <th scope="col" className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => {
              const isDemo = e.id === DEMO_EMPLOYEE_ID;
              return (
                <tr key={e.id} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-medium">
                    <Link href={`/employees/${e.id}`} className="text-accent underline-offset-2 hover:underline">
                      {e.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-ink-muted">{e.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{e.department}</td>
                  <td className="px-4 py-3">{isDemo ? <LevelBadge level={initial.level} size="sm" /> : <span className="text-ink-faint">Not yet assessed</span>}</td>
                  <td className="px-4 py-3">
                    {isDemo ? <Pill tone="low">Requires review · {initial.confidence} confidence</Pill> : <Pill tone="neutral">Evidence collection pending</Pill>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <SectionTitle>Connected sources (simulated)</SectionTitle>
        <ul className="flex flex-wrap gap-2 text-sm">
          {systems.map((s) => (
            <li key={s} className="rounded-md border border-line bg-canvas px-2.5 py-1 text-ink-muted">
              {SYSTEM_LABELS[s]}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
