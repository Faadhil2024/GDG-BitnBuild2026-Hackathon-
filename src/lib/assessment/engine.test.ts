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

test("challenge with off-topic evidence is rejected", () => {
  const review = reviewChallenge({ category: "delivery_reliability", evidenceIds: ["EV-107"] }, evidence, {});
  assert.equal(review.outcome, "unchanged");
  assert.deepEqual(review.rejectedEvidenceIds, ["EV-107"]);
  assert.deepEqual(review.adjustments, {});
});
