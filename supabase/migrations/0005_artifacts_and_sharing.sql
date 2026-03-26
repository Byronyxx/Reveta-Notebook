-- FR-09 Studio Artifacts + FR-10 Notebook Sharing
CREATE TYPE public.artifact_status AS ENUM ('pending', 'generating', 'ready', 'error');

ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS status public.artifact_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS word_count INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER update_artifacts_modtime BEFORE UPDATE ON public.artifacts FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

CREATE TYPE public.share_access AS ENUM ('view', 'edit');

CREATE TABLE public.notebook_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id),
  access_level public.share_access NOT NULL DEFAULT 'view',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notebook_id, invitee_email)
);

CREATE INDEX idx_notebook_shares_token ON public.notebook_shares(token);
CREATE INDEX idx_notebook_shares_invitee_id ON public.notebook_shares(invitee_id);
CREATE INDEX idx_notebook_shares_notebook_id ON public.notebook_shares(notebook_id);

ALTER TABLE public.notebook_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "share_select_owner" ON public.notebook_shares FOR SELECT USING (EXISTS (SELECT 1 FROM public.notebooks n WHERE n.id = notebook_id AND n.owner_id = auth.uid()));
CREATE POLICY "share_select_invitee" ON public.notebook_shares FOR SELECT USING (invitee_id = auth.uid() OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "share_insert" ON public.notebook_shares FOR INSERT WITH CHECK (shared_by = auth.uid() AND user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "share_update" ON public.notebook_shares FOR UPDATE USING (shared_by = auth.uid() OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "share_delete" ON public.notebook_shares FOR DELETE USING (shared_by = auth.uid());

CREATE OR REPLACE FUNCTION user_has_notebook_access(check_notebook_id UUID, required_level access_level DEFAULT 'view')
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.notebooks n WHERE n.id = check_notebook_id AND n.owner_id = auth.uid())
  OR (required_level = 'view' AND EXISTS (SELECT 1 FROM public.notebook_shares ns WHERE ns.notebook_id = check_notebook_id AND ns.invitee_id = auth.uid() AND ns.accepted_at IS NOT NULL AND ns.revoked_at IS NULL))
  OR (required_level = 'edit' AND EXISTS (SELECT 1 FROM public.notebook_shares ns WHERE ns.notebook_id = check_notebook_id AND ns.invitee_id = auth.uid() AND ns.access_level = 'edit' AND ns.accepted_at IS NOT NULL AND ns.revoked_at IS NULL))
$$;
