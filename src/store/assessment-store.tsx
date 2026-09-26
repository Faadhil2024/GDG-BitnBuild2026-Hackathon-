"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { assess, diff, type ImpactAdjustments } from "@/lib/assessment/engine";
import { reviewChallenge } from "@/lib/assessment/challenge";
import { CATEGORY_LABELS } from "@/lib/assessment/roles";
import type { ExplainInput, ExplanationResult } from "@/lib/ai/schema";
import { evidenceFor } from "@/data/evidence";
import { getSource } from "@/data/sources";
import { SCAN_STEPS, SCAN_STEP_MS } from "@/data/scan-steps";
import type { Assessment, AssessmentEvent, Challenge, ContributionCategory, Employee, Evidence } from "@/lib/types";

export type Phase = "initial" | "discovering" | "enriched" | "challenging" | "frozen" | "reviewed";

interface Announcement {
  id: number;
  text: string;
  priority: "polite" | "assertive";
}

interface State {
  phase: Phase;
  includedIds: string[];
  adjustments: ImpactAdjustments;
  events: AssessmentEvent[];
  history: Assessment[];
  challenge?: Challenge;
  explanation?: ExplanationResult;
  explanationLoading: boolean;
  announcement?: Announcement;
  selectedEvidenceId?: string;
  /** Click coordinates where the evidence was opened from, for drawer origin animation. */
  evidenceOrigin?: { x: number; y: number };
  lastChangeFocusKey: number;
  /** Index of the scan step currently running; equals SCAN_STEPS.length when all are complete. */
  scanStep: number;
}

type Action =
  | { type: "ADD_EVIDENCE"; id: string; at: string }
  | { type: "SET_PHASE"; phase: Phase }
  | { type: "PUSH_EVENT"; event: AssessmentEvent }
  | { type: "SNAPSHOT"; assessment: Assessment }
  | { type: "SET_CHALLENGE"; challenge?: Challenge }
  | { type: "SET_ADJUSTMENTS"; adjustments: ImpactAdjustments }
  | { type: "SET_EXPLANATION"; explanation?: ExplanationResult; loading: boolean }
  | { type: "ANNOUNCE"; text: string; priority: "polite" | "assertive" }
  | { type: "SELECT_EVIDENCE"; id?: string; origin?: { x: number; y: number } }
  | { type: "BUMP_FOCUS" }
  | { type: "SCAN_STEP"; step: number }
  | { type: "RESET"; state: State };

let announceId = 0;
let eventId = 0;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_EVIDENCE":
      return state.includedIds.includes(action.id) ? state : { ...state, includedIds: [...state.includedIds, action.id] };
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "PUSH_EVENT":
      return { ...state, events: [...state.events, action.event] };
    case "SNAPSHOT":
      return { ...state, history: [...state.history, action.assessment] };
    case "SET_CHALLENGE":
      return { ...state, challenge: action.challenge };
    case "SET_ADJUSTMENTS":
      return { ...state, adjustments: action.adjustments };
    case "SET_EXPLANATION":
      return { ...state, explanation: action.explanation ?? state.explanation, explanationLoading: action.loading };
    case "ANNOUNCE":
      return { ...state, announcement: { id: ++announceId, text: action.text, priority: action.priority } };
    case "SELECT_EVIDENCE":
      return { ...state, selectedEvidenceId: action.id, evidenceOrigin: action.id ? action.origin : undefined };
    case "BUMP_FOCUS":
      return { ...state, lastChangeFocusKey: state.lastChangeFocusKey + 1 };
    case "SCAN_STEP":
      return { ...state, scanStep: action.step };
    case "RESET":
      return action.state;
  }
}

function mkEvent(partial: Omit<AssessmentEvent, "id" | "at">): AssessmentEvent {
  return { id: `evt-${++eventId}`, at: new Date().toISOString(), ...partial };
}

function initialState(employee: Employee, all: Evidence[]): State {
  // Start from everything indexed (not challenge-only items) so the evidence-based grade always equals the AI grade on the report.
  const initialIds = all.filter((e) => e.discoveredIn !== "challenge").map((e) => e.id);
  const first = assess(employee, all.filter((e) => initialIds.includes(e.id)));
  return {
    phase: "initial",
    includedIds: initialIds,
    adjustments: {},
    history: [first],
    events: [
      mkEvent({
        type: "loaded",
        title: "Initial evidence loaded",
        description: `${initialIds.length} items from HR, activity logs and the project tracker. Grade: ${first.grade}.`,
        to: first.grade,
        evidenceIds: initialIds,
      }),
    ],
    explanationLoading: false,
    lastChangeFocusKey: 0,
    scanStep: 0,
  };
}

interface StoreValue {
  employee: Employee;
  allEvidence: Evidence[];
  state: State;
  assessment: Assessment;
  previous?: Assessment;
  includedEvidence: Evidence[];
  pendingEnrichment: Evidence[];
  submittableEvidence: Evidence[];
  actions: {
    discover: () => void;
    openChallenge: () => void;
    cancelChallenge: () => void;
    submitChallenge: (c: { category: ContributionCategory; statement: string; evidenceIds: string[] }) => void;
    selectEvidence: (id?: string, origin?: { x: number; y: number }) => void;
    reset: () => void;
  };
}

const Ctx = createContext<StoreValue | null>(null);

const SCAN_MS = SCAN_STEP_MS * SCAN_STEPS.length + 500;

export function AssessmentProvider({ employee, children }: { employee: Employee; children: ReactNode }) {
  const allEvidence = useMemo(() => evidenceFor(employee.id), [employee.id]);
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(employee, allEvidence));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const includedEvidence = useMemo(
    () => allEvidence.filter((e) => state.includedIds.includes(e.id)),
    [allEvidence, state.includedIds],
  );
  const assessment = useMemo(
    () => assess(employee, includedEvidence, state.adjustments, state.history.at(-1)?.computedAt),
    [employee, includedEvidence, state.adjustments, state.history],
  );
  const previous = state.history.length > 1 ? state.history[state.history.length - 2] : undefined;
  const pendingEnrichment = allEvidence.filter((e) => e.discoveredIn === "enrichment" && !state.includedIds.includes(e.id));
  // A challenge can point at any known evidence — including items already weighed or
  // rejected by the engine. That's how a bad challenge gets honestly rejected.
  const submittableEvidence = allEvidence;

  const announce = useCallback((text: string, priority: "polite" | "assertive" = "polite") => dispatch({ type: "ANNOUNCE", text, priority }), []);

  const requestExplanation = useCallback(
    async (before: Assessment, after: Assessment, evidence: Evidence[], context: ExplainInput["context"], challengeResolution?: string) => {
      dispatch({ type: "SET_EXPLANATION", loading: true });
      const input: ExplainInput = {
        employee: { name: employee.name, title: employee.title, department: employee.department, role: employee.role },
        before: { level: before.grade, score: before.score, confidence: before.confidence, missingAreas: before.missingAreas },
        after: { level: after.grade, score: after.score, confidence: after.confidence, missingAreas: after.missingAreas },
        diff: diff(before, after),
        evidence: evidence.map(({ id, summary, category, direction, impact, confidence, mitigates }) => ({ id, summary, category, direction, impact, confidence, mitigates })),
        context,
        challengeResolution,
      };
      try {
        const res = await fetch("/api/explain", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        dispatch({ type: "SET_EXPLANATION", explanation: (await res.json()) as ExplanationResult, loading: false });
      } catch {
        const { fallbackExplanation } = await import("@/lib/ai/service");
        dispatch({
          type: "SET_EXPLANATION",
          explanation: { ...fallbackExplanation(input), provenance: "fallback", model: "deterministic", fallbackReason: "Explanation service unreachable" },
          loading: false,
        });
      }
    },
    [employee],
  );

  const discover = useCallback(() => {
    if (state.phase !== "initial") return;
    const queue = allEvidence.filter((e) => e.discoveredIn === "enrichment");
    const sourcesCount = new Set(queue.map((e) => e.sourceId)).size;
    const before = assessment;
    dispatch({ type: "SET_PHASE", phase: "discovering" });
    dispatch({ type: "SCAN_STEP", step: 0 });
    announce(`Evidence discovery started. Scanning ${sourcesCount} connected sources for ${employee.name}.`);

    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => dispatch({ type: "SCAN_STEP", step: i + 1 }), SCAN_STEP_MS * (i + 1)));
    });

    timers.current.push(
      setTimeout(() => {
        // All items land in one batch — the result is the reveal, not a card stream.
        queue.forEach((ev) => {
          dispatch({ type: "ADD_EVIDENCE", id: ev.id, at: new Date().toISOString() });
          const src = getSource(ev.sourceId);
          dispatch({
            type: "PUSH_EVENT",
            event: mkEvent({
              type: "evidence_added",
              title: ev.direction === "irrelevant" ? "Evidence found — not applicable to role" : ev.direction === "neutral" ? "Evidence found — neutral" : "New evidence found",
              description: `${ev.summary} (${src?.name ?? ev.sourceId})`,
              evidenceIds: [ev.id],
            }),
          });
        });
        const ids = [...state.includedIds, ...queue.map((e) => e.id)];
        const after = assess(employee, allEvidence.filter((e) => ids.includes(e.id)), state.adjustments);
        const d = diff(before, after);
        const relevant = queue.filter((e) => e.impact !== 0).length;
        const neutral = queue.filter((e) => e.direction === "neutral").length;
        const irrelevant = queue.filter((e) => e.direction === "irrelevant").length;
        dispatch({ type: "SNAPSHOT", assessment: after });
        dispatch({ type: "SET_PHASE", phase: "enriched" });
        dispatch({
          type: "PUSH_EVENT",
          event: mkEvent({
            type: d.changed ? "assessment_changed" : "assessment_unchanged",
            title: d.changed ? `Assessment changed: ${d.from} → ${d.to}` : `Grade unchanged: ${d.to}`,
            description: `${queue.length} items found: ${relevant} relevant, ${neutral} neutral, ${irrelevant} not applicable to role. Improved: ${d.improved.map((c) => CATEGORY_LABELS[c]).join(", ") || "none"}. Remaining concerns: ${d.unchangedConcerns.map((c) => CATEGORY_LABELS[c]).join(", ") || "none"}.`,
            from: d.from,
            to: d.to,
            evidenceIds: queue.filter((e) => e.impact !== 0).map((e) => e.id),
          }),
        });
        announce(
          d.changed
            ? `Assessment updated. Previous grade was ${d.from}. Current grade is ${d.to}. The change was caused by ${relevant} newly incorporated evidence items, including ${d.newlyCovered.map((c) => CATEGORY_LABELS[c].toLowerCase()).join(", ")}. ${d.unchangedConcerns.length ? `${d.unchangedConcerns.map((c) => CATEGORY_LABELS[c]).join(", ")} remains a concern.` : ""}`
            : `Discovery complete. ${queue.length} items found. Grade remains ${d.to}.`,
          "assertive",
        );
        dispatch({ type: "BUMP_FOCUS" });
        void requestExplanation(before, after, queue, "enrichment");
      }, SCAN_MS),
    );
  }, [state.phase, state.includedIds, state.adjustments, allEvidence, assessment, employee, announce, requestExplanation]);

  const openChallenge = useCallback(() => {
    if (state.phase !== "enriched" && state.phase !== "reviewed") return;
    dispatch({ type: "SET_PHASE", phase: "challenging" });
    announce("Challenge form opened. Choose the factor you are contesting and attach evidence.");
  }, [state.phase, announce]);

  const cancelChallenge = useCallback(() => {
    if (state.phase !== "challenging") return;
    dispatch({ type: "SET_PHASE", phase: state.challenge?.status === "resolved" ? "reviewed" : "enriched" });
    announce("Challenge cancelled.");
  }, [state.phase, state.challenge?.status, announce]);

  const submitChallenge = useCallback(
    (c: { category: ContributionCategory; statement: string; evidenceIds: string[] }) => {
      if (state.phase !== "challenging") return;
      const before = assessment;
      const challenge: Challenge = { id: `ch-${Date.now()}`, ...c, status: "under_review" };
      dispatch({ type: "SET_CHALLENGE", challenge });
      dispatch({ type: "SET_PHASE", phase: "frozen" });
      dispatch({
        type: "PUSH_EVENT",
        event: mkEvent({
          type: "assessment_frozen",
          title: "Challenge submitted — assessment frozen",
          description: `${CATEGORY_LABELS[c.category]} contested with ${c.evidenceIds.length} evidence item(s). No changes are applied while the review is open.`,
          evidenceIds: c.evidenceIds,
        }),
      });
      announce(`Challenge submitted for ${CATEGORY_LABELS[c.category]}. The assessment is frozen while evidence is reviewed.`, "assertive");

      timers.current.push(
        setTimeout(() => {
          const result = reviewChallenge(c, allEvidence, state.adjustments);
          const nextAdjustments = { ...state.adjustments, ...result.adjustments };
          result.admittedEvidenceIds.forEach((id) => dispatch({ type: "ADD_EVIDENCE", id, at: new Date().toISOString() }));
          const ids = [...state.includedIds, ...result.admittedEvidenceIds];
          const after = assess(employee, allEvidence.filter((e) => ids.includes(e.id)), nextAdjustments);
          const d = diff(before, after);
          dispatch({ type: "SET_ADJUSTMENTS", adjustments: nextAdjustments });
          dispatch({ type: "SNAPSHOT", assessment: after });
          dispatch({ type: "SET_CHALLENGE", challenge: { ...challenge, status: "resolved", outcome: result.outcome, resolution: result.resolution } });
          dispatch({ type: "SET_PHASE", phase: "reviewed" });
          dispatch({
            type: "PUSH_EVENT",
            event: mkEvent({
              type: "challenge_resolved",
              title:
                result.outcome === "unchanged"
                  ? "Challenge reviewed — assessment unchanged"
                  : d.changed
                    ? `Challenge upheld — assessment changed: ${d.from} → ${d.to}`
                    : `Challenge upheld — factor reclassified, grade unchanged (${d.to})`,
              description: result.resolution,
              from: d.from,
              to: d.to,
              evidenceIds: result.admittedEvidenceIds,
            }),
          });
          announce(
            result.outcome === "unchanged"
              ? `Review complete. Challenge not upheld. Grade remains ${d.to}. ${result.resolution}`
              : d.changed
                ? `Review complete. Grade updated from ${d.from} to ${d.to}. ${result.resolution}`
                : `Review complete. Grade remains ${d.to}, but the ${CATEGORY_LABELS[c.category]} factor was revised. ${result.resolution}`,
            "assertive",
          );
          dispatch({ type: "BUMP_FOCUS" });
          void requestExplanation(
            before,
            after,
            allEvidence.filter((e) => c.evidenceIds.includes(e.id) || Object.keys(result.adjustments).includes(e.id)),
            "challenge",
            result.resolution,
          );
        }, 2200),
      );
    },
    [state.phase, state.adjustments, state.includedIds, assessment, allEvidence, employee, announce, requestExplanation],
  );

  const selectEvidence = useCallback(
    (id?: string, origin?: { x: number; y: number }) => dispatch({ type: "SELECT_EVIDENCE", id, origin }),
    [],
  );
  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    dispatch({ type: "RESET", state: initialState(employee, allEvidence) });
    announce("Demo reset to initial assessment.");
  }, [employee, allEvidence, announce]);

  const value: StoreValue = {
    employee,
    allEvidence,
    state,
    assessment,
    previous,
    includedEvidence,
    pendingEnrichment,
    submittableEvidence,
    actions: { discover, openChallenge, cancelChallenge, submitChallenge, selectEvidence, reset },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssessment() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAssessment must be used inside AssessmentProvider");
  return v;
}
