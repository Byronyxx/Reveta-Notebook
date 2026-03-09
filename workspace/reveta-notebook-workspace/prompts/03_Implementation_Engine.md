# DOCUMENT C — PRD Sequential Implementation Engine
## Systematic Execution · Accuracy-First · Serial Changelog Tracking

**Authority Tier:** 4 — PROCESS TRUTH
**Status:** Active · Version 1.0
**Role in System:** Defines HOW to build — the loop, gates, and discipline of delivery

---

> **The discipline is the work.**
> A requirement is not done until it is verified. A session is not closed until
> the changelog is current. The loop does not have shortcuts.

---

## PHASE 0 — PRD INGESTION & PLAN

Before writing a single line of implementation:

### STEP 0.1 — PARSE & EXTRACT
- Read the entire PRD completely before touching anything
- Extract every requirement: ID, description, priority, category, status
- Flag ambiguous requirements: `[AMBIGUOUS: FR-XX — reason]`

### STEP 0.2 — DEPENDENCY MAP
Build an explicit dependency graph. Example:
```
FR-03 (Ingest) → FR-01 (Grounding) → FR-02 (Citations) → FR-15 (Scoping)
FR-03 (Ingest) → FR-05 (Audio) → FR-06 (Languages) / FR-07 (Interactive)
FR-05 (Audio) → FR-08 (Video)
FR-09 (Studio) → FR-17 (Mind Map Scoping)
FR-13 (Enterprise Security) — independent; gates enterprise release
FR-14 (No Training) — independent; gates ALL tiers on privacy promise
```
Any requirement with unmet dependency is BLOCKED until dependency ships.

### STEP 0.3 — RISK SCORE EACH REQUIREMENT
- `LOW` — well-understood, clear acceptance criteria
- `MEDIUM` — requires design decisions or non-trivial integration
- `HIGH` — novel implementation, unknown constraints, or external blocker

HIGH-risk requirements trigger `<pre_implementation_review>` before execution.

### STEP 0.4 — BUILD MASTER EXECUTION QUEUE
Sort requirements:
- TIER 1: All P0, dependency-ordered within tier
- TIER 2: All P1, dependency-ordered within tier
- TIER 3: All P2, dependency-ordered within tier
- TIER 4: All P3, dependency-ordered within tier
- BLOCKED items sit at the end of their tier

**Output the full queue before beginning execution — this is the contract.**

### STEP 0.5 — INITIALIZE CHANGELOG.md
Create CHANGELOG.md. Log:
```
[PHASE-0 COMPLETE] PRD ingested. X requirements extracted.
Dependency map built. Execution queue locked. Implementation begins.
```

---

## PHASE 1 — SEQUENTIAL REQUIREMENT IMPLEMENTATION LOOP

For every requirement in the execution queue, execute this exact loop — in full.
One requirement at a time. Never parallel unless explicitly flagged as independent.

---

### LOOP STEP 1 — REQUIREMENT BRIEF

```xml
<requirement_brief>
ID:           [e.g., FR-01]
Description:  [exact text from PRD]
Priority:     [P0 / P1 / P2 / P3]
Category:     [from PRD]
Dependencies: [list of FR-IDs or NONE]
Risk Level:   [LOW / MEDIUM / HIGH]
Acceptance Criteria: [what DONE looks like — be specific]
</requirement_brief>
```

If dependencies are not complete: mark `BLOCKED`, skip to next, log in CHANGELOG.

---

### LOOP STEP 2 — PRE-IMPLEMENTATION REVIEW (HIGH RISK ONLY)

```xml
<pre_implementation_review>
Constraint Analysis: What are the hardest technical constraints?
Approach Options:    List 2–3 valid implementation approaches
Selected Approach:   State which and WHY (mechanism, not preference)
Failure Points:      Top 3 ways this implementation could fail
Mitigation:         How each failure point is addressed
</pre_implementation_review>
```

---

### LOOP STEP 3 — IMPLEMENT

Standards:
- Write to the level of specificity the requirement demands
  - data model → produce the schema
  - API endpoint → produce the spec + code
  - UI behaviour → produce the component + interaction logic
  - security control → produce the policy + enforcement code
- Reference the requirement ID in every code comment
- If implementation reveals ambiguity not caught in Phase 0:
  - STOP → log `[AMBIGUITY DISCOVERED: FR-XX]` → resolve → resume
- If blocked by external dependency: log `[EXTERNAL BLOCK: FR-XX]`

---

### LOOP STEP 4 — VERIFICATION GATE

```xml
<verification_gate id="[FR-XX]">

FUNCTIONAL CHECK:
  → Does implementation satisfy the exact requirement text?    [YES/NO + detail]
  → Does it satisfy the acceptance criteria?                  [YES/NO + detail]
  → Does it break any previously completed requirement?        [YES/NO + detail]

ACCURACY CHECK:
  → Are all assumptions explicitly documented?                [YES/NO]
  → Are there hardcoded values that should be configurable?   [YES/NO]
  → Does this handle edge cases? State which ones.

INTEGRATION CHECK:
  → Does this correctly interface with dependencies?
  → Does anything downstream need to be updated?

GATE RESULT:
  → PASS     — all checks green → proceed to changelog entry
  → FAIL     — state what failed → fix → re-run → do not log until PASS
  → DEFERRED — structurally sound but cannot be fully verified yet →
               log as DEFERRED with reason

</verification_gate>
```

---

### LOOP STEP 5 — CHANGELOG ENTRY (MANDATORY BEFORE NEXT REQUIREMENT)

```markdown
## [FR-XX] — Short Requirement Title
- **Status:**      COMPLETE / DEFERRED / BLOCKED
- **Priority:**    P0 / P1 / P2 / P3
- **Category:**    [from PRD]
- **Implemented:** YYYY-MM-DD HH:MM
- **Approach:**    [1–2 sentences: what was built and how]
- **Verified by:** [acceptance criteria check that passed]
- **Impact:**      [what this unlocks or enables downstream]
- **Notes:**       [assumptions, deviations, follow-ons flagged]
```

**RULE:** CHANGELOG.md must reflect the exact current state of implementation.
If implementation is at FR-09 — the changelog has entries for FR-01 through FR-08.
There is no "I'll update the log at the end."

---

## PHASE 2 — TIER COMPLETION GATES

Before moving from one priority tier to the next:

```xml
<tier_gate tier="[P0 / P1 / P2 / P3]">

COMPLETION AUDIT:
  → List all requirements in this tier
  → Confirm status: COMPLETE / DEFERRED / BLOCKED / FAILED
  → Any FAILED requirement: fix before proceeding
  → Any BLOCKED: document the blocker and accept the debt

REGRESSION CHECK:
  → Have any previously passing requirements broken during this tier?
  → If yes: fix the regression before advancing. Log it.

INTEGRATION HEALTH:
  → Do all completed requirements in this tier function together?
  → Is the system in a deployable / demonstrable state?

TIER GATE DECISION:
  → ADVANCE — all requirements COMPLETE or formally DEFERRED/BLOCKED
  → HOLD    — one or more FAILED or regressed → fix required

</tier_gate>
```

**CHANGELOG Tier Gate Entry:**
```markdown
## [TIER GATE] P[N] Complete
- Requirements completed: X / Y
- Deferred: [list with reasons]
- Blocked: [list with external blockers]
- Regressions found: [none / list]
- Gate decision: ADVANCE / HOLD
- Date: [timestamp]
```

---

## PHASE 3 — IMPLEMENTATION ACCURACY STANDARDS

### Specification Fidelity
- Implement exactly what the PRD says — not what you think it means
- Deviations require documentation: `[DEVIATION: FR-XX — reason]`
- If spec is silent on a detail: make the most conservative valid assumption and document it

### Edge Case Coverage
Every implementation must address its top 3 failure modes:
- Data inputs: what happens with null, empty, malformed, oversized?
- Integrations: what happens when dependency is unavailable or errors?
- User-facing: what is the degraded-mode behaviour?

### Security & Privacy (elevated for enterprise requirements)
- P0 security requirements are non-negotiable
- "Works in testing" is insufficient — security must pass adversarial testing
- Privacy: verify at data-write time, not just data-read time

### Performance
- Requirements with performance targets must be benchmarked, not estimated
- Benchmark cannot be run yet → DEFERRED with specific metric and threshold

### Cross-Requirement Consistency
- Before marking COMPLETE: scan for conflicts with already-completed requirements
- Most common failure: FR-02 breaks when FR-03 is updated

---

## PHASE 4 — EXCEPTION HANDLING

### AMBIGUITY
```
→ Stop implementation immediately
→ Log [AMBIGUITY: FR-XX] with exact ambiguous statement
→ State your interpretation explicitly
→ Mark [IN CLARIFICATION] — move to next in queue
→ On clarification: update PRD, reopen FR-XX, implement
```

### TECHNICAL INFEASIBILITY
```
→ Do not silently implement a workaround
→ Log [INFEASIBILITY: FR-XX] — what is infeasible, why, what IS feasible
→ Propose alternative satisfying underlying intent
→ Mark DEFERRED pending PRD amendment
```

### EXTERNAL BLOCKER
```
→ Log [EXTERNAL BLOCK: FR-XX] — what is blocked, what is needed, who owns it
→ Estimate unblock date if known
→ Move to next unblocked requirement
→ Return to blocked requirements as batch when resolved
```

### NEW REQUIREMENT DISCOVERED
```
→ Do not implement undocumented requirements ad-hoc
→ Log [NEW REQUIREMENT DISCOVERED]
→ Add to PRD as [FR-NEW-XX] with priority assessment
→ Enters execution queue in correct priority position
```

### REGRESSION DISCOVERED
```
→ Stop all forward progress immediately
→ Log [REGRESSION: FR-XX broken by FR-YY implementation]
→ Fix regression before any new work
→ Re-run verification gate for regressed requirement
→ Log fix: [REGRESSION RESOLVED: FR-XX — root cause + fix applied]
```

---

## SESSION OPENING PROTOCOL

At the start of every implementation session:

1. **STATE POSITION:** "Resuming at: [FR-XX] — [title]. Previous session completed through [FR-YY]."
2. **VERIFY CHANGELOG:** "CHANGELOG.md last entry: [FR-YY — status]. Consistent with queue."
3. **CONFIRM NEXT:** "Next in queue: [FR-XX]. Priority: [P0/P1/P2/P3]. Risk: [LOW/MED/HIGH]."
4. **CHECK EXCEPTIONS:** "Open exceptions: [count]. Reviewing before proceeding."
   - Resolve any OPEN exceptions that are now unblocked before new work
5. **BEGIN LOOP:** Execute Loop Steps 1–5 for FR-XX.

---

## XML TAG REFERENCE

```
<requirement_brief>     Full brief before implementation begins
<pre_impl_review>       High-risk pre-implementation design review
<implementation>        The actual code / spec / config being produced
<verification_gate>     Structured check before marking COMPLETE
<changelog_entry>       Formatted entry ready for CHANGELOG.md
<tier_gate>             Tier completion review
<ambiguity>             Flagged ambiguity with interpretation stated
<external_block>        External blocker with owner + ETA
<deviation>             Documented departure from spec with justification
<regression>            Regression discovered + fix applied
<new_requirement>       Undocumented requirement discovered during implementation
```

---

## MASTER ACTIVATION

```
PRD → Ingest → Queue → Implement → Verify → Log → Repeat → Gate → Advance.

The loop does not change.
The loop does not have shortcuts.
The loop has exits only when every requirement is:
  COMPLETE, DEFERRED with reason, or BLOCKED with documented owner.
```

---

*PRD Sequential Implementation Engine v1.0 · Document C · Authority Tier 4 — Process Truth*
*The ceremony IS the discipline. The verification IS the quality. The changelog IS the trust.*
