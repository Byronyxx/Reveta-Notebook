# Reveta Notebook — API Security Audit
## FR-14 Compliance Log
**Rule:** Every route calls `supabase.auth.getUser()` before any data access.
No `userId` is ever trusted from the client request payload. No exceptions.
**Updated:** 2026-03-12 (synced after CHANGELOG-SYNC-001)

| # | Route | Method(s) | auth.getUser() | Data Accessed | User-Scoped | Added |
|---|-------|-----------|---------------|---------------|-------------|-------|
| 1 | /api/notebooks | GET, POST | ✅ | notebooks | RLS: owner_id = auth.uid() | FR-09 DS-COMP-CONTENT |
| 2 | /api/sources | GET, POST | ✅ | sources | RLS: uploader_id = auth.uid() | FR-03 |
| 3 | /api/sources/[id] | GET, DELETE | ✅ | sources | RLS: uploader_id = auth.uid() | FR-03 DS-COMP-CONTENT |
| 4 | /api/sources/[id]/status | GET | ✅ | sources | RLS: uploader_id = auth.uid() | FR-03 DS-COMP-CONTENT |
| 5 | /api/chats | POST | ✅ | chats | RLS: user_id = auth.uid() | FR-01 DS-COMP-CONTENT |
| 6 | /api/chats/[chatId]/messages | GET, POST | ✅ | messages, chats | RLS: chat owner = auth.uid() | FR-01 FR-02 DS-COMP-CONTENT |
| 7 | /api/audio-overviews | GET, POST | ✅ | audio_overviews | RLS: creator_id = auth.uid() + notebook access check | FR-05 |
| 8 | /api/audio-overviews/[id] | GET, DELETE | ✅ | audio_overviews, storage | RLS: creator_id = auth.uid() | FR-05 |
| 9 | /api/artifacts | GET, POST | ✅ | artifacts | RLS: creator_id = auth.uid() + notebook access check | FR-09 |
| 10 | /api/artifacts/[id] | GET, DELETE | ✅ | artifacts | RLS: creator_id = auth.uid() | FR-09 |
| 11 | /api/notebooks/[id]/shares | GET, POST, DELETE | ✅ | notebook_shares | RLS: shared_by = auth.uid() or invitee_email | FR-10 |

**Routes added this session:**
| 12 | /api/profile | GET, PATCH | ✅ | profiles | auth.uid() match | FR-11 |

**Audit notes:**
- Routes 7–11 all call `supabase.rpc('user_has_notebook_access')` as a secondary
  check in addition to RLS, providing defence-in-depth.
- Background pipeline jobs (processAudioOverviewJob, processArtifactJob) use the
  service_role client to bypass RLS — this is intentional and required for server-side
  operations. The service_role key is server-only (never exposed to client).
- Route 11 DELETE uses `shared_by = auth.uid()` guard before soft-delete to ensure
  only the sharer can revoke (not the invitee).

**Known deviations:**
- ARCHITECTURE-DEVIATION: audio-overview.ts and artifact-generator.ts bypass
  lib/ai/claude.ts wrapper and call Anthropic SDK directly. See CHANGELOG for
  formal deviation entry. Background pipeline context makes wrapper incompatible
  with the current rate-limit key design (userId not available in job context).
  Tracked as DEBT-02 — resolution: extend wrapper to accept optional userId.
| 13 | /api/audio-overviews/[id]/share | POST, DELETE | ✅ | audio_overviews | auth.uid() + notebook owner check | FR-16 |
| 14 | /api/user/profile | GET, PATCH | ✅ | profiles | auth.uid() match | FR-11 FR-18 |

**New public routes (no auth required — RLS-gated by share_enabled=true):**
| P1 | /audio/share/[token] | Server page | ✅ | audio_overviews | RLS: share_enabled=true AND share_token IS NOT NULL | FR-16 |

**FR-16 share design notes:**
- POST /share generates share_token (UUID) on first call, idempotent on subsequent calls
- DELETE /share sets share_enabled=false — token retained for audit, immediately blocks access
- Public share page generates short-lived signed storage URLs server-side (1-hour TTL)
- RLS policy "audio_overviews_public_share_read" only exposes: id, format, duration_seconds, storage_path, metadata, language, created_at — no PII
