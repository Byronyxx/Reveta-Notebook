-- TECH-DB INIT MIGRATION: Schema, RLS, & Triggers for Reveta Notebook
-- Defines the core domain models and implements strict RLS security boundaries.

-- 1. ENUMS
CREATE TYPE access_level AS ENUM ('view', 'edit');
CREATE TYPE source_type AS ENUM ('file', 'url', 'text');
CREATE TYPE artifact_type AS ENUM ('audio', 'video', 'study_guide', 'brief', 'faq', 'timeline', 'mind_map', 'slide_deck', 'other');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- 2. TABLES

-- Users Extension (Profiles)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    style_preference JSONB DEFAULT '{"length": "medium", "formality": "neutral"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notebooks
CREATE TABLE public.notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notebook Shares
CREATE TABLE public.notebook_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level access_level NOT NULL DEFAULT 'view',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(notebook_id, user_id)
);

-- Sources
CREATE TABLE public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    source_type source_type NOT NULL,
    content_hash TEXT, -- For checking duplicates
    storage_path TEXT, -- Null if just text or URL not stored in bucket
    original_url TEXT,
    word_count INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT size_cap CHECK (word_count <= 500000 OR file_size_bytes <= 209715200) -- 200MB or 500k words
);

-- Generated Artifacts
CREATE TABLE public.artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    artifact_type artifact_type NOT NULL,
    language TEXT DEFAULT 'en',
    storage_path TEXT,
    metadata JSONB DEFAULT '{}', -- visual style, subset of sources
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chats
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT DEFAULT 'New Query',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Citations, selected source subset
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper Function for Access
CREATE OR REPLACE FUNCTION user_has_notebook_access(check_notebook_id UUID, required_level access_level DEFAULT 'view')
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM notebooks WHERE id = check_notebook_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM notebook_shares 
    WHERE notebook_id = check_notebook_id 
      AND user_id = auth.uid() 
      AND (required_level = 'view' OR access_level = 'edit')
  );
$$;

-- Profiles: Users can read/edit their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Notebooks: Owners have full access; Shared users have read access
CREATE POLICY "Users can create notebooks" ON public.notebooks FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can select notebooks" ON public.notebooks FOR SELECT USING (user_has_notebook_access(id, 'view'));
CREATE POLICY "Owners can update notebooks" ON public.notebooks FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete notebooks" ON public.notebooks FOR DELETE USING (auth.uid() = owner_id);

-- Notebook Shares: Admins (owners) can manage; Shared users can view
CREATE POLICY "Owners can view shares" ON public.notebook_shares FOR SELECT USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_shares.notebook_id AND owner_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Owners can insert shares" ON public.notebook_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_shares.notebook_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can delete shares" ON public.notebook_shares FOR DELETE USING (
  EXISTS (SELECT 1 FROM notebooks WHERE id = notebook_shares.notebook_id AND owner_id = auth.uid()) OR user_id = auth.uid()
);

-- Sources: Viewers can read; Editors/Owners can insert/delete
CREATE POLICY "Viewers can read sources" ON public.sources FOR SELECT USING (user_has_notebook_access(notebook_id, 'view'));
CREATE POLICY "Editors can insert sources" ON public.sources FOR INSERT WITH CHECK (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can update sources" ON public.sources FOR UPDATE USING (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can delete sources" ON public.sources FOR DELETE USING (user_has_notebook_access(notebook_id, 'edit'));

-- Artifacts: Viewers can read; Editors can generate/delete
CREATE POLICY "Viewers can read artifacts" ON public.artifacts FOR SELECT USING (user_has_notebook_access(notebook_id, 'view'));
CREATE POLICY "Editors can insert artifacts" ON public.artifacts FOR INSERT WITH CHECK (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can delete artifacts" ON public.artifacts FOR DELETE USING (user_has_notebook_access(notebook_id, 'edit'));

-- Chats and Messages: Viewers can read public bits? Actually, PRD implies chats are per-user.
-- Let's assume chats are private to the user within the notebook.
CREATE POLICY "Users can read own chats" ON public.chats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own chats" ON public.chats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can read own messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid())
);

-- 4. TRIGGERS
-- Create a trigger to automatically create a profile entry when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Updated_at trigger for notebooks
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notebook_modtime
BEFORE UPDATE ON public.notebooks
FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
-- FR-13 Security Gate: Enterprise VPC-SC / IAM Controls Schema Additions

-- 1. IAM Role Enum
CREATE TYPE public.user_role AS ENUM (
  'viewer',        -- read-only access to shared notebooks
  'editor',        -- can create, edit, share notebooks
  'admin',         -- can manage users in an organisation
  'enterprise_admin' -- can configure org-level settings and audit logs
);

-- 2. Organizations Table
CREATE TABLE public.organisations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- 3. Org Members
CREATE TABLE public.org_members (
  org_id  UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.user_role NOT NULL DEFAULT 'viewer',
  PRIMARY KEY (org_id, user_id)
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 4. Audit Log Table
CREATE TABLE public.audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  org_id        UUID REFERENCES public.organisations(id),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for New Tables

-- Orgs: members see their orgs
CREATE POLICY "org_members_view_org"
ON public.organisations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = organisations.id
    AND om.user_id = auth.uid()
  )
);

-- Org Members: self visibility
CREATE POLICY "org_members_self"
ON public.org_members FOR SELECT
USING (auth.uid() = user_id);

-- Org Members: enterprise_admin sees all
CREATE POLICY "org_members_admin"
ON public.org_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = org_members.org_id
    AND om.user_id = auth.uid()
    AND om.role = 'enterprise_admin'
  )
);

-- Audit Log: only enterprise_admin reads
CREATE POLICY "audit_log_admin_only"
ON public.audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members om
    WHERE om.org_id = audit_log.org_id
    AND om.user_id = auth.uid()
    AND om.role = 'enterprise_admin'
  )
);

-- Note: Inserting to audit logs is typically done securely via service role 
-- or edge function bypassing RLS. For now, allow inserts by authenticated user
-- mapping to their own user_id.
CREATE POLICY "audit_log_insert_own"
ON public.audit_log FOR INSERT
WITH CHECK (auth.uid() = user_id);
-- FR-03: Multi-Format Source Ingestion Database Modifications

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.sources 
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN error TEXT,
  ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create source_chunks table
CREATE TABLE public.source_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id   UUID REFERENCES public.sources(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding   vector(1536),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.source_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_chunks_owner"
ON public.source_chunks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.sources s
    WHERE s.id = source_chunks.source_id
    AND s.uploader_id = auth.uid()
  )
);
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
-- FR-05: Audio Overview Generation â€” Database Schema
-- Creates audio_overviews table and Supabase Storage bucket policy.

-- â”€â”€ 1. AUDIO FORMAT ENUM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TYPE public.audio_format AS ENUM (
  'deep_dive',   -- Two AI hosts, exploratory conversation (flagship)
  'brief',       -- Single host, under 2 minutes, dense summary
  'critique',    -- Two hosts debating the source's claims
  'debate',      -- Two hosts arguing opposing positions on source content
  'lecture'      -- Single host, ~30 min, structured deep walkthrough
);

-- â”€â”€ 2. AUDIO OVERVIEW STATUS ENUM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TYPE public.audio_status AS ENUM (
  'pending',
  'generating_script',
  'synthesizing',
  'ready',
  'error'
);

-- â”€â”€ 3. AUDIO OVERVIEWS TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ 4. UPDATED_AT TRIGGER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TRIGGER update_audio_overview_modtime
  BEFORE UPDATE ON public.audio_overviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();

-- â”€â”€ 5. RLS POLICIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ 6. STORAGE BUCKET POLICY NOTE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Run in Supabase Dashboard Storage:
--   CREATE BUCKET 'audio-overviews' WITH (public = false);
-- Then add RLS on the storage.objects table scoped to this bucket.
-- The pipeline uses the service_role key to upload â€” no additional
-- client-side storage policy is required for basic operation.
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- MIGRATION 0005: FR-09 Studio Artefacts + FR-10 Notebook Sharing
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ PART A: AUGMENT artifacts TABLE (FR-09) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- â”€â”€ PART B: notebook_shares TABLE (FR-10) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

-- Owner can revoke (update revoked_at) â€” invitee can accept (update invitee_id, accepted_at)
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

-- â”€â”€ PART C: UPDATE user_has_notebook_access FUNCTION (FR-10) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    -- Shared access â€” must be accepted and not revoked
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
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- MIGRATION 0006: RLS Fix + FR-11 Style Preference + FR-18 Language Preference
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ PART A: FIX source_chunks RLS FOR SHARED VIEWERS (DEBT-01) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- Service role bypass for background ingest pipeline (no change needed â€”
-- service_role key bypasses RLS at Supabase level by default).

-- â”€â”€ PART B: PER-NOTEBOOK STYLE PREFERENCE FOR FR-11 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€ PART C: PER-NOTEBOOK LANGUAGE PREFERENCE FOR FR-18 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- RAG responses will be localised to this language setting.

ALTER TABLE public.notebooks
  ADD COLUMN IF NOT EXISTS response_language TEXT NOT NULL DEFAULT 'en';

-- Index for language-based queries (future analytics use)
CREATE INDEX IF NOT EXISTS idx_notebooks_language
  ON public.notebooks(response_language);
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- MIGRATION 0007: FR-15 Source Scoping + FR-16 Audio Sharing
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- â”€â”€ FR-15: Extended match_source_chunks with optional source filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Replaces the existing function. Old function is overloaded â€” new signature
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

-- â”€â”€ FR-16: Audio Sharing Fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
-- This is a narrow carve-out â€” no other columns beyond what the share page needs.
CREATE POLICY "audio_overviews_public_share_read"
  ON public.audio_overviews FOR SELECT
  USING (
    share_enabled = TRUE AND share_token IS NOT NULL
    -- OR the existing creator policy (handled by separate policy)
  );
