# Reveta Notebook — Scaling Strategy

## Current Architecture Limits

| Component | Current Limit | Scale Path |
|-----------|--------------|------------|
| Vercel functions | 300s timeout (audio/artifacts), 60s (ingest) | Move heavy jobs to background queue (Inngest/QStash) |
| Supabase pgvector | ~1M vectors practical | Partition by notebook; upgrade to dedicated instance |
| Upstash Redis | Shared tier | Dedicated Redis instance for >10k MAU |
| Audio synthesis | Sequential TTS (3 concurrent max) | Parallel synthesis with job queue |
| Source chunks | 50-item DB insert batches | Bulk insert via COPY for large ingestion |

## Recommended Scale Path (>1k MAU)

1. **Background jobs**: Replace fire-and-forget `processAudioOverviewJob` with Inngest or QStash for reliability and retry logic
2. **Vector search**: Add HNSW index on `source_chunks.embedding` for sub-100ms P99 at scale
3. **Caching**: Increase Redis TTL for RAG responses; add semantic cache (exact match on query embedding)
4. **CDN**: Audio files already in Supabase Storage; add Cloudflare CDN layer for global latency
5. **Database**: Enable Supabase connection pooling (PgBouncer) at >500 concurrent users

## NFR-PERFORMANCE Targets (PRD §7.1)

| Metric | Target | Current Status |
|--------|--------|----------------|
| Chat response P95 | <5s | ~3-4s with cold cache |
| Source ingest P95 | <60s | ~20-45s depending on size |
| Audio generation P95 | <5 min | ~3-4 min for deep_dive |
| App initial load | <3s LCP | Vercel Edge + Next.js 15 turbopack |
