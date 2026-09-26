import { test } from "node:test";
import assert from "node:assert/strict";
import { employees } from "@/data/employees";
import { evaluateDisagreement, fullAssessment, reviewSelfAppraisal } from "./appraisal-review";
import { NON_TECHNICAL_SEEDS } from "@/data/self-appraisal";

const sarah = employees.find((e) => e.id === "emp-sarah-lim")!;

test("AI review of Sarah's self-appraisal grades from full evidence and compares claims", () => {
  const seed = NON_TECHNICAL_SEEDS[0];
  const r = reviewSelfAppraisal(sarah, seed.answers, seed.grade)!;
  assert.equal(r.grade, "B", "all indexed evidence for Sarah resolves to B");
  assert.equal(r.selfGrade, "B+");
  assert.equal(r.gap, 1);
  assert.ok(r.supported.includes("revenue_impact"));
  assert.ok(r.concerns.includes("delivery_reliability"));
  assert.match(r.summary, /1 step above/);
});

test("disagreement gate: too far, no citation, then accepted", () => {
  const ai = fullAssessment(sarah)!.grade; // B
  const far = evaluateDisagreement(sarah, ai, { proposedGrade: "A+", reason: "EV-101 EV-102 show excellent revenue outcomes across the half." });
  assert.equal(far.accepted, false);
  assert.match(far.reason, /steps from the evidence grade/);

  const uncited = evaluateDisagreement(sarah, ai, { proposedGrade: "B+", reason: "She clearly did a lot more than the system credits her for this cycle." });
  assert.equal(uncited.accepted, false);
  assert.match(uncited.reason, /No evidence cited/);

  const ok = evaluateDisagreement(sarah, ai, { proposedGrade: "B+", reason: "EV-201 shows the Northwind slip was an approved agency delay, so delivery reliability is over-penalised." });
  assert.equal(ok.accepted, true);
  assert.deepEqual(ok.citedEvidenceIds, ["EV-201"]);
});

test("seeded mid-cycle state: demo accounts untouched, sensible completion mix", async () => {
  const { SEEDED_APPRAISALS, SEEDED_DECISIONS } = await import("@/data/seeded-appraisals");
  const { FRESH_EMPLOYEE_IDS } = await import("@/data/accounts");
  for (const id of FRESH_EMPLOYEE_IDS) {
    assert.equal(SEEDED_APPRAISALS[id], undefined, `${id} must start without a submission`);
    assert.equal(SEEDED_DECISIONS[id], undefined);
  }
  const submitted = Object.keys(SEEDED_APPRAISALS).length;
  const decided = Object.keys(SEEDED_DECISIONS).length;
  assert.ok(submitted >= 30 && submitted <= 65, `submitted: ${submitted}`);
  assert.ok(decided >= 10 && decided < submitted, `decided: ${decided}`);
  for (const d of Object.values(SEEDED_DECISIONS)) assert.ok(SEEDED_APPRAISALS[d.employeeId], "every decision has a submission");
});

test("disagreement gate rejects evidence IDs belonging to another employee", () => {
  const ai = fullAssessment(sarah)!.grade;
  const r = evaluateDisagreement(sarah, ai, { proposedGrade: "B+", reason: "EV-P01 shows strong closed-won revenue that should lift the grade here." });
  assert.equal(r.accepted, false);
});
