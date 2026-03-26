# Reveta Notebook — Security Controls

## Authentication
- Google OAuth via Supabase Auth (no password storage)
- JWT sessions with 1-hour expiry and refresh token rotation
- Middleware session refresh on every request (`lib/supabase/middleware.ts`)

## Data Isolation
- Row Level Security (RLS) on all user-facing tables
- Every API route calls `auth.getUser()` before any DB access
- No userId trusted from client request payload
- Service role key isolated to server-side background pipeline only

## Rate Limiting
- Per-user sliding window: 30 AI requests/minute (Upstash Ratelimit)
- Background pipeline rate-limited under shared `background-pipeline` key
- Vercel function timeouts enforced per-route in `vercel.json`

## Input Security
- All API inputs validated with Zod schemas before processing
- SSRF protection in URL adapter: internal IPs blocked
- Whisper upload size limit: 25MB enforced before API call
- Source word count limit: 500,000 words enforced in pipeline

## Output Security
- Security headers set in `vercel.json`: HSTS, X-Frame-Options DENY, CSP
- Signed storage URLs for audio (1-hour TTL, server-generated)
- Share tokens are random UUIDs; revocation via `share_enabled=false` is immediate
- No PII exposed in public share page (no user IDs, email, or profile data)

## FR-14 Compliance
See `docs/api-security-audit.md` for the complete route-by-route audit log.
