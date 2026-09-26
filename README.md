# SKYNET — evidence-based appraisal you can contest

> **Did the AI actually see the whole employee?**

An appraisal prototype for Halcyon Digital Sdn Bhd (synthetic). Every grade is built from indexed records; every record has a source; both the employee and the manager can challenge the grade — and the system either finds the evidence or says plainly that it did not. Nothing changes silently.

Built for two hackathon statements:

- **01 · AI / ML — "Contestability, not explanation."** A confident explanation is not proof. Here the AI's grade carries evidence IDs, each claim in a self-appraisal is marked backed / unbacked / contradicted against the record, the manager can only dispute with cited evidence (one grade step per round, three rounds, then an explicit **human override**), and the employee can ask for a **re-evaluation** that re-runs the engine on newly located records — and is refused, with a reason, when nothing is found.
- **03 · Web — "Interfaces that change silently."** Every state change is written to a persistent, reviewable change log, spoken through `aria-live` regions (polite for progress, assertive for decisions), and marked "new" where it landed. Toasts expire; the log does not.

**Live demo:** https://skynethackathon-fwvrpzvjq-cat201assignement-2s-projects.vercel.app

## What a judge can do in five minutes

1. Open `/` — the landing page. **See the demo** → sign-in. Demo accounts are click-to-fill on the sign-in page.
2. **Sarah Lim** (employee): profile → Self appraisal (one submission per cycle; fill with sample answers) → Completed. Stats now shows **Scoring via AI · B** and the grade ladder. Employees see their grade and how grades are earned — never the manager's reasoning or colleagues' grades.
3. **Jonathan Lee** (employer): all 100 employees, filter/sort, "new" dots on rows that changed. Open Sarah → report with per-question AI reasoning → **Agree** or **Disagree** (must cite evidence; three rounds; then human override). Stats: verified-grade trend that moves with each decision. The bell shows the full change log.
4. Toggle **night mode** in the header pill — every token re-points, grade colours stay meaningful.

| Person | Office ID | Password | Role |
|---|---|---|---|
| Sarah Lim | HD-1042 | sarah2026 | Employee · Marketing (non-technical) |
| Daniel Wong | HD-2210 | eng2026 | Employee · Engineering |
| Shalini Kamaruddin | HD-2377 | data2026 | Employee · Data |
| Jonathan Lee | HD-0007 | jonathan2026 | Employer |

## How the AI part actually works

The grade is decided by a **deterministic, role-aware evidence engine** (`src/lib/assessment/engine.ts`), unit-tested. Each of eight contribution categories is weighted by role; each factor lists exactly which evidence IDs produced it. Grades read as protocols met (A+ = 6 of 6 … D = 0) against six published protocols (`src/data/rubric.ts`).

- **Self-appraisal review** (`src/lib/appraisal-review.ts`): text is never graded. Claims are detected and compared with the record — backed, unbacked, contradicted — and the gap between self-grade and evidence grade is explained per question.
- **Manager disagreement gate**: one step per round, cited evidence must belong to the employee, reason must be a sentence. Three failures unlock a human override that is labelled as such.
- **Re-evaluation engine** (`src/lib/reevaluation.ts`, tested, not exposed in the current UI): two rules — the area must be expected for the role and not fully evidenced; the note must name a connected system and a date/identifier. When both hold the record is admitted and the engine re-runs.

An optional LLM (`src/lib/ai/`) may write explanation prose only; it is validated and may cite only real evidence IDs. With no key the app uses deterministic text and says so.

## Demo video shot list (90 seconds, positive path)

1. Landing: hero card flips C → B. **See the demo**.
2. Sign in as Sarah (click her card). Profile: photo, Not submitted.
3. Self appraisal → Fill with sample answers → Submit → **Completed** → Done. Profile: Completed.
4. Stats: **Scoring via AI · B**, grade ladder.
5. Log out → sign in as Jonathan. Table: 100 rows, Sarah has the new-change dot, bell shows 1.
6. Open Sarah → two grade squares, per-question AI reasoning with evidence IDs, "Why the AI gave B".
7. Back → **Disagree** → propose B+, cite EV-101, one sentence → accepted → "Revised B → B+", toast, bell.
8. Jonathan's Stats: trend line moves. Toggle night mode.
9. Bell → change log. Close on: *nothing changes silently*.

Voice line: "The AI graded from evidence and showed its IDs. When the manager disagreed, it made him prove it — then changed its mind, on the record."

## Architecture

```
src/data/            synthetic fixtures: 100 employees, sources, evidence, rubric, seeded mid-cycle state
src/lib/assessment/  engine (grade), roles (weights), explain (deterministic prose)
src/lib/             appraisal-review, reevaluation (engine only), self-appraisal store, session, updates (change log), theme
src/store/           assessment discovery / challenge state machine
src/components/      landing, login, app shell, employer table, report sheet, stats, announcer
```

State is browser-local (`localStorage`, `skynet.*`) with a data-version key so demo accounts always start clean. No backend, no paid services.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine, disagreement gate, re-evaluation rules, workforce invariants
npm run build
```

Deploys to Vercel as-is. Portraits are free stock images (randomuser.me); with no network the name is still printed beside a grey circle.

## Accessibility and honesty

- Nothing changes silently: change log, live regions, "new" markers, explicit revision and override states.
- Colour never carries meaning alone: grade letters, labels, and icons accompany every tint.
- Employees who have not submitted show no fabricated evidence, grade, or timeline.
- The interface says who decided: the engine, or a named human.

## Data and safety

Simulated workplace data only. No Slack, GitHub, CRM, HR or real employee accounts are connected. The output is an assessment aid; any employment decision requires human review.
