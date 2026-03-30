{
  "$schema": "https://antigravity.dev/schemas/supabase-schema.json",
  "projectUrl": "${NEXT_PUBLIC_SUPABASE_URL}",
  "rlsEnabled": true,
  "pgvectorEnabled": true,
  "migrationsDirectory": "../supabase/migrations",

  "functions": [
    {
      "name": "user_has_notebook_access",
      "signature": "(check_notebook_id UUID, required_level access_level DEFAULT 'view') RETURNS boolean",
      "migration": "0001_iam_rbac.sql",
      "description": "Central access gate. Checks notebook ownership OR accepted notebook_shares membership. Used by all notebook-scoped RLS policies.",
      "accessLevels": ["view", "edit", "admin"]
    },
    {
      "name": "match_source_chunks",
      "signature": "(query_embedding vector(1536), query_notebook_id UUID, match_threshold float, match_count int, filter_source_ids UUID[] DEFAULT NULL) RETURNS TABLE",
      "migration": "0003_rag_pipeline.sql + extended in 0007",
      "description": "pgvector cosine similarity search for RAG. filter_source_ids enables FR-15 source scoping (NULL = all sources).",
      "note": "FR-15: filter_source_ids parameter added in migration 0007"
    },
    {
      "name": "handle_new_user",
      "signature": "() RETURNS trigger",
      "migration": "0000_init.sql",
      "description": "Auto-creates profiles row on auth.users INSERT"
    },
    {
      "name": "update_modified_column",
      "signature": "() RETURNS trigger",
      "migration": "0000_init.sql",
      "description": "Sets updated_at = NOW() on any UPDATE"
    }
  ],

  "tables": [
    {
      "name": "profiles",
      "migration": "0000_init.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK, FK auth.users)", "display_name", "avatar_url", "style_preference (jsonb)", "created_at", "updated_at"],
      "policies": [
        { "name": "Users can read own profile", "operation": "SELECT", "check": "auth.uid() = id" },
        { "name": "Users can edit own profile", "operation": "UPDATE", "check": "auth.uid() = id" }
      ],
      "notes": "style_preference JSONB stores FR-11 ResponseLength/Formality/Format/Language preferences"
    },
    {
      "name": "notebooks",
      "migration": "0000_init.sql + 0006_rls_fix_and_preferences.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "owner_id (FK profiles)", "name", "description", "style_preference (jsonb)", "response_language (text, default en)", "created_at", "updated_at"],
      "policies": [
        { "name": "Users can create notebooks", "operation": "INSERT", "check": "auth.uid() = owner_id" },
        { "name": "Users can select notebooks", "operation": "SELECT", "check": "user_has_notebook_access(id, 'view')" },
        { "name": "Owners can update notebooks", "operation": "UPDATE", "check": "auth.uid() = owner_id" },
        { "name": "Owners can delete notebooks", "operation": "DELETE", "check": "auth.uid() = owner_id" }
      ],
      "notes": "style_preference + response_language added in migration 0006 for FR-11 + FR-18"
    },
    {
      "name": "notebook_shares",
      "migration": "0005_artifacts_and_sharing.sql",
      "rlsEnabled": true,
      "columns": ["id", "notebook_id (FK notebooks)", "shared_by (FK profiles)", "invitee_email", "invitee_id (FK profiles)", "access_level", "token (uuid, unique)", "status (pending|accepted|revoked)", "created_at", "accepted_at"],
      "policies": [
        { "name": "Owners can view shares", "operation": "SELECT", "check": "shared_by = auth.uid() OR invitee_id = auth.uid()" },
        { "name": "Owners can insert shares", "operation": "INSERT", "check": "shared_by = auth.uid()" },
        { "name": "Owners can delete shares", "operation": "DELETE", "check": "shared_by = auth.uid()" }
      ],
      "indexes": ["idx_notebook_shares_token", "idx_notebook_shares_invitee_id", "idx_notebook_shares_notebook_id"]
    },
    {
      "name": "sources",
      "migration": "0002_ingest_pipeline.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "notebook_id (FK notebooks)", "uploader_id (FK profiles)", "title", "source_type", "status (pending|processing|ready|error)", "word_count", "error", "storage_path", "url", "created_at", "updated_at"],
      "policies": [
        { "name": "Viewers can read sources", "operation": "SELECT", "check": "user_has_notebook_access(notebook_id, 'view')" },
        { "name": "Editors can insert sources", "operation": "INSERT", "check": "user_has_notebook_access(notebook_id, 'edit')" },
        { "name": "Editors can update sources", "operation": "UPDATE", "check": "user_has_notebook_access(notebook_id, 'edit')" },
        { "name": "Editors can delete sources", "operation": "DELETE", "check": "user_has_notebook_access(notebook_id, 'edit')" }
      ]
    },
    {
      "name": "source_chunks",
      "migration": "0002_ingest_pipeline.sql + 0006_rls_fix_and_preferences.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "source_id (FK sources)", "notebook_id (FK notebooks)", "content (text)", "chunk_index (int)", "embedding (vector(1536))", "created_at"],
      "policies": [
        { "name": "source_chunks_read", "operation": "SELECT", "check": "user_has_notebook_access(notebook_id, 'view') OR source uploader_id = auth.uid()" },
        { "name": "source_chunks_write", "operation": "INSERT", "check": "source uploader_id = auth.uid()" }
      ],
      "notes": "RLS fixed in 0006 to allow shared viewers to run RAG queries (DEBT-002 resolution)"
    },
    {
      "name": "chats",
      "migration": "0003_rag_pipeline.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "notebook_id (FK notebooks)", "user_id (FK profiles)", "title", "created_at", "updated_at"],
      "policies": [
        { "name": "Users can read own chats", "operation": "SELECT", "check": "user_id = auth.uid()" },
        { "name": "Users can create own chats", "operation": "INSERT", "check": "user_id = auth.uid()" }
      ]
    },
    {
      "name": "messages",
      "migration": "0003_rag_pipeline.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "chat_id (FK chats)", "role (user|assistant)", "content (text)", "sources (jsonb)", "created_at"],
      "policies": [
        { "name": "Users can read own messages", "operation": "SELECT", "check": "chat owner user_id = auth.uid()" },
        { "name": "Users can insert own messages", "operation": "INSERT", "check": "chat owner user_id = auth.uid()" }
      ]
    },
    {
      "name": "audio_overviews",
      "migration": "0004_audio_overviews.sql + 0007_source_scoping_and_audio_sharing.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "notebook_id (FK notebooks)", "creator_id (FK profiles)", "format (AudioFormat)", "status (pending|generating_script|synthesizing|ready|error)", "duration_seconds", "storage_path", "language", "error", "metadata (jsonb)", "share_token (uuid, unique, nullable)", "share_enabled (bool, default false)", "created_at", "updated_at"],
      "policies": [
        { "name": "audio_overview_select", "operation": "SELECT", "check": "creator_id = auth.uid()" },
        { "name": "audio_overview_insert", "operation": "INSERT", "check": "user_has_notebook_access(notebook_id, 'edit')" },
        { "name": "audio_overview_delete", "operation": "DELETE", "check": "creator_id = auth.uid()" },
        { "name": "audio_overview_update", "operation": "UPDATE", "check": "creator_id = auth.uid()" },
        { "name": "audio_overviews_public_share_read", "operation": "SELECT", "check": "share_enabled = true AND share_token IS NOT NULL", "public": true }
      ],
      "indexes": ["idx_audio_overviews_share_token (WHERE share_token IS NOT NULL)"],
      "notes": "share_token + share_enabled + public RLS policy added in 0007 for FR-16"
    },
    {
      "name": "artifacts",
      "migration": "0005_artifacts_and_sharing.sql",
      "rlsEnabled": true,
      "columns": ["id (uuid, PK)", "notebook_id (FK notebooks)", "creator_id (FK profiles)", "artifact_type (ArtifactFormat)", "title", "content (text)", "status (pending|generating|ready|error)", "word_count", "error", "metadata (jsonb)", "created_at", "updated_at"],
      "policies": [
        { "name": "Viewers can read artifacts", "operation": "SELECT", "check": "user_has_notebook_access(notebook_id, 'view')" },
        { "name": "Editors can insert artifacts", "operation": "INSERT", "check": "user_has_notebook_access(notebook_id, 'edit')" },
        { "name": "Editors can delete artifacts", "operation": "DELETE", "check": "user_has_notebook_access(notebook_id, 'edit')" }
      ]
    },
    {
      "name": "organisations",
      "migration": "0001_iam_rbac.sql",
      "rlsEnabled": true,
      "columns": ["id", "name", "slug", "plan", "created_at"],
      "notes": "Enterprise tier — FR-13 VPC-SC + IAM foundation"
    },
    {
      "name": "org_members",
      "migration": "0001_iam_rbac.sql",
      "rlsEnabled": true,
      "columns": ["org_id", "user_id", "role (owner|admin|member|viewer)", "joined_at"],
      "policies": [
        { "name": "org_members_view_org", "operation": "SELECT", "check": "org member" },
        { "name": "org_members_self", "operation": "SELECT", "check": "user_id = auth.uid()" },
        { "name": "org_members_admin", "operation": "INSERT/UPDATE/DELETE", "check": "role IN (owner, admin)" }
      ]
    },
    {
      "name": "audit_log",
      "migration": "0001_iam_rbac.sql",
      "rlsEnabled": true,
      "columns": ["id", "org_id", "actor_id", "action", "resource_type", "resource_id", "metadata (jsonb)", "created_at"],
      "policies": [
        { "name": "audit_log_admin_only", "operation": "SELECT", "check": "org admin or owner" },
        { "name": "audit_log_insert_own", "operation": "INSERT", "check": "actor_id = auth.uid()" }
      ],
      "notes": "FR-13 enterprise audit trail for all AI-assisted operations"
    }
  ]
}
