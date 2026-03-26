-- FR-13 Security Gate: Enterprise VPC-SC / IAM Controls
CREATE TYPE public.user_role AS ENUM ('viewer', 'editor', 'admin', 'enterprise_admin');

CREATE TABLE public.organisations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_members (org_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE, user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, role public.user_role NOT NULL DEFAULT 'viewer', PRIMARY KEY (org_id, user_id));
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_log (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES auth.users(id), org_id UUID REFERENCES public.organisations(id), action TEXT NOT NULL, resource_type TEXT NOT NULL, resource_id UUID, metadata JSONB, created_at TIMESTAMPTZ DEFAULT now());
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_view_org" ON public.organisations FOR SELECT USING (EXISTS (SELECT 1 FROM public.org_members om WHERE om.org_id = organisations.id AND om.user_id = auth.uid()));
CREATE POLICY "org_members_self" ON public.org_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "org_members_admin" ON public.org_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.org_members om WHERE om.org_id = org_members.org_id AND om.user_id = auth.uid() AND om.role = 'enterprise_admin'));
CREATE POLICY "audit_log_admin_only" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.org_members om WHERE om.org_id = audit_log.org_id AND om.user_id = auth.uid() AND om.role = 'enterprise_admin'));
CREATE POLICY "audit_log_insert_own" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);
