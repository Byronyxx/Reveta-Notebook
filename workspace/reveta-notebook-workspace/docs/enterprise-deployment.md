# Reveta Notebook — Enterprise Deployment Specification
## FR-13 VPC-SC Compliance Architecture

### Application-Layer Controls (implemented in codebase)
- RBAC via Supabase RLS + `org_members` role system
- IAM roles: `viewer` / `editor` / `admin` / `enterprise_admin`
- All data access scoped to authenticated org membership
- Role enforcement in API routes via `src/lib/auth/roles.ts`

### Infrastructure-Layer Controls (required for VPC-SC compliance)
For enterprise deployments requiring VPC Service Controls:
- **Database**: migrate from Supabase-hosted to Google Cloud SQL (PostgreSQL) within a VPC-SC perimeter
- **Compute**: deploy Next.js to Google Cloud Run (within perimeter) instead of Vercel
- **Storage**: use Google Cloud Storage (within perimeter) for source files
- **AI inference**: route Claude API calls through a VPC-connected proxy to maintain perimeter integrity
- **IAM**: integrate Google Workspace Admin SDK for user provisioning and role synchronisation with the `org_members` table

### Audit Log Requirements
- All data access events logged to a tamper-evident audit table
- Log schema: `user_id`, `org_id`, `action`, `resource_type`, `resource_id`, `timestamp`
- Retention: minimum 90 days
- Read access: extremely restricted. Viewable only by `enterprise_admin` roles.
