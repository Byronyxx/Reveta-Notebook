-- FR-05: Audio Overview Generation
CREATE TYPE public.audio_format AS ENUM ('deep_dive', 'brief', 'critique', 'debate', 'lecture');
CREATE TYPE public.audio_status AS ENUM ('pending', 'generating_script', 'synthesizing', 'ready', 'error');

CREATE TABLE public.audio_overviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  format public.audio_format NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  status public.audio_status NOT NULL DEFAULT 'pending',
  script TEXT,
  storage_path TEXT,
  duration_seconds INTEGER,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_audio_overview_modtime BEFORE UPDATE ON public.audio_overviews FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

ALTER TABLE public.audio_overviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audio_overview_select" ON public.audio_overviews FOR SELECT USING (creator_id = auth.uid() OR user_has_notebook_access(notebook_id, 'view'));
CREATE POLICY "audio_overview_insert" ON public.audio_overviews FOR INSERT WITH CHECK (user_has_notebook_access(notebook_id, 'edit') AND creator_id = auth.uid());
CREATE POLICY "audio_overview_delete" ON public.audio_overviews FOR DELETE USING (creator_id = auth.uid());
CREATE POLICY "audio_overview_update" ON public.audio_overviews FOR UPDATE USING (creator_id = auth.uid());
