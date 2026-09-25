# WholePicture — evidence-based AI appraisal

> **Did the AI actually see the whole employee?**

An evidence-based AI appraisal prototype that shows what an assessment is actually based on, where each piece of evidence came from, what was missing, and how the assessment changes when the missing picture is filled in — and lets the person affected challenge it.

Built for two hackathon statements:

- **AI / ML — "Contestability, not explanation".** The system never asks you to trust its explanation. Every factor traces to evidence IDs and source records; missing areas are flagged; challenges are reviewed on evidence and can fail.
- **Web — "Interfaces that change silently".** Every meaningful state change (evidence found, level changed, assessment frozen, review resolved) is announced both visually and through ARIA live regions, with focus moved to the explanation.

## The demo case

Sarah Lim, **Marketing Executive**. On title-driven signals (activity counts, GitHub commits, Slack volume, one missed deadline) the assessment is **Low**. When the system scans the simulated company sources it finds campaign revenue (RM800k influenced), cross-functional launch ownership, client support and mentoring — and the assessment becomes **Moderate**, not High: the delivery concern remains. Sarah then challenges that concern with her manager's approval message; the factor is reclassified, the level stays Moderate. Attaching unrelated evidence gets rejected.

## Architecture (evidence-first)

```
src/data/            DATA      → synthetic fixtures: employees, sources, evidence (the only facts that exist)
src/lib/assessment/  ENGINE    → deterministic, role-aware scoring; decides the level; unit-tested
src/lib/ai/          AI        → writes explanations only; zod-validated; may cite only real evidence IDs
src/store/           STATE     → phases, timeline, announcements
src/components/      UI        → assessment, factors, evidence drawer, timeline, challenge, live announcer
```

The LLM is **not** the source of truth. If it cites an unknown evidence ID, returns invalid JSON, or times out, the app falls back to a deterministic explanation and says so in the UI (`Deterministic explanation (no live model)`).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine + challenge rules pinned to the demo story
npm run build
```

Works with **no API key** (fallback mode). For a live model, copy `.env.example` to `.env.local` and set a free-tier key (Groq, Gemini, or OpenRouter).

## Deploy (free)

Vercel: import the repo, optionally add `AI_PROVIDER` / `AI_API_KEY` as environment variables, deploy. No database or other services are needed.

## Data & safety

This prototype uses simulated workplace data only. It does not connect to Slack, GitHub, CRM, HR or any real employee account. The output is an assessment aid; any employment decision requires human review.
