# ✦ REVETA NOTEBOOK — Master Workspace
## Five-Document Implementation System · Google IDX Ready

> **Open this file first.** Every document in this workspace is interdependent.
> Read the Authority Hierarchy before touching anything else.

---

## ◼ WORKSPACE CONTENTS

| # | File | Document | Role |
|---|------|----------|------|
| 01 | `docs/01_NotebookLM_PRD.md` | NotebookLM PRD v1.0 | **WHAT** to build |
| 02 | `docs/02_Design_System.md` | Reveta Immersive Design System v1.0 | **HOW** it looks & moves |
| 03 | `prompts/03_Implementation_Engine.md` | PRD Sequential Implementation Engine | **HOW** to build it |
| 04 | `docs/04_CHANGELOG.md` | CHANGELOG.md | **WHAT** has been built |
| 05 | `prompts/05_Grand_Unified_Orchestration.md` | Grand Unified Orchestration Prompt v2.0 | **CONNECTS** all five |
| 06 | `prompts/06_Master_System_Prompt.md` | Claude Master System Prompt v2.0 | **AI INTELLIGENCE** layer |
| 07 | `tokens/design-tokens.json` | Design Token Scaffold | Token source of truth |
| 08 | `tokens/css-variables.css` | CSS Custom Properties | Design → Code bridge |

---

## ◼ AUTHORITY HIERARCHY (Read Before Everything)

When documents conflict, this order decides:

```
TIER 1 → docs/01_NotebookLM_PRD.md        PRODUCT TRUTH — what exists & what never will
TIER 2 → docs/02_Design_System.md          EXPERIENCE TRUTH — how everything looks & moves
TIER 3 → [Global Builder's Masterclass]    TECHNICAL TRUTH — how to build it correctly
TIER 4 → prompts/03_Implementation_Engine  PROCESS TRUTH — the discipline of delivery
TIER 5 → docs/04_CHANGELOG.md              STATE TRUTH — what actually happened
```

---

## ◼ WHERE TO START

### If you are starting implementation for the first time:
1. Read `prompts/05_Grand_Unified_Orchestration.md` — the master connector
2. Run all 9 Pre-Flight Audits before writing a line of code
3. Follow the Integrated Execution Queue (Tier -1 → Tier 0 → Tier 1...)
4. Log every completed requirement in `docs/04_CHANGELOG.md` immediately

### If you are resuming an existing session:
1. Open `docs/04_CHANGELOG.md` — find the last COMPLETE entry
2. Resume at the next ⬜ Pending requirement in the queue
3. Check the Exceptions Log for any open blockers

### If you are implementing a design component:
1. Consult `docs/02_Design_System.md` for the full specification
2. Reference `tokens/design-tokens.json` for all token values
3. Use `tokens/css-variables.css` for CSS variable names — never hardcode

### If you are building an AI feature:
1. Read `prompts/06_Master_System_Prompt.md` for prompt engineering standards
2. Check the Context Engineering Architecture in `prompts/05_Grand_Unified_Orchestration.md`
3. All prompts must be versioned in `lib/ai/prompts.ts` — never inline

---

## ◼ TECH STACK (Locked)

```
Framework:   Next.js 15 (App Router) + TypeScript (strict)
Styling:     Tailwind CSS + shadcn/ui
Database:    Supabase (PostgreSQL + Auth + Storage + pgvector)
AI:          Anthropic Claude API (via lib/ai/claude.ts wrapper)
Cache:       Upstash Redis
Deploy:      Vercel
Monitoring:  Sentry + Langfuse
Validation:  Zod (all inputs AND all AI outputs)
```

**Rule:** Every AI call routes through `lib/ai/claude.ts`. No exceptions.
**Rule:** Every API route: Authenticate → Validate (Zod) → Execute → Error handle → Return.
**Rule:** No hardcoded hex, px, or ms values in components. CSS variables only.

---

## ◼ QUALITY THRESHOLDS (Non-Negotiable)

| Metric | Threshold | Consequence of Failure |
|--------|-----------|----------------------|
| AI Eval Suite Accuracy | 80%+ | Requirement marked DEFERRED |
| AI Response Cache Hit Rate | 50%+ | Review caching strategy |
| WCAG AA Contrast | 4.5:1 (normal) / 3:1 (large) | Colour token blocked |
| TypeScript Errors | 0 | No deployment |
| Hardcoded values in components | 0 | Component fails verification gate |
| Prompts without version metadata | 0 | Prompt blocked from production |

---

## ◼ TWELVE BUG CLASSES (Named — Therefore Preventable)

| # | Bug Class | Primary Risk |
|---|-----------|-------------|
| 01 | Token Drift | Three-format inconsistency |
| 02 | Animation Performance Collapse | GPU paint storms |
| 03 | Dark Mode Colour Bleed | Light mode untested |
| 04 | Figma Smart Animate Failure | Layer naming inconsistency |
| 05 | Z-Index Collision | Stacking context warfare |
| 06 | Safari / WebKit Rendering | backdrop-filter, Scroll Timeline |
| 07 | Scope Creep as Polish | Unlogged additions |
| 08 | Wrong Supabase Client | Auth session corruption |
| 09 | Unvalidated AI Output | Production schema crash |
| 10 | Context Rot | Long-session quality degradation |
| 11 | Prompt Drift | Invisible accuracy regression |
| 12 | Environment Variable Exposure | Catastrophic security event |

---

## ◼ IMPLEMENTATION STATUS

> Update this table as requirements complete.

| Tier | Requirements | Complete | Deferred | Blocked |
|------|-------------|---------|---------|--------|
| Tier -1 (Technical Substrate) | 5 | 0 | 0 | 0 |
| Tier 0 (Design Foundation) | 4 | 0 | 0 | 0 |
| Tier 1 (Product Core / P0) | 9 | 0 | 0 | 0 |
| Tier 2 (Features / P1) | 12 | 0 | 0 | 0 |
| Tier 3 (Immersive / P2) | 6 | 0 | 0 | 0 |
| Tier 4 (Quality / Deploy) | 9 | 0 | 0 | 0 |
| **TOTAL** | **45** | **0** | **0** | **0** |

---

*Reveta Notebook · Master Workspace v1.0 · Google IDX Compatible*
*Five documents. One product. Zero tolerance for undocumented deviation.*
