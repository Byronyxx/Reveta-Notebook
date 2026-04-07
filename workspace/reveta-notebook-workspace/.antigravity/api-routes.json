{
  "$schema": "https://antigravity.dev/schemas/api-routes.json",
  "note": "Route 12 (/api/profile) was a dead duplicate of /api/user/profile — deleted in bug fix BUG-F. Security audit entry 12 is now stale; canonical route is entry 14.",

  "routes": [
    {
      "id": 1,
      "path": "/api/notebooks",
      "methods": ["GET", "POST"],
      "file": "app/api/notebooks/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["notebooks"],
      "rlsPolicy": "owner_id = auth.uid()",
      "requirements": ["FR-09"]
    },
    {
      "id": 2,
      "path": "/api/sources",
      "methods": ["GET", "POST"],
      "file": "app/api/sources/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["sources"],
      "rlsPolicy": "uploader_id = auth.uid()",
      "requirements": ["FR-03"],
      "notes": "POST triggers async ingest pipeline via fire-and-forget"
    },
    {
      "id": 3,
      "path": "/api/sources/[id]",
      "methods": ["GET", "DELETE"],
      "file": "app/api/sources/[id]/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["sources"],
      "rlsPolicy": "uploader_id = auth.uid()",
      "requirements": ["FR-03"]
    },
    {
      "id": 4,
      "path": "/api/sources/[id]/status",
      "methods": ["GET"],
      "file": "app/api/sources/[id]/status/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["sources"],
      "rlsPolicy": "uploader_id = auth.uid()",
      "requirements": ["FR-03"],
      "notes": "Polled by client every 4s during ingest"
    },
    {
      "id": 5,
      "path": "/api/chats",
      "methods": ["POST"],
      "file": "app/api/chats/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["chats"],
      "rlsPolicy": "user_id = auth.uid()",
      "requirements": ["FR-01"]
    },
    {
      "id": 6,
      "path": "/api/chats/[chatId]/messages",
      "methods": ["GET", "POST"],
      "file": "app/api/chats/[chatId]/messages/route.ts",
      "authRequired": true,
      "rateLimited": true,
      "rateLimitNotes": "Per-user via claude.ts wrapper (30 req/min Upstash sliding window)",
      "zodValidated": false,
      "tables": ["messages", "chats"],
      "rlsPolicy": "chat owner = auth.uid()",
      "requirements": ["FR-01", "FR-02", "FR-11", "FR-15", "FR-18"],
      "bodyParams": {
        "content": "string — user message",
        "style": "StylePreference — FR-11/FR-18 response style",
        "sourceIds": "string[] | undefined — FR-15 source scope filter"
      }
    },
    {
      "id": 7,
      "path": "/api/audio-overviews",
      "methods": ["GET", "POST"],
      "file": "app/api/audio-overviews/route.ts",
      "authRequired": true,
      "rateLimited": true,
      "rateLimitNotes": "Background pipeline rate-limited via background-pipeline key",
      "zodValidated": false,
      "tables": ["audio_overviews"],
      "rlsPolicy": "creator_id = auth.uid() + user_has_notebook_access()",
      "requirements": ["FR-05", "FR-06"],
      "notes": "POST triggers async audio generation pipeline"
    },
    {
      "id": 8,
      "path": "/api/audio-overviews/[id]",
      "methods": ["GET", "DELETE"],
      "file": "app/api/audio-overviews/[id]/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["audio_overviews", "storage"],
      "rlsPolicy": "creator_id = auth.uid()",
      "requirements": ["FR-05"],
      "notes": "GET returns 1-hour signed storage URL when status=ready"
    },
    {
      "id": 9,
      "path": "/api/artifacts",
      "methods": ["GET", "POST"],
      "file": "app/api/artifacts/route.ts",
      "authRequired": true,
      "rateLimited": true,
      "rateLimitNotes": "Background pipeline rate-limited via background-pipeline key",
      "zodValidated": false,
      "tables": ["artifacts"],
      "rlsPolicy": "creator_id = auth.uid() + user_has_notebook_access()",
      "requirements": ["FR-09", "FR-17"],
      "bodyParams": {
        "notebookId": "string",
        "format": "ArtifactFormat",
        "sourceIds": "string[] | undefined — FR-17 mind_map scope only"
      }
    },
    {
      "id": 10,
      "path": "/api/artifacts/[id]",
      "methods": ["GET", "DELETE"],
      "file": "app/api/artifacts/[id]/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["artifacts"],
      "rlsPolicy": "creator_id = auth.uid()",
      "requirements": ["FR-09"]
    },
    {
      "id": 11,
      "path": "/api/notebooks/[id]/shares",
      "methods": ["GET", "POST", "DELETE"],
      "file": "app/api/notebooks/[id]/shares/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["notebook_shares"],
      "rlsPolicy": "shared_by = auth.uid() or invitee_email match",
      "requirements": ["FR-10"],
      "notes": "DELETE verifies shared_by = auth.uid() before revocation"
    },
    {
      "id": 13,
      "path": "/api/audio-overviews/[id]/share",
      "methods": ["POST", "DELETE"],
      "file": "app/api/audio-overviews/[id]/share/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": false,
      "tables": ["audio_overviews"],
      "rlsPolicy": "auth.uid() + notebook owner_id check",
      "requirements": ["FR-16"],
      "notes": "POST: idempotent token generation. DELETE: share_enabled=false (token preserved for audit)."
    },
    {
      "id": 14,
      "path": "/api/user/profile",
      "methods": ["GET", "PATCH"],
      "file": "app/api/user/profile/route.ts",
      "authRequired": true,
      "rateLimited": false,
      "zodValidated": true,
      "zodSchema": "StylePreferenceSchema (strict mode)",
      "tables": ["profiles"],
      "rlsPolicy": "id = auth.uid()",
      "requirements": ["FR-11", "FR-18"]
    }
  ],

  "publicRoutes": [
    {
      "id": "P1",
      "path": "/audio/share/[token]",
      "type": "server-page",
      "file": "app/audio/share/[token]/page.tsx",
      "authRequired": false,
      "notes": "RLS enforces share_enabled=true AND share_token IS NOT NULL. Signed storage URL generated server-side (1hr TTL).",
      "requirements": ["FR-16"]
    }
  ]
}
