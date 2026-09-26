---
name: wholepicture-ui
description: Visual design guidance for WholePicture's evidence/contestability interface — the evidence panel, before/after assessment comparison, and evidence-source cards. Apple.com-style visual language: sleek, restrained, no gradients or taglines. Use whenever building or styling any screen in this project.
---

# WholePicture UI

## Visual language
- Apple.com-level restraint: generous whitespace, a strict type scale, and layout hierarchy do the work — never gradients, drop-shadows-as-decoration, or hero taglines.
- Sans-serif typography only, everywhere — no serif or calligraphic fonts, including in headings or emphasis. Default to a system font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) unless a specific typeface is requested.
- Near-monochrome palette (black/white/grey) with one accent color reserved only for meaningful state (e.g. "assessment changed").
- Typography carries weight: large, confident headings for the assessment itself; smaller, quieter type for evidence metadata. No more than 2 font weights per screen.
- Every visual element must be load-bearing — if you can delete it and lose no information, delete it.

## Layout principles
- Always show three zones together: the AI's current assessment, the evidence behind it, and what's missing. Never show a score in isolation.
- Before/after comparisons use a clear visual diff (not just two numbers side by side) — highlight what specifically changed, with plain restrained styling (e.g. a subtle underline or weight change, not a colored badge pile-up).
- Evidence cards show source (Slack, project tool, report) as a small, quiet tag — not a colorful chip.

## States to design for
- Assessment with no missing evidence flagged
- Assessment mid-update (new evidence just arrived)
- Assessment with contested/disputed evidence
