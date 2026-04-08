-- Fix permissions for all Reveta Notebook tables
-- Run this in Supabase SQL Editor with Role: postgres

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table-level permissions explicitly for each table
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.notebooks TO anon, authenticated, service_role;
GRANT ALL ON public.notebook_shares TO anon, authenticated, service_role;
GRANT ALL ON public.sources TO anon, authenticated, service_role;
GRANT ALL ON public.artifacts TO anon, authenticated, service_role;
GRANT ALL ON public.chats TO anon, authenticated, service_role;
GRANT ALL ON public.messages TO anon, authenticated, service_role;

-- Grant sequence permissions (needed for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Grant function/routine permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Set default privileges for any future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

