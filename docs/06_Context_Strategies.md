# Reveta Notebook — Context Engineering Architectures

## 1. Chat & Scoped Queries (FR-01 / FR-15)

- **WRITE**: System prompt grounding Claude to sources only, with inline citation format `[Source: ChunkID]`
- **SELECT**: pgvector cosine similarity search, filtered by `notebook_id` and optionally `source_ids` (FR-15)
- **COMPRESS**: Last 5 chat turns, chunks truncated to 300 tokens with 50-token overlap
- **ISOLATE**: Prompt injection defence — explicit bounds denying persona shifts or action execution

## 2. Audio Overview Generation (FR-05)

- **WRITE**: Format-specific system prompts (deep_dive, brief, critique, debate, lecture) in `lib/ai/prompts.ts`
- **SELECT**: Full source context synthesis (no vector retrieval) — MAX_CONTEXT_CHARS = 80,000
- **COMPRESS**: If sources exceed limit, truncation notice is added; map-reduce summarisation for very large sets
- **ISOLATE**: Format contracts enforced via versioned prompts; 1-shot structure examples embedded

## 3. Studio Artifacts (FR-09 / FR-17)

- **WRITE**: 6 format-specific system prompts (study_guide, brief, faq, timeline, mind_map, slide_deck)
- **SELECT**: Full source context, optionally scoped via FR-17 `filterSourceIds`
- **COMPRESS**: MAX_CONTEXT_CHARS = 80,000; truncation notice on overflow
- **ISOLATE**: Output schema enforced by markdown structure requirements in prompt
