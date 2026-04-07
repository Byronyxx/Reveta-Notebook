-- FR-05: Audio Overview Generation — Database Schema
-- Creates audio_overviews table and Supabase Storage bucket policy.

-- ── 1. AUDIO FORMAT ENUM ─────────────────────────────────────────────────────
CREATE TYPE public.audio_format AS ENUM (
  'deep_dive',   -- Two AI hosts, exploratory conversation (flagship)
  'brief',       -- Single host, under 2 minutes, dense summary
  'critique',    -- Two hosts debating the source's claims
  'debate',      -- Two hosts arguing opposing positions on source content
  'lecture'      -- Single host, ~30 min, structured deep walkthrough
);

-- ── 2. AUDIO OVERVIEW STATUS ENUM ────────────────────────────────────────────
CREATE TYPE public.audio_status AS ENUM (
  'pending',
  'generating_script',
  'synthesizing',
  'ready',
  'error'
);

-- ── 3. AUDIO OVERVIEWS TABLE ──────────────────────────────────────────────────
CREATE TABLE public.audio_overviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id     UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  creator_id      UUID NOT NULL REFERENCES auth.users(id),
  format          public.audio_format NOT NULL,
  language        TEXT NOT NULL DEFAULT 'en',
  status          public.audio_status NOT NULL DEFAULT 'pending',
  script          TEXT,                -- Raw generated script (before TTS)
  storage_path    TEXT,                -- Supabase Storage path to final MP3
  duration_seconds INTEGER,           -- Approximate total duration once ready
  error           TEXT,
  metadata        JSONB DEFAULT '{}',  -- e.g. { word_count, source_count, model }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. UPDATED_AT TRIGGER ─────────────────────────────────────────────────────
CREATE TRIGGER update_audio_overview_modtime
  BEFORE UPDATE ON public.audio_overviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

-- ── 5. RLS POLICIES ──────────────────────────────────────────────────────────
ALTER TABLE public.audio_overviews ENABLE ROW LEVEL SECURITY;

-- Creators can read their own overviews; shared viewers can read too
CREATE POLICY "audio_overview_select"
ON public.audio_overviews FOR SELECT
USING (
  creator_id = auth.uid() OR
  user_has_notebook_access(notebook_id, 'view')
);

-- Only notebook editors can insert
CREATE POLICY "audio_overview_insert"
ON public.audio_overviews FOR INSERT
WITH CHECK (
  user_has_notebook_access(notebook_id, 'edit') AND
  creator_id = auth.uid()
);

-- Creators can delete their own
CREATE POLICY "audio_overview_delete"
ON public.audio_overviews FOR DELETE
USING (creator_id = auth.uid());

-- Service role updates status (via Supabase service client during background job)
-- RLS bypass handled via service_role key in the background pipeline.
-- For standard auth context, allow creator to update (covers error reporting):
CREATE POLICY "audio_overview_update"
ON public.audio_overviews FOR UPDATE
USING (creator_id = auth.uid());

-- ── 6. STORAGE BUCKET POLICY NOTE ────────────────────────────────────────────
-- Run in Supabase Dashboard Storage:
--   CREATE BUCKET 'audio-overviews' WITH (public = false);
-- Then add RLS on the storage.objects table scoped to this bucket.
-- The pipeline uses the service_role key to upload — no additional
-- client-side storage policy is required for basic operation.
