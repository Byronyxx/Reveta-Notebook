{
  "$schema": "https://antigravity.dev/schemas/env-schema.json",
  "variables": [
    {
      "key": "NEXT_PUBLIC_SUPABASE_URL",
      "required": true,
      "exposure": "public",
      "description": "Supabase project REST URL",
      "example": "https://xyzabcdef.supabase.co",
      "usedIn": ["lib/supabase/server.ts", "lib/supabase/client.ts", "lib/ai/audio-overview.ts", "lib/ai/artifact-generator.ts"]
    },
    {
      "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "required": true,
      "exposure": "public",
      "description": "Supabase anon/public key for browser client",
      "usedIn": ["lib/supabase/client.ts", "lib/supabase/server.ts"]
    },
    {
      "key": "SUPABASE_SERVICE_ROLE_KEY",
      "required": true,
      "exposure": "server-only",
      "description": "Supabase service role key — bypasses RLS. Never expose to client.",
      "securityNote": "Used only in background pipeline jobs: lib/ai/audio-overview.ts, lib/ai/artifact-generator.ts, lib/ingest/pipeline.ts",
      "usedIn": ["lib/ai/audio-overview.ts", "lib/ai/artifact-generator.ts", "lib/ingest/pipeline.ts"]
    },
    {
      "key": "ANTHROPIC_API_KEY",
      "required": true,
      "exposure": "server-only",
      "description": "Anthropic API key for Claude inference. All calls routed through lib/ai/claude.ts.",
      "usedIn": ["lib/ai/claude.ts"]
    },
    {
      "key": "OPENAI_API_KEY",
      "required": true,
      "exposure": "server-only",
      "description": "OpenAI key for text-embedding-3-small (ingest) + tts-1 (audio synthesis) + whisper-1 (audio ingest)",
      "usedIn": ["lib/ingest/embeddings.ts", "lib/ai/tts.ts", "lib/ingest/adapters/audio.ts"]
    },
    {
      "key": "UPSTASH_REDIS_REST_URL",
      "required": true,
      "exposure": "server-only",
      "description": "Upstash Redis REST endpoint — used for AI response cache and rate limiting",
      "usedIn": ["lib/ai/cache.ts", "lib/ai/rate-limit.ts"]
    },
    {
      "key": "UPSTASH_REDIS_REST_TOKEN",
      "required": true,
      "exposure": "server-only",
      "description": "Upstash Redis auth token",
      "usedIn": ["lib/ai/cache.ts", "lib/ai/rate-limit.ts"]
    },
    {
      "key": "NEXT_PUBLIC_APP_URL",
      "required": true,
      "exposure": "public",
      "description": "Full deployed URL e.g. https://reveta.app — used to construct FR-16 audio share links",
      "example": "https://reveta.app",
      "usedIn": ["app/api/audio-overviews/[id]/share/route.ts"]
    },
    {
      "key": "NEXTAUTH_SECRET",
      "required": false,
      "requiredInEnvironments": ["production"],
      "exposure": "server-only",
      "description": "32+ char secret for session signing. Required in production only.",
      "usedIn": ["middleware.ts"]
    },
    {
      "key": "SENTRY_DSN",
      "required": false,
      "exposure": "server-only",
      "description": "Sentry DSN for error tracking (TECH-MONITORING). Not yet wired.",
      "status": "planned"
    },
    {
      "key": "LANGFUSE_PUBLIC_KEY",
      "required": false,
      "exposure": "server-only",
      "description": "Langfuse public key for AI call tracing (TECH-MONITORING). Not yet wired.",
      "status": "planned"
    },
    {
      "key": "LANGFUSE_SECRET_KEY",
      "required": false,
      "exposure": "server-only",
      "description": "Langfuse secret key for AI call tracing (TECH-MONITORING). Not yet wired.",
      "status": "planned"
    }
  ]
}
