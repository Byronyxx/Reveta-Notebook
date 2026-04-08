-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 0005: FR-09 Studio Artefacts + FR-10 Notebook Sharing
-- ═══════════════════════════════════════════════════════════════════════════

-- ── PART A: AUGMENT artifacts TABLE (FR-09) ──────────────────────────────────

-- Add artifact generation status
CREATE TYPE public.artifact_status AS ENUM (
  'pending',
  'generating',
  'ready',
  'error'
);

-- Add required columns to the existing artifacts table
ALTER TABLE public.artifacts
  ADD COLUMN IF NOT EXISTS title        TEXT,
  ADD COLUMN IF NOT EXISTS content      TEXT,            -- Generated markdown/HTML content
  ADD COLUMN IF NOT EXISTS status       public.artifact_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS error        TEXT,
  ADD COLUMN IF NOT EXISTS word_count   INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Updated_at trigger for artifacts
CREATE TRIGGER update_artifacts_modtime
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

-- ── PART B: notebook_shares TABLE (FR-10) ────────────────────────────────────

CREATE TYPE public.share_access AS ENUM ('view', 'edit');

DROP TABLE IF EXISTS public.notebook_shares CASCADE;

CREATE TABLE public.notebook_shares (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id   UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  shared_by     UUID NOT NULL REFERENCES auth.users(id),
  invitee_email TEXT NOT NULL,
  invitee_id    UUID REFERENCES auth.users(id),  -- NULL until accepted
  access_level  public.share_access NOT NULL DEFAULT 'view',
  token         TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),  -- Invite link token
  accepted_at   TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (notebook_id, invitee_email)
);

CREATE INDEX idx_notebook_shares_token       ON public.notebook_shares(token);
CREATE INDEX idx_notebook_shares_invitee_id  ON public.notebook_shares(invitee_id);
CREATE INDEX idx_notebook_shares_notebook_id ON public.notebook_shares(notebook_id);

-- RLS on notebook_shares
ALTER TABLE public.notebook_shares ENABLE ROW LEVEL SECURITY;

-- Notebook owner can see all shares for their notebooks
CREATE POLICY "share_select_owner"
ON public.notebook_shares FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.notebooks n
    WHERE n.id = notebook_id AND n.owner_id = auth.uid()
  )
);

-- Invitee can see their own invite
CREATE POLICY "share_select_invitee"
ON public.notebook_shares FOR SELECT
USING (invitee_id = auth.uid() OR invitee_email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Notebook owner/editor can create shares
CREATE POLICY "share_insert"
ON public.notebook_shares FOR INSERT
WITH CHECK (
  shared_by = auth.uid() AND
  user_has_notebook_access(notebook_id, 'edit')
);

-- Owner can revoke (update revoked_at) — invitee can accept (update invitee_id, accepted_at)
CREATE POLICY "share_update"
ON public.notebook_shares FOR UPDATE
USING (
  shared_by = auth.uid() OR
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Owner can hard-delete a share
CREATE POLICY "share_delete"
ON public.notebook_shares FOR DELETE
USING (shared_by = auth.uid());

-- ── PART C: UPDATE user_has_notebook_access FUNCTION (FR-10) ─────────────────
-- Extend the existing helper to also check notebook_shares for shared viewers/editors.

CREATE OR REPLACE FUNCTION user_has_notebook_access(
  check_notebook_id UUID,
  required_level access_level DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Owner always has full access
    SELECT 1 FROM public.notebooks n
    WHERE n.id = check_notebook_id
      AND n.owner_id = auth.uid()
  ) OR (
    -- Shared access — must be accepted and not revoked
    required_level = 'view' AND EXISTS (
      SELECT 1 FROM public.notebook_shares ns
      WHERE ns.notebook_id = check_notebook_id
        AND ns.invitee_id = auth.uid()
        AND ns.accepted_at IS NOT NULL
        AND ns.revoked_at IS NULL
    )
  ) OR (
    -- Edit-level shared access
    required_level = 'edit' AND EXISTS (
      SELECT 1 FROM public.notebook_shares ns
      WHERE ns.notebook_id = check_notebook_id
        AND ns.invitee_id = auth.uid()
        AND ns.access_level = 'edit'
        AND ns.accepted_at IS NOT NULL
        AND ns.revoked_at IS NULL
    )
  )
$$;
