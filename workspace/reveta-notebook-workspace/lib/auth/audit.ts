import { createClient } from '@/lib/supabase/server'

export async function logAuditEvent(params: {
    userId: string
    orgId?: string
    action: string
    resourceType: string
    resourceId?: string
    metadata?: Record<string, unknown>
}) {
    const supabase = await createClient()

    // Fire-and-forget — audit failure must never block user operations
    supabase.from('audit_log').insert({
        user_id: params.userId,
        org_id: params.orgId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        metadata: params.metadata,
    }).then((res) => {
        if (res.error) console.error('Audit Log Failure [Silent]:', res.error);
    })
}
