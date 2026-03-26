# Reveta Notebook — Enterprise Deployment

## FR-13: VPC-SC + IAM Framework

The enterprise deployment capability is scaffolded in the database schema (organisations, org_members, audit_log tables) and role system (user_role enum: viewer | editor | admin | enterprise_admin). Full implementation is deferred to a future milestone.

### Current enterprise-grade features:
- RLS policies on all tables with ownership-based isolation
- Audit log table with immutable append-only writes
- RBAC role system via org_members table
- Service role key isolation for background pipelines

### Planned enterprise features:
- VPC-SC integration for GCP customers
- SSO/SAML via Supabase Auth enterprise providers
- Per-org rate limits and usage quotas
- Org-level data retention policies
