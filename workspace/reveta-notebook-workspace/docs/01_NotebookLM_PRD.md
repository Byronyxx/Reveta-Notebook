# DOCUMENT A — NotebookLM PRD v1.0
## Product Requirements Document · Google NotebookLM · March 2026

**Authority Tier:** 1 — PRODUCT TRUTH
**Status:** Active · Version 1.0
**Role in System:** Defines WHAT to build — features, limits, requirements, constraints

---

> **Reading Note:** This is the governing product specification. Every feature decision,
> design token, and implementation choice must be traceable to a requirement in this document.
> When this document conflicts with any other — this document wins.

---

## 1. EXECUTIVE SUMMARY

NotebookLM (notebooklm.google.com) is Google's source-grounded AI research assistant.
Its core differentiator is **accuracy through source fidelity** — it answers only from
materials the user explicitly uploads, eliminating hallucination risk on user-provided content.

**Key Scale Indicators (as of March 2026):**
- 350+ years of Audio Overview content generated since September 2024 launch
- 35+ chat interface languages
- 80+ audio output languages
- Four pricing tiers (Free → Plus → Pro → Ultra)

---

## 2. PRODUCT VISION & STRATEGIC POSITIONING

**Vision Statement:**
> "The definitive AI thinking partner grounded in sources users trust."

### 2.1 Core Differentiators vs. Competitors

| Dimension | NotebookLM | ChatGPT | Perplexity | MS Copilot |
|-----------|-----------|---------|-----------|-----------|
| Source grounding | User-only | Mixed | Web-first | Mixed |
| Citation style | Exact passage | General | URL-link | General |
| Audio formats | 5 types | None | None | None |
| Enterprise isolation | VPC-SC | Basic | Basic | Azure-tied |
| Free tier | Generous | Limited | Limited | Workspace-tied |

### 2.2 Strategic Moat
- **Data moat:** Source-only grounding creates a trust layer competitors cannot replicate without user re-upload
- **Format moat:** 5 audio formats + interactive audio is a unique product surface
- **Enterprise moat:** VPC-SC compliance opens regulated industries (legal, medical, finance)
- **Ecosystem moat:** Native Google Workspace integration (Docs, Slides, Sheets)

---

## 3. TARGET USERS & PRIMARY USE CASES

### Segment 1: Researchers & Academics
- Upload papers, books, datasets
- Generate structured literature reviews
- Create citation-verified summaries
- Audio overviews for passive consumption

### Segment 2: Enterprise Knowledge Workers
- Onboarding documentation synthesis
- Policy + procedure Q&A
- Meeting summary + action item extraction
- Regulated-environment compliance (VPC-SC)

### Segment 3: Students
- Lecture note synthesis
- Textbook → study guide conversion
- Exam prep via FAQ and quiz generation
- Audio study material while commuting

### Segment 4: Content Creators & Journalists
- Research synthesis across sources
- Interview prep from background docs
- Fact-checking against uploaded sources
- Podcast content from research materials

### Segment 5: Regulated Professionals (Legal / Medical / Finance)
- Case file synthesis
- Regulatory document Q&A
- Privacy-guaranteed source isolation
- Audit trail for AI-assisted work

---

## 4. FUNCTIONAL REQUIREMENTS

> **Priority Legend:** P0 = Must ship | P1 = High priority | P2 = Important | P3 = Nice to have

### FR-01 — Source-Grounded Answers Only
**Priority:** P0 | **Category:** Accuracy
Answers must be generated exclusively from user-uploaded sources.
No knowledge injection from training data without explicit disclosure.
Every answer must be attributable to a specific source in the notebook.
**Acceptance Criteria:** Zero answers reference information not present in uploaded sources.

---

### FR-02 — Inline Citations to Source Passages
**Priority:** P0 | **Category:** Accuracy
Every factual claim in a response must link to the exact passage in the source document.
Citations must be clickable and navigate to the precise location in the source.
**Acceptance Criteria:** 100% of factual claims have navigable inline citations.

---

### FR-03 — Multi-Format Source Ingestion
**Priority:** P0 | **Category:** Ingest
Support all of:
Google Docs, Google Slides, Google Sheets, PDF, DOCX, TXT, MD,
URLs (web pages), YouTube video URLs, 20+ audio formats.
**Acceptance Criteria:** All listed formats successfully ingest and are queryable.

---

### FR-04 — Per-Source Word & File Size Cap
**Priority:** P0 | **Category:** Ingest
Maximum 500,000 words OR 200MB per source, whichever is reached first.
Exceeding either limit triggers a clear error with remediation guidance.
**Acceptance Criteria:** Cap enforced at ingest time. No silent truncation.

---

### FR-05 — Audio Overview Generation (5 Formats)
**Priority:** P0 | **Category:** Audio
Generate audio from notebook sources in all five formats:
1. **Deep Dive** — two AI hosts in exploratory conversation (flagship)
2. **Brief** — single host, under 2 minutes, high-density summary
3. **Critique** — two hosts debating the source material's claims
4. **Debate** — two hosts arguing opposing positions on source content
5. **Lecture** — single host, ~30 minutes, in-depth structured walkthrough (IN TESTING as of Dec 2025)
**Acceptance Criteria:** All 5 formats generate successfully from any valid source set.

---

### FR-06 — Audio Output in 80+ Languages
**Priority:** P1 | **Category:** Audio
All audio formats must be available in 80+ languages.
Language selection must be intuitive and persistent per notebook.
**Acceptance Criteria:** Audio generates correctly in all 80+ specified languages.

---

### FR-07 — Interactive Audio (Voice Join)
**Priority:** P1 | **Category:** Audio
Users can join live audio sessions via microphone.
Users can query AI hosts in real time during playback.
Hosts must respond within acceptable latency (<5 seconds).
**Acceptance Criteria:** Voice join works. Real-time Q&A responds within 5 seconds.

---

### FR-08 — Video Overview Generation
**Priority:** P1 | **Category:** Video
Generate video overviews from notebook sources.
Minimum 6 distinct visual styles via the Nano Banana model.
Video must be exportable and shareable.
**Acceptance Criteria:** 6 visual styles render correctly. Export works.

---

### FR-09 — Studio Artefacts (6 Output Types)
**Priority:** P1 | **Category:** Studio
Generate all six studio output types from notebook sources:
Study Guide, Briefing Doc, FAQ, Timeline, Mind Map, Slide Deck.
Each artefact type is independently configurable and exportable.
**Acceptance Criteria:** All 6 types generate from valid source sets.

---

### FR-10 — Notebook Sharing & Permissions
**Priority:** P1 | **Category:** Collaboration
Share notebooks with view-only or edit access.
Shared notebooks must respect the original source access model.
Revoke access must work immediately.
**Acceptance Criteria:** Sharing, view/edit gating, and revocation all function correctly.

---

### FR-11 — Response Style Customisation
**Priority:** P1 | **Category:** Chat
Plus+ tier users can configure response length, formality level, and output format preferences.
Style settings persist per notebook.
**Acceptance Criteria:** Style settings apply to all subsequent responses in that notebook.

---

### FR-12 — Mobile Share Sheet Integration (20+ Source Types)
**Priority:** P1 | **Category:** Mobile
iOS and Android share sheet captures content from 20+ app types directly into a notebook.
Share-to-notebook must complete ingest within 30 seconds.
**Acceptance Criteria:** Share sheet works on iOS and Android for all 20+ supported app types.

---

### FR-13 — Enterprise VPC-SC / IAM Controls
**Priority:** P0 | **Category:** Security
Full VPC Service Controls (VPC-SC) support for enterprise deployments.
IAM integration with Google Workspace Admin console.
Data must never leave the customer's defined perimeter.
**Acceptance Criteria:** VPC-SC enforced. IAM roles respected. Zero perimeter violations.

---

### FR-14 — No Model Training on User Data
**Priority:** P0 | **Category:** Privacy
User-uploaded sources and generated content must NEVER be used to train Google's models.
This policy must be enforced at infrastructure level, not just policy level.
Privacy disclosure must be visible and accessible in all tiers.
**Acceptance Criteria:** Technical audit confirms zero training data pipeline access to user notebooks.

---

### FR-15 — Selective Source Scoping per Query
**Priority:** P2 | **Category:** Chat
Users can specify which sources within a notebook a query applies to.
Multi-source notebooks return results attributable to the correct source.
**Acceptance Criteria:** Query scoping correctly limits retrieval to selected sources.

---

### FR-16 — Audio Sharing Link & Download
**Priority:** P2 | **Category:** Audio
Generated audio can be shared via link (view-only) or downloaded as audio file.
Shared links are revocable by the notebook owner.
**Acceptance Criteria:** Share links work. Downloads produce valid audio files. Revocation is immediate.

---

### FR-17 — Mind Map Source Subset Scoping
**Priority:** P2 | **Category:** Studio
When generating a Mind Map, users can select a subset of notebook sources.
Mind Map accurately reflects only the selected source content.
**Acceptance Criteria:** Mind Map correctly scopes to and represents selected sources only.

---

### FR-18 — Chat Interface in 35+ Languages
**Priority:** P1 | **Category:** i18n
Chat interface (queries, responses, UI labels) supports 35+ languages.
Language detection is automatic with manual override available.
**Acceptance Criteria:** All 35+ languages render correctly in UI and chat.

---

## 5. PRICING TIERS

| Feature | Free | Plus (Workspace) | Pro ($19.99/mo) | Ultra ($249.99/mo) |
|---------|------|------------------|-----------------|--------------------|
| Notebooks | 100 | 200 | 500 | 500+ |
| Sources per notebook | 50 | 100 | 300 | 600 |
| Queries per day | 50 | 200 | 500 | 1,000+ |
| Audio overviews per day | 3 | 10 | 20 | 50+ |
| Model training on data | Never | Never | Never | Never |

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### NFR — Performance (§7.1)
- Audio generation: < 5 minutes from source set to playback-ready
- Chat response: < 5 seconds P95 latency
- Source ingest: < 60 seconds for documents under 100MB
- Video generation: < 10 minutes for standard-length video

### NFR — Security & Privacy (§7.2)
- VPC-SC enforcement for enterprise tier
- IAM role integration with Google Workspace
- Audit trail for all AI-assisted operations
- Zero model training on user content (all tiers)

### NFR — Availability & Scalability (§7.3)
- 180+ regional availability
- 99.9% uptime target
- Horizontal scaling for audio generation pipeline

### NFR — Accessibility & i18n (§7.4)
- 35+ chat languages
- 80+ audio output languages
- iOS and Android mobile parity
- WCAG AA compliance for web interface

---

## 7. KNOWN LIMITATIONS (Active as of March 2026)

| Limitation | Friction Level | Users Affected | Strategic Impact |
|-----------|---------------|----------------|-----------------|
| Cloud-only (no offline) | HIGH | Field workers, regulated orgs | Blocks enterprise use cases |
| Gemini-only (no BYO model) | HIGH | Privacy-first enterprise | Alienates security-conscious segment |
| Google ecosystem connectors only | MEDIUM | Notion, Obsidian, Apple Notes users | Fragmented workflows |
| 500K word cap per source | MEDIUM | Legal, academic, book-length docs | Blocks long-document use cases |
| No in-audio citations | MEDIUM | Fact-checkers, academics | Forces context switch out of audio |
| DRM/paywalled content | LOW | Researchers with subscription access | Reduces source breadth |

---

## 8. ROADMAP & STRATEGIC OPPORTUNITIES

### Near-Term (Q2-Q3 2026)
- Lecture mode out of testing → general availability
- Additional voice options for audio formats
- Video Brief and Video Explainer formats

### Strategic (H2 2026+)
- Third-party connector integrations (Notion, Obsidian, Apple Notes)
- Offline / local processing mode for regulated industries
- In-audio citation playback
- Developer API for programmatic notebook access
- Real-time collaborative notebooks
- Extended source word limits for enterprise tier

---

## 9. SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Active Users | YoY growth | Analytics |
| Free-to-paid conversion | > 5% | Billing data |
| Notebooks created per user per month | > 3 | Analytics |
| Audio overviews generated per day | Platform-wide | Infrastructure |
| Interactive audio participation rate | > 15% of audio sessions | Events |
| Studio artefact generation rate | > 40% of active notebooks | Analytics |
| Citation click-through | > 25% of cited responses | Events |
| NPS by segment | > 60 | User surveys |

---

## 10. RISK REGISTER

| Risk | Level | Mitigation |
|------|-------|-----------|
| AI inaccuracy in audio (hallucination) | HIGH | Source-only grounding; citation requirement |
| Source bias propagation | MEDIUM | User education; source diversity prompts |
| Competitive encroachment (Perplexity, OpenAI) | MEDIUM | Audio moat; enterprise compliance differentiation |
| Data privacy perception | MEDIUM | FR-14 technical enforcement + visible disclosure |
| Google ecosystem lock-in friction | LOW-MED | Third-party connector roadmap |

---

*NotebookLM PRD v1.0 · March 2026 · Document A in Reveta Notebook Implementation System*
*Authority Tier 1 — Product Truth — governs all implementation decisions*
