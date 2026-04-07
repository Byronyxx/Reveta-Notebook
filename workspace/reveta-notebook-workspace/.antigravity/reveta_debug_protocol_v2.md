# REVETA NOTEBOOK — FULL SYSTEM DEBUG PROTOCOL
# Antigravity Standard v2.0
# Branch: latest | Repo: Byronyxx/Reveta-Notebook
# Active Requirements: 42/45 | Deferred: FR-07, FR-08, FR-12
# ============================================================
# LIFECYCLE: PLAN → AUDIT → TRIAGE → FIX → VERIFY → LOG
# ============================================================

---

## ── SECTION 1: IDENTITY & OPERATING CONSTRAINTS ──────────────

**Role:** Senior Full-Stack Debugger operating under Antigravity Standard v2.0.

**Mission:**
Execute a full-spectrum, production-grade system debug of the Reveta Notebook workspace.
Target zero technical debt across all 42 completed requirements.
Surface all findings before any remediation begins.
Security is audited as a first-class concern — not an afterthought.

**Non-Negotiable Rules:**
1. Every phase follows the Antigravity lifecycle: PLAN → AUDIT → TRIAGE → FIX → VERIFY → LOG
2. No phase may be skipped, batched, or run concurrently with a subsequent phase
3. Two-system sync rule: every fix must update both the implementation log AND the queue table atomically
4. DO NOT write any code or apply any fix during the AUDIT phases — findings first, fixes later
5. CHANGELOG is updated atomically per fix — no retroactive batch entries permitted
6. Deferred requirements (FR-07, FR-08, FR-12) may only be re-opened if documented unblock conditions are met
7. All phases must be completed and ticked before the protocol is considered closed

---

## ── SECTION 2: TECH STACK CONTEXT ────────────────────────────

- **Framework:** Next.js 15 (App Router, Turbopack), TypeScript strict mode
- **Styling:** Tailwind CSS v4
- **Auth + DB:** Supabase (Auth, Postgres, RLS, pgvector)
- **AI:** Anthropic SDK — model: `claude-sonnet-4-20250514`
- **Embeddings / Audio:** OpenAI (embeddings, Whisper, TTS)
- **Cache / Rate-limit:** Upstash Redis
- **Hosting:** Vercel
- **IDE:** Google Antigravity IDE
- **Workspace dir:** `/home/claude/reveta-build/`
- **Output dir:** `/mnt/user-data/outputs/`
- **Antigravity config:** `.antigravity/` (six-section structured integration)

---

## ── SECTION 3: PHASE DEFINITIONS & GATE CONDITIONS ───────────

### ☐ PHASE 0 — PLAN: Mission Brief & Operating Constraints
**Antigravity Stage:** PLAN
**Gate Condition:** Scope confirmed. All operating constraints agreed. Lifecycle understood.

Checklist:
- [ ] Repo and branch confirmed: `Byronyxx/Reveta-Notebook` @ `latest`
- [ ] 42 active requirements acknowledged; FR-07, FR-08, FR-12 deferred status noted
- [ ] Antigravity lifecycle confirmed as mandatory for every subsequent phase
- [ ] Two-system sync rule acknowledged
- [ ] Security audit designated as blocking gate (no CRITICAL finding may remain open at phase close)
- [ ] Audit-before-fix rule confirmed: zero code written until Phase 6 triage sign-off

**Status:** ☐ PENDING → tick when all checklist items confirmed

---

### ☐ PHASE 1 — AUDIT: Static Analysis & Dependency Audit
**Antigravity Stage:** AUDIT
**Gate Condition:** Full static output captured. All findings logged with ID / SEVERITY / LOCATION.

Checklist:
- [ ] `tsc --noEmit` in strict mode — capture every type error, implicit `any`, missing return type
- [ ] `eslint . --max-warnings 0` — flag all violations, unused imports, dead exports
- [ ] `npm audit --audit-level=moderate` — classify as CRITICAL / HIGH / MODERATE
- [ ] `package.json` scanned for version drift, duplicate peer deps, misclassified `devDependencies`
- [ ] `tsconfig.json` validated: strict flags, path aliases, `moduleResolution` for Next.js 15 App Router + Turbopack
- [ ] `.gitignore` disposition resolved for `package-lock.json` (236 KB) and `tsconfig.tsbuildinfo` (201 KB)

**Status:** ☐ PENDING → tick when all findings logged in structured output

---

### ☐ PHASE 2 — AUDIT: Runtime & Build Integrity
**Antigravity Stage:** AUDIT
**Gate Condition:** Build completes or all blocking errors logged. Runtime surface fully enumerated.

Checklist:
- [ ] `next build` (Turbopack) — capture all errors, warnings, bundle size anomalies
- [ ] All API routes validated: HTTP method guards, error boundary coverage, response shape contracts
- [ ] Upstash Redis client initialisation confirmed SSR-safe (no `window` / browser globals at module level)
- [ ] Anthropic SDK invocations confirmed using model `claude-sonnet-4-20250514` and correct streaming patterns
- [ ] OpenAI client (embeddings, Whisper, TTS) handles rate limits and quota exhaustion gracefully
- [ ] All environment variables consumed via validated `env.ts` schema — no raw `process.env` in components

**Status:** ☐ PENDING → tick when runtime surface is fully enumerated

---

### ☐ PHASE 3 — AUDIT: Security Audit (Zero Tolerance)
**Antigravity Stage:** AUDIT — SECURITY BLOCKING GATE
**Gate Condition:** HARD BLOCK — this phase cannot close with any CRITICAL finding unresolved.
All security findings must be triaged and assigned a fix owner before proceeding.

Checklist:
- [ ] **Supabase RLS:** every table has a policy — enumerate any table with RLS disabled or `USING (true)` overpermission
- [ ] **Auth guards:** every protected API route validates session server-side via `getUser()` — never `getSession()` alone
- [ ] **pgvector access:** all vector search queries are parameterised — no raw user strings in SQL
- [ ] **Secret hygiene:** source files and commit history scanned for hardcoded keys, tokens, connection strings
- [ ] **CSRF / CORS:** Next.js API route headers and middleware protections validated
- [ ] **Rate limiting:** Upstash Redis rate-limit middleware confirmed active on all AI inference routes
- [ ] **Input validation:** every user-supplied input passes a Zod schema before DB query or AI call
- [ ] **Deferred stubs:** FR-07, FR-08, FR-12 confirmed to not expose open endpoints or unguarded handlers

**Status:** ☐ PENDING → tick ONLY when zero CRITICAL security findings remain open

---

### ☐ PHASE 4 — AUDIT: Google Preview & Metadata Layer
**Antigravity Stage:** AUDIT
**Gate Condition:** All SEO-BLOCKER findings logged and triaged. Metadata layer fully enumerated.

Checklist:
- [ ] `metadata` exports validated on every App Router `layout.tsx` and `page.tsx`: `title`, `description`, `openGraph`, `twitter`
- [ ] Canonical URLs confirmed resolving correctly — no trailing-slash conflicts or duplicate indexing
- [ ] `robots.ts` policy verified: authenticated app routes = `noindex`; marketing / public pages = indexable
- [ ] `sitemap.ts` output covers all public routes with correct `lastModified` and `changeFrequency`
- [ ] `favicon.ico`, `apple-touch-icon`, and `og-image` assets present at correct dimensions
- [ ] `next/image` used on all OG images with explicit `width`, `height`, and `alt` attributes
- [ ] Lighthouse SEO score ≥ 95 on all public pages — all `[SEO-BLOCKER]` findings flagged

**Status:** ☐ PENDING → tick when metadata layer fully enumerated and blockers logged

---

### ☐ PHASE 5 — AUDIT: Database & Migration Integrity
**Antigravity Stage:** AUDIT
**Gate Condition:** Migration state clean. Index coverage confirmed. All DB findings logged.

Checklist:
- [ ] All applied migrations enumerated in order — duplicates, out-of-order, orphaned files flagged
- [ ] Every foreign key has a matching index — `EXPLAIN ANALYZE` run on top 5 most frequent queries
- [ ] `pgvector` extension enabled and `ivfflat` / `hnsw` index confirmed on all embedding columns
- [ ] All RLS policies reference `auth.uid()` — never a hardcoded UUID or implicit grant
- [ ] `updated_at` auto-update triggers confirmed on all mutable tables

**Status:** ☐ PENDING → tick when DB surface is fully enumerated and findings logged

---

### ☐ PHASE 6 — TRIAGE → FIX → VERIFY → LOG
**Antigravity Stage:** TRIAGE → FIX → VERIFY → LOG
**Gate Condition:** Protocol complete when all success criteria below are met.

#### Findings Log Schema (use for every finding):
```
ID          : [AUTO-INCREMENT]
SEVERITY    : CRITICAL | HIGH | MEDIUM | LOW
CATEGORY    : Security | Build | Runtime | SEO | DB | Debt
LOCATION    : [file:line]
DESCRIPTION : [what is wrong]
IMPACT      : [what breaks or degrades]
TAGS        : [SEO-BLOCKER] | [REGRESSION] | (none)
SUGGESTED_FIX: [recommended remediation]
STATUS      : OPEN | TRIAGED | IN-PROGRESS | FIXED | VERIFIED | LOGGED
```

#### Summary Matrix (populate after audit phases):
```
             | Security | Build | Runtime | SEO | DB | Debt | TOTAL
-------------|----------|-------|---------|-----|----|------|------
CRITICAL     |          |       |         |     |    |      |
HIGH         |          |       |         |     |    |      |
MEDIUM       |          |       |         |     |    |      |
LOW          |          |       |         |     |    |      |
TOTAL        |          |       |         |     |    |      |
```

#### Triage Gate (mandatory before any fix):
- [ ] Full findings log delivered and reviewed by Byron
- [ ] Prioritised fix queue signed off — fixes ordered CRITICAL → HIGH → MEDIUM → LOW
- [ ] Each fix assigned to: PLAN → FIX → VERIFY → LOG micro-cycle

#### Per-Fix Micro-Cycle (repeat for every approved fix):
```
PLAN    : Describe exact change, files affected, risk of regression
FIX     : Implement change
VERIFY  : Confirm fix resolves finding — run relevant checks
LOG     : Update implementation log + queue table (two-system sync)
         Update CHANGELOG atomically
```

#### Deferred Review:
- [ ] FR-07 (WebRTC audio) — unblock conditions reviewed
- [ ] FR-08 (Video overview) — unblock conditions reviewed
- [ ] FR-12 (Mobile share sheet) — unblock conditions reviewed

**Status:** ☐ PENDING → tick when ALL success criteria below are confirmed

---

## ── SECTION 4: SUCCESS CRITERIA (ALL MUST BE TRUE) ──────────

```
☐  Zero CRITICAL or HIGH severity findings remain open
☐  Google preview Lighthouse SEO score ≥ 95 on all public pages
☐  TypeScript compiles with zero errors and zero warnings
☐  ESLint passes with zero warnings
☐  All 42 completed requirements are regression-free
☐  Security audit fully clean — no open RLS gaps, no exposed secrets
☐  CHANGELOG updated atomically — all fixes documented
☐  Two-system sync confirmed for every logged fix
☐  All 7 phases ticked as COMPLETE
```

**Protocol is CLOSED only when every box above is ticked.**

---

## ── SECTION 5: DELIVERABLES ──────────────────────────────────

1. Structured findings log (severity-sorted, schema-compliant)
2. Summary matrix (severity × category)
3. Prioritised fix queue (awaiting Byron sign-off before execution)
4. Per-fix PLAN → FIX → VERIFY → LOG records
5. Updated CHANGELOG after each merged fix
6. Final verification report confirming all success criteria met
7. Deferred requirement re-assessment report (FR-07, FR-08, FR-12)

---

## ── SECTION 6: REFERENCE — TOOL & FILE CONVENTIONS ──────────

| Tool / Pattern                  | Convention                                              |
|---------------------------------|---------------------------------------------------------|
| GitHub large file push          | `GitHub:create_or_update_file` (≥ 100 KB files)        |
| GitHub batch push               | `GitHub:push_files` (smaller files, no SHA required)   |
| GitHub file fetch               | `ref: refs/heads/latest`                                |
| Workspace dir                   | `/home/claude/reveta-build/`                            |
| Output dir                      | `/mnt/user-data/outputs/`                               |
| Zip extraction                  | `timeout 30 unzip -qo [path] -d [dest]`                 |
| File size pre-check             | `wc -c [file]` before every GitHub push                 |
| pip installs                    | Always use `--break-system-packages` flag               |
| Antigravity config              | `.antigravity/` — six-section structured integration    |
| Design system doc               | `docs/02_Design_System.md` (full 22 KB version pending) |

---

*Reveta Debug Protocol v2.0 — Antigravity Standard*
*Generated: 2026-04-04 | Status: READY FOR EXECUTION*
