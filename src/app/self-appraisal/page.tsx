import { COMPANY } from "@/data/employees";
import { SelfAppraisalForm } from "@/components/self-appraisal-form";

export default function SelfAppraisalPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-faint">{COMPANY.cycle}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold tracking-tight">Self-appraisal</h1>
        <p className="prose-measure mt-1.5 text-sm text-ink-muted">
          Your account of the cycle, in your own words. It sits alongside the evidence-based assessment so reviewers can see both.
        </p>
      </div>
      <SelfAppraisalForm />
    </div>
  );
}
