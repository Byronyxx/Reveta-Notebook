import { createClient } from '@/lib/supabase/server'

export type UserRole = 'viewer' | 'editor' | 'admin' | 'enterprise_admin'

export async function getUserRole(orgId: string, userId: string): Promise<UserRole | null> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('org_members').select('role').eq('org_id', orgId).eq('user_id', userId).single()
    if (error || !data) return null
    return data.role as UserRole
}

export async function requireRole(orgId: string, userId: string, minimum: UserRole): Promise<boolean> {
    const hierarchy: UserRole[] = ['viewer', 'editor', 'admin', 'enterprise_admin']
    const role = await getUserRole(orgId, userId)
    if (!role) return false
    return hierarchy.indexOf(role) >= hierarchy.indexOf(minimum)
}
