import { COMPANY, employees } from "@/data/employees";
import { evidence } from "@/data/evidence";
import { sources, SYSTEM_LABELS, SYSTEM_ORDER } from "@/data/sources";
import { Card, Pill } from "@/components/ui";
import { EmployerTable, type EmployerRow } from "@/components/employer-table";
import { CycleSummary } from "@/components/cycle-summary";
import { fullAssessment } from "@/lib/appraisal-review";

/** Employer home. Employees are routed to their own profile by the shell. */
export default function OverviewPage() {
  const rows: EmployerRow[] = employees.map((e) => ({ id: e.id, name: e.name, title: e.title, department: e.department, aiGrade: fullAssessment(e)?.grade }));

  const groups = SYSTEM_ORDER.map((system) => {
    const ofSystem = sources.filter((s) => s.system === system);
    return {
      system,
      label: SYSTEM_LABELS[system],
      count: evidence.filter((e) => ofSystem.some((s) => s.id === e.sourceId)).length,
      sources: Array.from(new Set(ofSystem.map((s) => s.name))),
    };
  }).filter((g) => g.count > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px] text-ink-faint">{COMPANY.name}</p>
          <h1 className="mt-0.5 text-[30px] font-semibold tracking-tight">{COMPANY.cycle}</h1>
          <p className="mt-1.5 text-[15px] text-ink-muted">{COMPANY.cycleWindow} · every grade is evidence-based and needs your decision before it is final.</p>
        </div>
        <Pill tone="accent">Simulated data</Pill>
      </div>

      <CycleSummary total={employees.length} evidenceCount={evidence.length} groups={groups} />

      <Card className="overflow-hidden">
        <EmployerTable rows={rows} />
      </Card>
    </div>
  );
}
