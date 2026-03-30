import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: notebooks } = await supabase
    .from('notebooks')
    .select('id, name, description, created_at, updated_at')
    .order('updated_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <DashboardClient
      notebooks={notebooks || []}
      userEmail={user.email || ''}
      displayName={profile?.display_name || null}
    />
  )
}
