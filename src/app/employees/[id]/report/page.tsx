import { notFound } from "next/navigation";
import { employees, getEmployee } from "@/data/employees";
import { AssessmentProvider } from "@/store/assessment-store";
import { EmployeeReport } from "@/components/employee/employee-report";
import { LiveAnnouncer } from "@/components/live-announcer";

export function generateStaticParams() {
  return employees.map((e) => ({ id: e.id }));
}

/** The employee's own view of the report: same sheet the manager reads, plus the re-evaluation panel. */
export default async function EmployeeReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = getEmployee(id);
  if (!employee) notFound();
  return (
    <AssessmentProvider employee={employee}>
      <EmployeeReport />
      <LiveAnnouncer />
    </AssessmentProvider>
  );
}
