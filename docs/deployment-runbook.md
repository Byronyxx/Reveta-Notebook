# Reveta Notebook — Deployment Runbook
**TECH-DEPLOY · Version 1.0**

## 1. ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — server-only |
| `ANTHROPIC_API_KEY` | ✅ | Anthropic API key — server-only |
| `OPENAI_API_KEY` | ✅ | OpenAI key for embeddings + TTS |
| `UPSTASH_REDIS_REST_URL` | ✅ | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Upstash Redis auth token |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of deployed app |
| `NEXTAUTH_SECRET` | Production only | 32+ char secret |

## 2. SUPABASE SETUP

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

Migration order: 0000 → 0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007

## 3. VERCEL DEPLOYMENT

```bash
vercel --prod
```

## 4. PRE-DEPLOY CHECKLIST

```
□ All environment variables set in Vercel
□ Supabase migrations 0000–0007 applied
□ audio-overviews storage bucket created
□ npm run build completes without errors
□ npx tsc --noEmit passes
□ npm run eval passes (≥80% threshold)
```

## 5. ROLLBACK

```bash
vercel rollback <deployment-url>
```
