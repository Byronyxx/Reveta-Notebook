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
