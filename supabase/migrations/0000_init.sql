-- TECH-DB INIT MIGRATION
CREATE TYPE access_level AS ENUM ('view', 'edit');
CREATE TYPE source_type AS ENUM ('file', 'url', 'text');
CREATE TYPE artifact_type AS ENUM ('audio', 'video', 'study_guide', 'brief', 'faq', 'timeline', 'mind_map', 'slide_deck', 'other');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    style_preference JSONB DEFAULT '{"length": "medium", "formality": "neutral"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    source_type source_type NOT NULL,
    content_hash TEXT,
    storage_path TEXT,
    original_url TEXT,
    word_count INTEGER DEFAULT 0,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    artifact_type artifact_type NOT NULL,
    language TEXT DEFAULT 'en',
    storage_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT DEFAULT 'New Query',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION user_has_notebook_access(check_notebook_id UUID, required_level access_level DEFAULT 'view')
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM notebooks WHERE id = check_notebook_id AND owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM notebook_shares WHERE notebook_id = check_notebook_id AND user_id = auth.uid() AND (required_level = 'view' OR access_level = 'edit'));
$$;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can create notebooks" ON public.notebooks FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can select notebooks" ON public.notebooks FOR SELECT USING (user_has_notebook_access(id, 'view'));
CREATE POLICY "Owners can update notebooks" ON public.notebooks FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete notebooks" ON public.notebooks FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Viewers can read sources" ON public.sources FOR SELECT USING (user_has_notebook_access(notebook_id, 'view'));
CREATE POLICY "Editors can insert sources" ON public.sources FOR INSERT WITH CHECK (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can update sources" ON public.sources FOR UPDATE USING (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can delete sources" ON public.sources FOR DELETE USING (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Viewers can read artifacts" ON public.artifacts FOR SELECT USING (user_has_notebook_access(notebook_id, 'view'));
CREATE POLICY "Editors can insert artifacts" ON public.artifacts FOR INSERT WITH CHECK (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Editors can delete artifacts" ON public.artifacts FOR DELETE USING (user_has_notebook_access(notebook_id, 'edit'));
CREATE POLICY "Users can read own chats" ON public.chats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own chats" ON public.chats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can read own messages" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM chats WHERE id = messages.chat_id AND user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN INSERT INTO public.profiles (id, display_name) VALUES (new.id, new.raw_user_meta_data->>'full_name'); RETURN new; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_modified_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notebook_modtime BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE PROCEDURE public.update_modified_column();
