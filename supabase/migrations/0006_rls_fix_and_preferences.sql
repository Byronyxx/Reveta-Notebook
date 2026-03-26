-- RLS Fix + FR-11 Style Preference + FR-18 Language Preference
DROP POLICY IF EXISTS "source_chunks_owner" ON public.source_chunks;

CREATE POLICY "source_chunks_write" ON public.source_chunks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.sources s WHERE s.id = source_chunks.source_id AND s.uploader_id = auth.uid()));
CREATE POLICY "source_chunks_read" ON public.source_chunks FOR SELECT USING (EXISTS (SELECT 1 FROM public.sources s WHERE s.id = source_chunks.source_id AND (s.uploader_id = auth.uid() OR user_has_notebook_access(s.notebook_id, 'view'))));

ALTER TABLE public.notebooks ADD COLUMN IF NOT EXISTS style_preference JSONB DEFAULT '{"length": "medium", "formality": "neutral", "format": "prose"}';
ALTER TABLE public.notebooks ADD COLUMN IF NOT EXISTS response_language TEXT NOT NULL DEFAULT 'en';
CREATE INDEX IF NOT EXISTS idx_notebooks_language ON public.notebooks(response_language);
