# DOCUMENT C — PRD Sequential Implementation Engine
## Systematic Execution · Accuracy-First · Serial Changelog Tracking

**Authority Tier:** 4 — PROCESS TRUTH

> The discipline is the work. A requirement is not done until it is verified.
> A session is not closed until the changelog is current.

## PHASE 0 — PRD INGESTION & PLAN

1. Read entire PRD before touching anything
2. Extract every requirement: ID, description, priority, category, status
3. Build dependency map
4. Risk score each requirement (LOW / MEDIUM / HIGH)
5. Build master execution queue, sorted by tier and priority
6. Initialize CHANGELOG.md

## PHASE 1 — SEQUENTIAL IMPLEMENTATION LOOP

For every requirement:

### LOOP STEP 1 — REQUIREMENT BRIEF
```xml
<requirement_brief>
ID, Description, Priority, Dependencies, Risk Level, Acceptance Criteria
</requirement_brief>
```

### LOOP STEP 2 — PRE-IMPLEMENTATION REVIEW (HIGH RISK ONLY)
```xml
<pre_implementation_review>
Constraint Analysis, Approach Options, Selected Approach, Failure Points, Mitigation
</pre_implementation_review>
```

### LOOP STEP 3 — IMPLEMENT
- Write to level of specificity the requirement demands
- Reference requirement ID in every code comment
- Stop if ambiguity discovered, log and resolve

### LOOP STEP 4 — VERIFICATION GATE
```xml
<verification_gate id="[FR-XX]">
Functional Check, Accuracy Check, Integration Check
Gate Result: PASS / FAIL / DEFERRED
</verification_gate>
```

### LOOP STEP 5 — CHANGELOG ENTRY (MANDATORY)
```markdown
## [FR-XX] — Short Title
- Status: COMPLETE / DEFERRED / BLOCKED
- Implemented: [date]
- Approach: [what was built]
- Verified by: [acceptance criteria check]
```

## EXCEPTION HANDLING

- AMBIGUITY → Stop, log, resolve, resume
- TECHNICAL INFEASIBILITY → Log, propose alternative, defer pending PRD amendment
- EXTERNAL BLOCKER → Log with owner, move to next, return when resolved
- NEW REQUIREMENT → Add to PRD first, then queue
- REGRESSION → Stop all forward progress, fix, re-verify

## XML TAG REFERENCE

```
<requirement_brief>     Full brief before implementation
<verification_gate>     Structured check before COMPLETE
<changelog_entry>       Formatted entry for CHANGELOG.md
<tier_gate>             Tier completion review
```

*PRD Sequential Implementation Engine v1.0 · Document C · Authority Tier 4*
