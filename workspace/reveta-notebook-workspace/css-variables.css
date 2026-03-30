-- FR-01: Source-Grounded Answers similarity search RPC

CREATE OR REPLACE FUNCTION match_source_chunks(
  query_embedding vector(1536),
  query_notebook_id UUID,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  content TEXT,
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
  JOIN public.sources s ON s.id = sc.source_id
  WHERE sc.notebook_id = query_notebook_id
    -- RLS bypass locally inside query if user is validated at RPC bound, 
    -- but usually we run STABLE and it applies RLS automatically.
    AND 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
$$;
