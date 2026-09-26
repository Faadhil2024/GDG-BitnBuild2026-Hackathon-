"use client";

import { useViewer } from "@/lib/viewer";
import { Card, Pill } from "@/components/ui";
import { EmployeeTable, type EmployeeRow } from "./employee-table";
import { EmployerTable, type EmployerRow } from "./employer-table";

/** Same data, two points of view. The employer sees grades side by side and decides; the employee sees status. */
export function HomeView({ employeeRows, employerRows }: { employeeRows: EmployeeRow[]; employerRows: EmployerRow[] }) {
  const { viewer, isEmployer } = useViewer();
  return (
    <Card className="overflow-hidden">
      {isEmployer ? (
        <>
          <div className="flex items-center gap-2 border-b border-line bg-canvas px-5 py-2 text-xs text-ink-muted">
            <Pill tone="accent">Employer view</Pill>
            Reviewing as {viewer.name}. Agreeing verifies the AI grade; disagreeing opens an evidence-based review.
          </div>
          <EmployerTable rows={employerRows} reviewer={viewer.name} />
        </>
      ) : (
        <EmployeeTable rows={employeeRows} />
      )}
    </Card>
  );
}
