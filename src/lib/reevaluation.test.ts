import { test } from "node:test";
import assert from "node:assert/strict";
import { ACCOUNTS } from "@/data/accounts";
import { getEmployee } from "@/data/employees";
import { roleProfiles } from "@/lib/assessment/roles";
import { fullAssessment } from "./appraisal-review";
import { REEVAL_SAMPLES, reevaluate } from "./reevaluation";
import { TECHNICAL_ROLES } from "@/data/self-appraisal";

const demo = ACCOUNTS.flatMap((a) => (a.employeeId ? [getEmployee(a.employeeId)!] : []));

test("every demo employee has at least one expected-but-unproven area, so a backed note can be tested live", () => {
  for (const e of demo) {
    const a = fullAssessment(e)!;
    const missing = a.factors.filter((f) => f.score < 2 && roleProfiles[e.role].expected.includes(f.category));
    assert.ok(missing.length > 0, `${e.name} has no unproven expected area`);
  }
});

test("backed sample note is admitted and moves the grade; unbacked note is refused", () => {
  for (const e of demo) {
    const a = fullAssessment(e)!;
    const missing = a.factors.filter((f) => f.score < 2 && roleProfiles[e.role].expected.includes(f.category)).map((f) => f.category);
    const s = TECHNICAL_ROLES.includes(e.role) ? REEVAL_SAMPLES.technical : REEVAL_SAMPLES.nonTechnical;
    const ok = reevaluate(e, missing, s.correct.text)!;
    assert.equal(ok.ok, true, `${e.name}: backed note refused: ${ok.reason}`);
    assert.notEqual(ok.to, ok.from, `${e.name}: grade did not move (${ok.from})`);
    const bad = reevaluate(e, missing, s.incorrect.text)!;
    assert.equal(bad.ok, false);
    assert.equal(bad.to, bad.from);
  }
});

test("already-evidenced areas cannot be re-found", () => {
  const e = demo[0];
  const a = fullAssessment(e)!;
  const evidenced = a.factors.find((f) => f.score >= 2)!.category;
  const r = reevaluate(e, [evidenced], REEVAL_SAMPLES.nonTechnical.correct.text)!;
  assert.equal(r.ok, false);
});
