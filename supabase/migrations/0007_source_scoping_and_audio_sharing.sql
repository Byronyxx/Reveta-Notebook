-- FR-15 Source Scoping + FR-16 Audio Sharing
CREATE OR REPLACE FUNCTION match_source_chunks(query_embedding vector(1536), query_notebook_id UUID, match_threshold float, match_count int, filter_source_ids UUID[] DEFAULT NULL)
RETURNS TABLE (id UUID, source_id UUID, content TEXT, similarity float)
LANGUAGE sql STABLE AS $$
  SELECT sc.id, sc.source_id, sc.content, 1 - (sc.embedding <=> query_embedding) AS similarity
  FROM public.source_chunks sc
  WHERE sc.notebook_id = query_notebook_id
    AND (filter_source_ids IS NULL OR sc.source_id = ANY(filter_source_ids))
    AND 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
$$;

ALTER TABLE public.audio_overviews ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT NULL, ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_audio_overviews_share_token ON public.audio_overviews(share_token) WHERE share_token IS NOT NULL;
CREATE POLICY "audio_overviews_public_share_read" ON public.audio_overviews FOR SELECT USING (share_enabled = TRUE AND share_token IS NOT NULL);
