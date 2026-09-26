---
name: wholepicture-ux
description: Interaction and accessibility rules for WholePicture's two screens (employee and employer/manager), including the assessment journey, the manager's agree/disagree-with-AI loop and human override, error/acceptance states, rerouting, dead ends, hard-wired steps, and screen-reader announcements. Use whenever building any flow where new evidence updates an AI assessment, or any UI change needs to be communicated to the user.
---

# WholePicture UX

## Core rule
No assessment change happens silently. Every time evidence changes the AI's output, the interface must announce: what changed, why (which evidence), and what it means for the decision.

## The two screens
- **Employee screen** — the employee views their own AI-generated assessment, submits achievements as evidence, self-ranks, and can challenge specific factors in the verdict.
- **Employer (manager) screen** — the manager views the employee's self-appraisal, the employee's self score, the AI's score, and the AI's reasoning side by side. The manager can agree with the AI's score, or contest it directly with the AI before reaching a keep/terminate decision.

## Employee journey
1. View current assessment (e.g. "Low contribution") with the evidence it's based on.
2. Submit achievements and self-rank — this becomes additional evidence for the system, not an override of the AI's verdict.
3. System re-evaluates: if the new evidence changes the picture, the assessment updates (e.g. Low → Moderate) and the change is announced with what evidence caused it. Pre-existing concerns (e.g. a missed deadline) stay visible rather than being erased by the update.
4. Employee can challenge a specific factor by submitting targeted evidence (e.g. a manager's approval message).
5. System reviews the challenge:
   - **Accepted** — the disputed factor is reclassified, and what changed is recorded and shown.
   - **Rejected** — evidence judged unrelated is not applied, and the employee is told why, rather than the submission silently disappearing.
6. **Dead end** — once the employee has submitted everything they can and the employer still terminates, the flow ends. This is communicated explicitly as a final outcome (not a silent close or an error), so the employee isn't left wondering if something is still pending.

## Employer (manager) journey
1. View the employee's self-appraisal, self score, AI score, and the AI's reasoning together — alongside the full evidence trail (what was used, what's missing).
2. **Hard-wired step**: the manager must open and view this full picture — including the employee's self-submitted appraisal — before the agree/disagree control becomes available. This is what prevents acting on the title/metrics-only verdict alone.
3. Manager decides: **agree** with the AI's score, or **disagree**.
   - **Agree** → proceeds directly to the keep/terminate decision.
   - **Disagree** → manager must convince the AI, submitting proof/reasoning for why the scoring should change. The AI reviews and either revises the score (loop ends, updated score shown and announced) or holds its position.
4. The convince-the-AI loop runs up to **3 attempts**. Each attempt's outcome (revised or held) is shown and announced — never a silent retry.
5. **Human override**: if the manager fails to convince the AI after 3 attempts, a human override is granted — the manager's judgment becomes final regardless of the AI's score. This is shown explicitly as an override, not as the AI quietly agreeing, so the record is honest about who decided.
6. **Rerouting**: if the employee submits a new challenge (on the employee screen) while the manager is mid-review, the manager's view reroutes from "ready to decide" back to "verdict under re-evaluation" until that challenge is resolved — the manager is never left acting on a verdict that's since changed.

## Error POV
A technical failure, not a contested decision — e.g. an evidence source (Slack, GitHub, project tool) fails to load, or the AI can't generate a verdict at all.
- Never present a partial or blank result as if it were a final verdict.
- Show the error explicitly: what failed, what evidence is affected, and that the assessment shown (if any) is incomplete until it's resolved.

## Acceptance / rejection (evidence-level, not verdict-level)
Every piece of evidence submitted is individually accepted or rejected — the system doesn't rubber-stamp everything a person submits:
- Accepted evidence changes the relevant factor and is recorded as a change.
- Rejected evidence (e.g. unrelated to the disputed factor) is kept out, with a stated reason, rather than silently ignored or silently approved.

## Easy navigation
- Two screens only — no deep nested menus. Evidence detail is a drill-down from the summary view, with a clear, single path back.
- Consistent, minimal navigation matches the restrained visual language: no decorative wayfinding, just a clear current-state indicator (e.g. "Under re-evaluation") and a way back to the summary.

## Screen reader requirements
- Use `aria-live="polite"` regions for assessment updates — not `assertive`, unless the change is decision-critical (e.g. the final keep/terminate outcome).
- Announce in this order: what changed → evidence source → updated assessment.
- Keep announcements quiet and plain-text, consistent with the restrained visual language — no exclamation-heavy copy, no decorative icons standing in for information.

## Tone of copy
- Plain, factual language throughout ("New evidence found: cross-team projects" not "🎉 Big update!").
- No marketing language or taglines anywhere in the interface, including error, dead-end, or empty states.
