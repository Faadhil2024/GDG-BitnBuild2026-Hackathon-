# Project status — WholePicture

Evidence-based AI appraisal prototype. Core question: **"Did the AI actually see the whole employee?"**

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · no database · no required API key. Verified green: `tsc`, `eslint`, `npm test` (5 tests), `next build`. All code committed locally.

---

## What exists (two screens)

### Screen 1 — `/` Appraisal cycle overview
- Header bar: product name (WholePicture), company name (Halcyon Digital Sdn Bhd), nav.
- 3 stat cards: employees in cycle (6), assessments flagged for review (1), evidence items indexed (16).
- Employee table: name / title / department / assessment / status. **Only Sarah is assessed** — the other five honestly show "Not yet assessed / evidence collection pending" (no fake data).
- "Connected sources (simulated)" strip: Slack, Project Tracker, Marketing Reports, CRM, Documents, Performance Reviews, HR, GitHub.
- Footer disclaimer: simulated data, AI assessment ≠ employment decision.

### Screen 2 — `/employees/emp-sarah-lim` (the whole story, one page)

Left column, top to bottom:

1. **Employee header** — Sarah Lim, Marketing Executive, Marketing, manager, tenure, location. Phase pill (initial/discovering/enriched/frozen/reviewed).
2. **Assessment card** — big level badge (`▽ Low contribution`), contribution index (0/100), evidence coverage %, confidence dots. Amber "Incomplete picture" banner listing the expected areas with no evidence. Footer line: "AI assessment ≠ employment decision."
   - Action: **"Discover evidence across connected sources"** (pulsing button).
3. **Challenge panel** (appears when opened) — factor dropdown, statement textarea, evidence checklist with "only relevant evidence is admitted" hint. Submit → frozen state → review outcome box.
4. **"What changed, and why" panel** (appears after discovery/challenge) — `Low → Moderate` badges, index + confidence delta, two columns *Changed* / *Did not change* (delivery concern stays), then the **AI explanation** block with cited evidence IDs as clickable chips, honest provenance pill (`Generated live · model` vs `Deterministic explanation (no live model)`).
5. **Factor list** — 7 weighted factors sorted by role weight, each with status pill (Supported / Concern / No evidence), meter bar (−2 to +2), and clickable evidence chips showing `EV-xxx` + impact. A dashed collapsible at the bottom: **"Seen but not weighed"** (GitHub/Jira items — weight 0 for marketing, shown for transparency).

Right column:

6. **Assessment timeline** — reverse-chronological event log with timestamps: initial load → each evidence discovery → assessment change → freeze → challenge resolution. Evidence chips on events are clickable.
7. **Evidence feed** — everything the system has seen for Sarah, each row: summary, `EV-xxx`, source system + record name, direction pill (Strengthens / Weakens / Neutral / Not applicable).

8. **Evidence drawer** (native `<dialog>` modal) — the "where did this come from" view: full summary, direction/confidence pills, source block (system, record, reference, recorded date, **verbatim excerpt** in a quoted block), metrics grid, and a "How it is weighed" section showing `impact × role weight` — or why it's ignored/neutral.

9. **Live announcer** — hidden `role=status` (polite) + `role=alert` (assertive) regions, plus a visible toast banner bottom-right mirroring the announcement. Screen reader hears e.g.: *"Assessment updated. Previous assessment was Low. Current assessment is Moderate. The change was caused by 7 newly incorporated evidence items, including revenue contribution, client impact, cross-functional work and mentoring. Delivery reliability remains a concern."*

---

## User journey (the demo script, ~110s)

| Time | Step | What the judge sees |
|------|------|---------------------|
| 0–15s | Overview → click Sarah | `Low contribution`, low confidence, "incomplete picture" warning |
| 15–35s | Scan factors | Thin evidence: title, 3 "campaigns touched", GitHub commits (ignored!), Slack count, one missed deadline. Missing areas listed. |
| 35–55s | Click **Discover evidence** | 9 items stream into timeline + feed over ~6s; items land with direction pills — including one neutral (town hall) and one ignored (Jira ticket), proving "more data ≠ higher score" |
| 55–75s | Assessment updates | **Low → Moderate**, index + confidence jump, "What changed / did not change", AI explanation citing EV-IDs |
| 75–90s | Click an evidence chip | Drawer opens: exact source, ref, verbatim excerpt, weighting math |
| 90–105s | Click **Challenge a factor** | Contests Delivery reliability with EV-201 (manager approved vendor delay) → **assessment frozen** (assertive announcement) |
| 105–120s | Review resolves | Factor revised (−2 → −1, shown with ↺), **level stays Moderate** — a challenge doesn't auto-inflate. Close: *"Before trusting an AI judgment, ask whether it actually saw the whole picture."* |

Reset demo button re-runs the whole flow live, any number of times.

---

## Architecture — what enforces the honesty claims

- `src/data/` — the only facts that exist (employees, sources, evidence).
- `src/lib/assessment/engine.ts` — **deterministic, role-aware scoring. Decides the level.** Role profiles give each category a weight (marketing: revenue 1.0, campaign 1.0, technical_output 0.0).
- `src/lib/assessment/challenge.ts` — deterministic review: evidence must match the contested factor and bear on it; else rejected with stated reason.
- `src/lib/ai/` — explanation only. Zod-validated, may cite only real evidence IDs, retry then deterministic fallback. `/api/explain` **re-derives evidence server-side** — a forged ID from the client is stripped.
- `src/store/assessment-store.tsx` — phases, event timeline, announcements.
- Tests pin the story: initial=Low/low-confidence → enriched=Moderate (not High, concern persists) → challenge revises factor but not level → off-topic challenge rejected.

## What was deliberately NOT implemented

- No live LLM by default — it's optional via env vars (Groq/Gemini/OpenRouter free tiers); fallback is deterministic and **labelled** in the UI.
- No real integrations (Slack/GitHub/CRM) — synthetic fixtures only, by design.
- No auth, no database, no separate backend, no streaming AI text.
- No other employees' assessments — honest "not yet assessed" placeholders instead of fabricated scores.
- No score manipulation controls for judges — that's the point.
- No dedicated screens for evolution/reassessment/final — folded into one employee page (timeline + change panel + challenge), per "cut screens that don't add to the story".
- Not done yet: real screen-reader testing (built to spec — semantic HTML, live regions, focus management, non-color indicators — but not yet verified in NVDA/VoiceOver); visual polish beyond the current enterprise-neutral look; deployed URL.

## Remaining / possible orders

1. Push to your repo + Vercel deploy (needs repo URL).
2. Optional live AI: add `AI_PROVIDER`+`AI_API_KEY` (free Groq key) so the explanation block says "Generated live".
3. Browser pass together — share any element/console captures via the preview and I'll fix.
4. Optional: second challenge type, more screenshot polish, slide-deck talking points.
