# DOCUMENT A — NotebookLM PRD v1.0
## Product Requirements Document · Google NotebookLM · March 2026

**Authority Tier:** 1 — PRODUCT TRUTH

## 1. EXECUTIVE SUMMARY
NotebookLM is Google's source-grounded AI research assistant. Core differentiator: **accuracy through source fidelity** — answers only from materials the user explicitly uploads, eliminating hallucination risk on user-provided content.

## 2. FUNCTIONAL REQUIREMENTS

### FR-01 — Source-Grounded Answers Only (P0)
Answers generated exclusively from user-uploaded sources. No knowledge injection from training data.

### FR-02 — Inline Citations to Source Passages (P0)
Every factual claim links to exact passage in source document. Citations clickable, navigate to precise location.

### FR-03 — Multi-Format Source Ingestion (P0)
Support: Google Docs/Slides/Sheets, PDF, DOCX, TXT, MD, URLs, YouTube URLs, 20+ audio formats.

### FR-04 — Per-Source Word & File Size Cap (P0)
Maximum 500,000 words OR 200MB per source. Hard limit, no silent truncation.

### FR-05 — Audio Overview Generation (5 Formats) (P0)
1. Deep Dive — two AI hosts, exploratory conversation
2. Brief — single host, under 2 minutes
3. Critique — two hosts debating source claims
4. Debate — two hosts arguing opposing positions
5. Lecture — single host, ~30 minutes structured walkthrough

### FR-06 — Audio Output in 80+ Languages (P1)
### FR-07 — Interactive Audio (Voice Join) (P1)
### FR-08 — Video Overview Generation (P1)

### FR-09 — Studio Artefacts (6 Output Types) (P1)
Study Guide, Briefing Doc, FAQ, Timeline, Mind Map, Slide Deck.

### FR-10 — Notebook Sharing & Permissions (P1)
View-only or edit access. Revoke access works immediately.

### FR-11 — Response Style Customisation (P1)
Length, formality, format preferences. Persistent per notebook.

### FR-12 — Mobile Share Sheet Integration (P1)
### FR-13 — Enterprise VPC-SC / IAM Controls (P0)

### FR-14 — No Model Training on User Data (P0)
User data NEVER used to train models. Enforced at infrastructure level.

### FR-15 — Selective Source Scoping per Query (P2)
### FR-16 — Audio Sharing Link & Download (P2)
### FR-17 — Mind Map Source Subset Scoping (P2)
### FR-18 — Chat Interface in 35+ Languages (P1)

## 3. NON-FUNCTIONAL REQUIREMENTS
- Audio generation: < 5 minutes P95
- Chat response: < 5 seconds P95
- Source ingest: < 60 seconds for docs under 100MB
- 99.9% uptime target
- WCAG AA compliance

*NotebookLM PRD v1.0 · March 2026 · Document A · Authority Tier 1 — Product Truth*
