import { test } from "node:test";
import assert from "node:assert/strict";
import { assess, diff } from "./engine";
import { reviewChallenge } from "./challenge";
import { employees } from "@/data/employees";
import { evidence } from "@/data/evidence";

const sarah = employees.find((e) => e.id === "emp-sarah-lim")!;
const initial = evidence.filter((e) => e.discoveredIn === "initial");
const enriched = evidence.filter((e) => e.discoveredIn !== "challenge");

test("initial (title-driven) evidence yields Low with low confidence", () => {
  const a = assess(sarah, initial);
  assert.equal(a.level, "Low");
  assert.equal(a.confidence, "low");
  assert.ok(a.missingAreas.includes("revenue_impact"));
  assert.ok(a.ignoredEvidenceIds.includes("EV-003"), "GitHub evidence is ignored for marketing role");
});

test("enrichment moves to Moderate, not High, and keeps the delivery concern", () => {
  const before = assess(sarah, initial);
  const after = assess(sarah, enriched);
  assert.equal(after.level, "Moderate");
  assert.equal(after.confidence, "high");
  const d = diff(before, after);
  assert.ok(d.changed);
  assert.ok(d.improved.includes("revenue_impact"));
  assert.ok(d.unchangedConcerns.includes("delivery_reliability"));
  assert.equal(after.missingAreas.length, 0);
});

test("neutral and irrelevant evidence does not move the score", () => {
  const withNeutral = assess(sarah, [...initial, ...evidence.filter((e) => ["EV-107", "EV-109"].includes(e.id))]);
  assert.equal(withNeutral.score, assess(sarah, initial).score);
});

test("valid challenge reclassifies the factor but does not change the level", () => {
  const before = assess(sarah, enriched);
  const review = reviewChallenge({ category: "delivery_reliability", evidenceIds: ["EV-201"] }, evidence, {});
  assert.equal(review.outcome, "updated");
  assert.equal(review.adjustments["EV-005"], -1);
  const after = assess(sarah, evidence, review.adjustments);
  assert.equal(after.level, "Moderate");
  assert.ok(after.score > before.score);
  assert.equal(after.factors.find((f) => f.category === "delivery_reliability")!.status, "concern");
});

test("other employees resolve to intended levels from their own evidence", () => {
  const level = (id: string) => {
    const emp = employees.find((e) => e.id === id)!;
    return assess(emp, evidence.filter((e) => e.employeeId === id && e.discoveredIn === "initial")).level;
  };
  assert.equal(level("emp-daniel-wong"), "Low");
  assert.equal(level("emp-priya-nair"), "High");
  assert.equal(level("emp-aisyah-rahman"), "High");
  assert.equal(evidence.filter((e) => e.employeeId === "emp-marcus-tan").length, 0);
  assert.equal(evidence.filter((e) => e.employeeId === "emp-jonathan-lee").length, 0);
});

test("workforce dataset is well-formed: 100 employees, unique ids, every evidence item traceable", async () => {
  const { sources } = await import("@/data/sources");
  assert.equal(employees.length, 100);
  assert.equal(new Set(employees.map((e) => e.id)).size, 100);
  assert.equal(new Set(evidence.map((e) => e.id)).size, evidence.length, "evidence ids unique");
  const empIds = new Set(employees.map((e) => e.id));
  const srcIds = new Set(sources.map((s) => s.id));
  for (const ev of evidence) {
    assert.ok(empIds.has(ev.employeeId), `${ev.id} points at unknown employee`);
    assert.ok(srcIds.has(ev.sourceId), `${ev.id} points at unknown source`);
  }
  const levels = { Low: 0, Moderate: 0, High: 0, none: 0 };
  for (const emp of employees) {
    const ev = evidence.filter((e) => e.employeeId === emp.id && e.discoveredIn === "initial");
    if (!ev.length) levels.none++;
    else levels[assess(emp, ev).level]++;
  }
  assert.ok(levels.Low > 5 && levels.Moderate > 5 && levels.High > 5, `spread: ${JSON.stringify(levels)}`);
  assert.ok(new Set(employees.map((e) => e.role)).size >= 10, "technical and non-technical roles represented");
});

test("challenge with off-topic evidence is rejected", () => {
  const review = reviewChallenge({ category: "delivery_reliability", evidenceIds: ["EV-107"] }, evidence, {});
  assert.equal(review.outcome, "unchanged");
  assert.deepEqual(review.rejectedEvidenceIds, ["EV-107"]);
  assert.deepEqual(review.adjustments, {});
});
