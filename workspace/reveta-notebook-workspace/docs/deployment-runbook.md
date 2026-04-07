# Reveta Notebook — Deployment Runbook
**TECH-DEPLOY · Authority Tier 4 · Version 1.0**

---

## 1. ENVIRONMENT VARIABLES

All required at runtime. Set in Vercel project settings under **Settings → Environment Variables**. Apply to Production, Preview, and Development environments unless noted.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — server-only. Never expose to client. |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key — server-only |
| `OPENAI_API_KEY` | ✅ | OpenAI key for embeddings (text-embedding-3-small) and TTS (tts-1) |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST endpoint for rate limiting + cache |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis auth token |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of deployed app (e.g. `https://reveta.app`) — used for share links |
| `NEXTAUTH_SECRET` | Production only | 32+ char secret for session signing |

---

## 2. SUPABASE PRE-FLIGHT

Run all migrations in order before first deploy and after each migration addition.

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <PROJECT_REF>

# Run all pending migrations
supabase db push

# Verify migrations applied
supabase db diff
```

### Migration order (must be sequential):
```
0000_init.sql
0001_iam_rbac.sql
0002_ingest_pipeline.sql
0003_rag_pipeline.sql
0004_audio_overviews.sql
0005_artifacts_and_sharing.sql
0006_rls_fix_and_preferences.sql
0007_source_scoping_and_audio_sharing.sql
```

### Enable pgvector extension (one-time):
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Verify RLS is enabled on all user tables:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
All tables should show `rowsecurity = true`.

---

## 3. VERCEL DEPLOYMENT

### First deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

### CI/CD via GitHub integration (recommended):
1. Connect GitHub repo in Vercel dashboard
2. Set all environment variables in Vercel project settings
3. Every push to `main` triggers production deploy
4. Every PR gets a preview deployment

### Build verification:
```bash
# Local build test before pushing
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Eval suite (prompt quality gate)
npm run eval
```

---

## 4. STORAGE BUCKETS

Create in Supabase Storage before first audio generation:

```sql
-- Audio overviews storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-overviews', 'audio-overviews', false);

-- RLS: only authenticated users can read their own files
CREATE POLICY "audio_overviews_owner_read"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "audio_overviews_service_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-overviews');
```

---

## 5. PRE-DEPLOYMENT CHECKLIST

```
□ All 8 environment variables set in Vercel project
□ Supabase migrations 0000–0007 applied in order
□ pgvector extension enabled
□ RLS enabled on all public tables
□ audio-overviews storage bucket created with RLS policies
□ npm run build completes without errors
□ npx tsc --noEmit passes with zero errors
□ npm run eval passes with ≥80% aggregate threshold
□ NEXT_PUBLIC_APP_URL set to production domain (needed for FR-16 share links)
□ Vercel function timeouts match vercel.json (audio/artifacts: 300s)
□ Vercel regions: iad1 (US East), lhr1 (EU), sin1 (APAC)
```

---

## 6. POST-DEPLOY SMOKE TEST

Run immediately after each production deploy:

```bash
# 1. Auth: sign up and sign in
# 2. Source ingest: upload a PDF or paste a URL
# 3. Chat: ask a question, verify inline citations appear
# 4. Audio: generate a Brief format, verify it reaches 'ready'
# 5. Artifact: generate a Study Guide, verify it renders
# 6. Share: enable audio sharing, verify public URL loads
# 7. Style: change language to French, verify response language
```

---

## 7. ROLLBACK PROCEDURE

### Vercel rollback (instant):
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>
```

Or via Vercel dashboard → Deployments → select previous → Promote to Production.

### Database rollback:
Supabase migrations are append-only. For emergency rollback:
1. Identify the breaking migration
2. Write a corrective forward migration (e.g. `0008_revert_xxx.sql`)
3. Apply with `supabase db push`

Never delete or modify applied migrations. The migration log is immutable state.

---

## 8. MONITORING HOOKS (TECH-MONITORING prerequisite)

These integrate with TECH-MONITORING when that requirement is built:

- **Sentry**: Add `SENTRY_DSN` env var + `@sentry/nextjs` instrumentation
- **Langfuse**: Add `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` for AI call tracing
- **Vercel Analytics**: Enable in Vercel project settings (zero config)
- **Vercel Speed Insights**: `@vercel/speed-insights` in layout.tsx

---

*Reveta Notebook · TECH-DEPLOY v1.0 · Tier 4 Process Truth*
