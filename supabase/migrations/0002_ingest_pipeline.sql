-- FR-03: Multi-Format Source Ingestion
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.sources ADD COLUMN status TEXT NOT NULL DEFAULT 'pending', ADD COLUMN error TEXT, ADD COLUMN metadata JSONB DEFAULT '{}';

CREATE TABLE public.source_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.sources(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.source_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_chunks_owner" ON public.source_chunks FOR ALL USING (EXISTS (SELECT 1 FROM public.sources s WHERE s.id = source_chunks.source_id AND s.uploader_id = auth.uid()));
