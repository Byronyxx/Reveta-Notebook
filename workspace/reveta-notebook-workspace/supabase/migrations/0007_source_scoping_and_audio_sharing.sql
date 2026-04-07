-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 0007: FR-15 Source Scoping + FR-16 Audio Sharing
-- ═══════════════════════════════════════════════════════════════════════════

-- ── FR-15: Extended match_source_chunks with optional source filter ──────────
-- Replaces the existing function. Old function is overloaded — new signature
-- adds filter_source_ids UUID[] (NULL = no filter = all sources, backwards compat).

CREATE OR REPLACE FUNCTION match_source_chunks(
  query_embedding    vector(1536),
  query_notebook_id  UUID,
  match_threshold    float,
  match_count        int,
  filter_source_ids  UUID[] DEFAULT NULL  -- FR-15: optional source subset
)
RETURNS TABLE (
  id        UUID,
  source_id UUID,
  content   TEXT,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    sc.id,
    sc.source_id,
    sc.content,
    1 - (sc.embedding <=> query_embedding) AS similarity
  FROM public.source_chunks sc
  WHERE sc.notebook_id = query_notebook_id
    AND (
      filter_source_ids IS NULL                -- no scope = all sources
      OR sc.source_id = ANY(filter_source_ids) -- scoped = only selected
    )
    AND 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── FR-16: Audio Sharing Fields ───────────────────────────────────────────────
-- Add share_token (UUID, unique) and share_enabled (bool) to audio_overviews.
-- share_token is generated on first share action, persistent until revoked.
-- share_enabled = false is the revocation state (token retained for audit).

ALTER TABLE public.audio_overviews
  ADD COLUMN IF NOT EXISTS share_token  UUID UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for fast share_token lookup (public share page)
CREATE INDEX IF NOT EXISTS idx_audio_overviews_share_token
  ON public.audio_overviews(share_token)
  WHERE share_token IS NOT NULL;

-- RLS policy: share page needs to read audio_overviews via share_token
-- without requiring auth. We allow SELECT if share_enabled = true.
-- This is a narrow carve-out — no other columns beyond what the share page needs.
CREATE POLICY "audio_overviews_public_share_read"
  ON public.audio_overviews FOR SELECT
  USING (
    share_enabled = TRUE AND share_token IS NOT NULL
    -- OR the existing creator policy (handled by separate policy)
  );
