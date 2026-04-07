{
  "$schema": "https://antigravity.dev/schemas/workspace.json",
  "name": "reveta-notebook",
  "displayName": "Reveta Notebook",
  "version": "0.1.0",
  "description": "Production-grade NotebookLM clone — RAG pipeline, audio overviews, studio artifacts",

  "framework": "nextjs-15",
  "language": "typescript",
  "packageManager": "npm",
  "nodeVersion": ">=20",

  "entryPoints": {
    "root": "app/layout.tsx",
    "home": "app/page.tsx",
    "dashboard": "app/dashboard/page.tsx",
    "notebook": "app/notebook/[notebookId]/page.tsx",
    "audioShare": "app/audio/share/[token]/page.tsx"
  },

  "modules": {
    "ai": {
      "wrapper": "lib/ai/claude.ts",
      "prompts": "lib/ai/prompts.ts",
      "rag": "lib/ai/rag.ts",
      "audioGeneration": "lib/ai/audio-overview.ts",
      "artifactGeneration": "lib/ai/artifact-generator.ts",
      "tts": "lib/ai/tts.ts",
      "cache": "lib/ai/cache.ts",
      "rateLimit": "lib/ai/rate-limit.ts"
    },
    "ingest": {
      "pipeline": "lib/ingest/pipeline.ts",
      "chunker": "lib/ingest/chunker.ts",
      "embeddings": "lib/ingest/embeddings.ts",
      "adapters": "lib/ingest/adapters/index.ts"
    },
    "auth": {
      "roles": "lib/auth/roles.ts",
      "audit": "lib/auth/audit.ts"
    },
    "supabase": {
      "serverClient": "lib/supabase/server.ts",
      "browserClient": "lib/supabase/client.ts",
      "middleware": "lib/supabase/middleware.ts"
    },
    "designSystem": {
      "tokens": "tokens/design-tokens.json",
      "globalCSS": "app/globals.css",
      "tailwindConfig": "tailwind.config.ts",
      "chromaticMoods": "lib/chromatic-moods.tsx",
      "parallax": "components/ParallaxNarrative.tsx",
      "immersive": "components/ui/Immersive.tsx",
      "primitives": "components/ui/Primitives.tsx",
      "feedback": "components/ui/Feedback.tsx",
      "comfortMode": "components/ComfortModeToggle.tsx"
    }
  },

  "providers": {
    "auth": "supabase",
    "database": "supabase-postgres",
    "vectorStore": "supabase-pgvector",
    "ai": "anthropic",
    "embeddings": "openai",
    "tts": "openai",
    "cache": "upstash-redis",
    "rateLimit": "upstash-ratelimit",
    "deployment": "vercel"
  },

  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "eval": "npx tsx lib/ai/__tests__/prompt-evals.ts",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },

  "governance": {
    "orchestration": "prompts/05_Grand_Unified_Orchestration.md",
    "prd": "docs/01_NotebookLM_PRD.md",
    "designSystem": "docs/02_Design_System.md",
    "changelog": "docs/04_CHANGELOG.md",
    "apiAudit": "docs/api-security-audit.md",
    "deployRunbook": "docs/deployment-runbook.md"
  },

  "migrations": {
    "directory": "supabase/migrations",
    "sequence": [
      "0000_init.sql",
      "0001_iam_rbac.sql",
      "0002_ingest_pipeline.sql",
      "0003_rag_pipeline.sql",
      "0004_audio_overviews.sql",
      "0005_artifacts_and_sharing.sql",
      "0006_rls_fix_and_preferences.sql",
      "0007_source_scoping_and_audio_sharing.sql"
    ]
  }
}
