-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 0006: RLS Fix + FR-11 Style Preference + FR-18 Language Preference
-- ═══════════════════════════════════════════════════════════════════════════

-- ── PART A: FIX source_chunks RLS FOR SHARED VIEWERS (DEBT-01) ───────────────
-- The existing "source_chunks_owner" policy only allows the uploader.
-- Shared notebook viewers (accepted, non-revoked) cannot execute RAG queries.
-- This fix adds a second SELECT policy for shared access.
-- We drop and replace with split read/write policies for clarity.

DROP POLICY IF EXISTS "source_chunks_owner" ON public.source_chunks;

-- Writers (upload/ingest): only the uploader via source ownership
CREATE POLICY "source_chunks_write"
ON public.source_chunks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.id = source_chunks.source_id
      AND s.uploader_id = auth.uid()
  )
);

-- Readers: uploader OR accepted shared notebook viewer/editor
CREATE POLICY "source_chunks_read"
ON public.source_chunks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.id = source_chunks.source_id
    AND (
      -- Direct owner of the source
      s.uploader_id = auth.uid()
      OR
      -- Shared notebook viewer with accepted, non-revoked access
      user_has_notebook_access(s.notebook_id, 'view')
    )
  )
);

-- Service role bypass for background ingest pipeline (no change needed —
-- service_role key bypasses RLS at Supabase level by default).

-- ── PART B: PER-NOTEBOOK STYLE PREFERENCE FOR FR-11 ────────────────────────
-- PRD specifies "style settings persist per notebook" (not per user globally).
-- Adding style_preference JSONB to notebooks table.
-- profiles.style_preference remains as the global default (used as seed value
-- when creating new notebooks).

ALTER TABLE public.notebooks
  ADD COLUMN IF NOT EXISTS style_preference JSONB DEFAULT '{
    "length": "medium",
    "formality": "neutral",
    "format": "prose"
  }';

-- ── PART C: PER-NOTEBOOK LANGUAGE PREFERENCE FOR FR-18 ─────────────────────
-- RAG responses will be localised to this language setting.

ALTER TABLE public.notebooks
  ADD COLUMN IF NOT EXISTS response_language TEXT NOT NULL DEFAULT 'en';

-- Index for language-based queries (future analytics use)
CREATE INDEX IF NOT EXISTS idx_notebooks_language
  ON public.notebooks(response_language);
