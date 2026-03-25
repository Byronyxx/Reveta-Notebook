import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import NotebookClient from './NotebookClient'

interface PageProps {
  params: Promise<{ notebookId: string }>
}

export default async function NotebookPage({ params }: PageProps) {
  const { notebookId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: notebook, error } = await supabase
    .from('notebooks')
    .select('id, name, description, owner_id')
    .eq('id', notebookId)
    .single()

  if (error || !notebook) notFound()

  return (
    <NotebookClient
      notebook={notebook}
      userId={user.id}
      userEmail={user.email ?? ''}
    />
  )
}
