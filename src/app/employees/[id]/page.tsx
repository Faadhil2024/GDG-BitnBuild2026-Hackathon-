import { notFound } from "next/navigation";
import { employees, getEmployee } from "@/data/employees";
import { AssessmentProvider } from "@/store/assessment-store";
import { EmployeeWorkspace } from "@/components/employee/workspace";
import { LiveAnnouncer } from "@/components/live-announcer";

export function generateStaticParams() {
  return employees.map((e) => ({ id: e.id }));
}

export default async function EmployeePage({ params }: PageProps<"/employees/[id]">) {
  const { id } = await params;
  const employee = getEmployee(id);
  if (!employee) notFound();
  return (
    <AssessmentProvider employee={employee}>
      <EmployeeWorkspace />
      <LiveAnnouncer />
    </AssessmentProvider>
  );
}
