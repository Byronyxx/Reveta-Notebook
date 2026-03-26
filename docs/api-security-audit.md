# Reveta Notebook — API Security Audit
## FR-14 Compliance Log
**Rule:** Every route calls `supabase.auth.getUser()` before any data access. No `userId` is ever trusted from the client request payload.

| # | Route | Method(s) | auth.getUser() | RLS Policy |
|---|-------|-----------|---------------|------------|
| 1 | /api/notebooks | GET, POST | ✅ | owner_id = auth.uid() |
| 2 | /api/sources | GET, POST | ✅ | uploader_id = auth.uid() |
| 3 | /api/sources/[id] | GET, DELETE | ✅ | uploader_id = auth.uid() |
| 4 | /api/sources/[id]/status | GET | ✅ | uploader_id = auth.uid() |
| 5 | /api/chats | POST | ✅ | user_id = auth.uid() |
| 6 | /api/chats/[chatId]/messages | GET, POST | ✅ | chat owner = auth.uid() |
| 7 | /api/audio-overviews | GET, POST | ✅ | creator_id + notebook access |
| 8 | /api/audio-overviews/[id] | GET, DELETE | ✅ | creator_id = auth.uid() |
| 9 | /api/artifacts | GET, POST | ✅ | creator_id + notebook access |
| 10 | /api/artifacts/[id] | GET, DELETE | ✅ | creator_id = auth.uid() |
| 11 | /api/notebooks/[id]/shares | GET, POST, DELETE | ✅ | shared_by = auth.uid() |
| 13 | /api/audio-overviews/[id]/share | POST, DELETE | ✅ | auth.uid() + notebook owner check |
| 14 | /api/user/profile | GET, PATCH | ✅ | id = auth.uid() |
| P1 | /audio/share/[token] | Server page | N/A | RLS: share_enabled=true AND share_token IS NOT NULL |

**Notes:** Routes 7–11 also call `user_has_notebook_access()` RPC for defence-in-depth. Background pipeline jobs use service_role client (server-only, never client-exposed). FR-16 share links generate 1-hour signed storage URLs server-side only.
