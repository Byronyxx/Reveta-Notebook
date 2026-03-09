# Reveta Notebook — API Security Audit
## FR-14 Compliance Log

This document tracks every API route that accesses user data (notebooks, sources, messages, artifacts).
**Rule:** Every route must call `supabase.auth.getUser()` to derive the user identity. Zero exceptions. No `userId` parameter is ever trusted from a client request payload.

| Route | Method | Auth Check (`getUser()`) | Data Accessed | Scoped To User (`auth.uid()`) | Added |
|-------|--------|--------------------------|---------------|-------------------------------|-------|
| *(No API routes implemented yet)* | - | - | - | - | - |

**Audit Process:** Check each route added during Tier 1/2 phases and append it to this document immediately to maintain FR-14 status.
