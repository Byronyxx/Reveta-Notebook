# ✦ REVETA NOTEBOOK — Master Workspace
## Five-Document Implementation System · Google IDX Ready

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

## ◼ AUTHORITY HIERARCHY

```
TIER 1 → docs/01_NotebookLM_PRD.md        PRODUCT TRUTH
TIER 2 → docs/02_Design_System.md          EXPERIENCE TRUTH
TIER 3 → [Global Builder's Masterclass]    TECHNICAL TRUTH
TIER 4 → prompts/03_Implementation_Engine  PROCESS TRUTH
TIER 5 → docs/04_CHANGELOG.md              STATE TRUTH
```

## ◼ TECH STACK (Locked)

```
Framework:   Next.js 15 (App Router) + TypeScript (strict)
Styling:     Tailwind CSS
Database:    Supabase (PostgreSQL + Auth + Storage + pgvector)
AI:          Anthropic Claude API (via lib/ai/claude.ts wrapper)
Cache:       Upstash Redis
Deploy:      Vercel
```

**Rule:** Every AI call routes through `lib/ai/claude.ts`. No exceptions.
**Rule:** No hardcoded hex, px, or ms values in components. CSS variables only.
