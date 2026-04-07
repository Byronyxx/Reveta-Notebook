# Reveta Notebook — Scaling Strategy & GDPR Compliance
**TECH-SCALING · Authority Tier 4 · Version 1.0**

---

## 1. SCALING ARCHITECTURE

### Current Baseline
- **Deployment:** Vercel (serverless, three-region: iad1/lhr1/sin1)
- **Database:** Supabase Postgres (managed, horizontal read replicas on Pro/Enterprise)
- **Vector store:** pgvector on Supabase (co-located with DB)
- **Cache/rate-limit:** Upstash Redis (global edge nodes)
- **AI inference:** Anthropic API (externally scaled)
- **Storage:** Supabase Storage (S3-compatible, CDN-backed)

### Bottlenecks and Horizontal Scaling Paths

**1. Audio generation pipeline** (highest compute pressure)
- Current: fire-and-forget in Vercel serverless function (300s timeout)
- Scaling path: Move `processAudioOverviewJob` to a dedicated queue worker
  (e.g. Trigger.dev, Inngest, or BullMQ + Redis). Vercel function becomes
  a thin dispatcher that enqueues the job and returns immediately.
- Trigger: When audio queue depth >10 concurrent or P95 latency >3 min.
- Horizontal: Multiple worker replicas pull from the same queue.

**2. Artifact generation pipeline** (similar pattern to audio)
- Same architecture recommendation as audio.
- Separate queue preferred — different timeout profile than audio.

**3. pgvector RAG queries** (latency-sensitive, scales with notebook count)
- Current: single Supabase Postgres instance with pgvector index
- Scaling path: Read replica routing for `match_source_chunks` RPC.
  Supabase supports read replicas on Pro/Enterprise tiers.
- Index maintenance: HNSW index on `source_chunks.embedding` should be
  configured with `m=16, ef_construction=64` for production scale.
  Current: default IVFFlat. HNSW is faster at query time.
- Trigger: When P95 vector query latency >500ms.

**4. Ingest pipeline** (IO-bound, parallelisable)
- Current: synchronous within a 120s serverless function
- Scaling path: Queue-based with per-source workers. Chunking and
  embedding can be parallelised per source (current: sequential).
- Trigger: When source ingest P95 >45 seconds for <100MB files.

**5. Upstash Redis** (rate limiting + cache)
- Current: single global Redis instance via REST API
- Scaling path: Upstash Redis is already globally distributed.
  Upgrade to higher tier for throughput if rate limit errors appear.
- No architectural change needed for 10x scale.

---

## 2. CAPACITY TARGETS (PRD §7.3)

| Metric | Target | Current Mechanism | Scale Trigger |
|--------|--------|------------------|---------------|
| Uptime | 99.9% | Vercel + Supabase SLAs | Incident > 43 min/month |
| Regions | 180+ | Vercel edge network | Already met via iad1/lhr1/sin1 |
| Chat P95 | <5s | Upstash cache + pgvector | >5s P95 for 7 days |
| Audio gen | <5min | Serverless 300s timeout | >5min P95 for 3 days |
| Ingest | <60s | Serverless 120s timeout | >60s P95 for 3 days |

---

## 3. GDPR COMPLIANCE

### Data Processing Basis
User content (notebook sources, chat messages, audio scripts) is processed
under **Article 6(1)(b)** — performance of a contract — when the user
uploads sources and requests AI analysis. No consent is required for core
product function.

### Data Residency
Supabase allows project region selection at creation time. EU users should
use an EU-region Supabase project (eu-central-1 or eu-west-1). The current
default `iad1` region is US-based. For GDPR compliance:
- **Action required:** Offer EU data residency as a setting on org creation.
- **Interim:** Document in privacy policy that data is processed in the US
  under Standard Contractual Clauses (Supabase provides these).

### Data Retention
| Data Type | Retention | Deletion Mechanism |
|-----------|-----------|-------------------|
| Notebook sources + chunks | User-controlled | DELETE /api/sources/[id] cascades chunks |
| Chat messages | User-controlled | Notebook deletion cascades all chats/messages |
| Audio overviews | User-controlled | DELETE /api/audio-overviews/[id] + storage delete |
| Artifacts | User-controlled | DELETE /api/artifacts/[id] |
| Profiles | Account deletion | Supabase auth.users DELETE cascades to profiles |
| Audit log | 90 days | Scheduled Supabase cron (to be implemented) |

### Right to Erasure (Article 17)
- All user data is scoped to `auth.uid()` via RLS.
- Account deletion: `supabase.auth.admin.deleteUser(userId)` triggers
  cascade deletes on profiles → notebooks → all user content.
- **Gap:** Storage objects (audio files) are not automatically deleted
  when the audio_overviews row is deleted. A database trigger or
  application-level hook is needed. Tracked as SCALING-DEBT-001.

### Third-Party Sub-processors
| Processor | Purpose | DPA | Region |
|-----------|---------|-----|--------|
| Anthropic | AI inference | Anthropic DPA | US |
| OpenAI | Embeddings, TTS | OpenAI DPA | US |
| Supabase | Database, Auth, Storage | Supabase DPA + SCCs | US / EU optional |
| Upstash | Cache, Rate limiting | Upstash DPA | Global edge |
| Vercel | Hosting, CDN | Vercel DPA | Global edge |

### No Model Training (FR-14)
Anthropic's API does not train on submitted content by default.
OpenAI's API does not train on API-submitted content (zero data retention
policy available on request for Enterprise tier).
This is documented in the privacy policy and enforced at the infrastructure
level — no user data is routed to any training pipeline.

---

## 4. OPEN SCALING DEBT

| ID | Issue | Severity | Resolution Path |
|----|-------|----------|----------------|
| SCALING-DEBT-001 | Storage objects not auto-deleted on audio_overviews DELETE | HIGH | Add Postgres trigger or application hook to delete from storage bucket |
| SCALING-DEBT-002 | pgvector using IVFFlat index — should upgrade to HNSW at scale | MEDIUM | Migration to add HNSW index when source_chunks > 100k rows |
| SCALING-DEBT-003 | Audio + artifact pipelines run in Vercel serverless — no queue | MEDIUM | Implement Inngest or Trigger.dev queue when concurrent jobs >5 |
| SCALING-DEBT-004 | EU data residency not yet offered | HIGH | Supabase project region selector on org creation |
| SCALING-DEBT-005 | Audit log has no retention cron | LOW | Supabase pg_cron to delete audit_log rows older than 90 days |
