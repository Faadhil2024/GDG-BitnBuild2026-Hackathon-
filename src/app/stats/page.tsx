import { employees } from "@/data/employees";
import { fullAssessment } from "@/lib/appraisal-review";
import { StatsView, type StatRow } from "@/components/stats-view";

export default function StatsPage() {
  const rows: StatRow[] = employees.map((e) => {
    const a = fullAssessment(e);
    return { id: e.id, name: e.name, department: e.department, grade: a?.grade, score: a?.score };
  });
  return <StatsView rows={rows} />;
}
