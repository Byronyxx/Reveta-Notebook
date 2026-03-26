# DOCUMENT E — Grand Unified Orchestration Prompt v3.0
## Five-Document Integration Bridge · Zero-Bug Architecture

**Authority Tier:** Orchestrates all tiers

## FIVE-DOCUMENT AUTHORITY HIERARCHY

```
TIER 1 → docs/01_NotebookLM_PRD.md        PRODUCT TRUTH
TIER 2 → docs/02_Design_System.md          EXPERIENCE TRUTH
TIER 3 → [Global Builder's Masterclass]    TECHNICAL TRUTH
TIER 4 → prompts/03_Implementation_Engine  PROCESS TRUTH
TIER 5 → docs/04_CHANGELOG.md              STATE TRUTH
```

**Critical Masterclass Mandates (non-negotiable):**
- Stack locked: Next.js 15 + TypeScript + Supabase + Claude API + Upstash Redis + Vercel
- Every API route: Authenticate → Validate (Zod) → Execute → Handle errors → Return typed response
- Every AI call: Through `lib/ai/claude.ts` wrapper → Zod output validation → Safe fallback → Rate limited → Cached
- All prompts in `lib/ai/prompts.ts` with version metadata
- AI eval threshold: 80%+ before marking COMPLETE
- TypeScript strict mode: always

## PRE-FLIGHT AUDIT (9 GATES)

1. Token Pipeline Integrity
2. PRD ↔ Design System Coverage
3. Motion Technical Feasibility
4. Accessibility Conflict Detection
5. CHANGELOG Initialisation
6. Figma Make Integration Readiness
7. Full-Stack Environment Integrity
8. Context Engineering Architecture
9. AI Quality & Prompt System Readiness

## TWELVE BUG CLASSES

| # | Bug Class | Prevention |
|---|-----------|------------|
| 01 | Token Drift | Update all 3 formats same session |
| 02 | Animation Performance Collapse | GPU-only props, IntersectionObserver pause |
| 03 | Dark Mode Colour Bleed | Verify both modes for every component |
| 04 | Figma Smart Animate Failure | Layer names = component token IDs |
| 05 | Z-Index Collision | Z-index only via spatial tokens |
| 06 | Safari/WebKit Rendering | -webkit-backdrop-filter + @supports fallback |
| 07 | Scope Creep as Polish | No unlogged additions |
| 08 | Wrong Supabase Client | Server → server.ts, Client → client.ts |
| 09 | Unvalidated AI Output | Zod schema + try/catch + safe default |
| 10 | Context Rot | Compress at turn threshold |
| 11 | Prompt Drift | Prompts versioned, eval re-run on change |
| 12 | Env Variable Exposure | .env.local in .gitignore, NEXT_PUBLIC_ for non-secrets only |

## SESSION PROTOCOL

**Fresh Start:** Run pre-flight (9 gates) → Execute
**Resume:** State reconstruction → Technical debt scan → Execute

**State Reconstruction (MANDATORY on resume):**
- Read CHANGELOG.md, identify last entry
- Verify queue table matches implementation log
- Update any drifted status
- Check Prompt Version Registry sync
- Check api-security-audit.md currency

**Session Close Checklist:**
- Implementation Log entries written?
- Master Execution Queue table updated?
- Live Status Dashboard current?
- Prompt Version Registry updated?
- api-security-audit.md updated?

## MASTER ACTIVATION

```
Five documents. One product.
Nine pre-flight gates. Twelve bug classes named before they occur.
Eight handoff protocols. Zero silent conflicts.

The immersive experience is earned through technical discipline.
A session is not closed until the CHANGELOG is current.
A requirement is not complete until its eval cases pass.
An AI call is not valid until it routes through the wrapper.
```

*Grand Unified Orchestration Prompt v3.0 · Document E*
