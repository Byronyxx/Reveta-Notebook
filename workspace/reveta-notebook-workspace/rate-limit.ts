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

  const { data: notebook } = await supabase
    .from('notebooks')
    .select('id, name, description, owner_id')
    .eq('id', notebookId)
    .single()

  if (!notebook) notFound()

  const { data: sources } = await supabase
    .from('sources')
    .select('id, title, source_type, status, word_count, file_size_bytes, created_at, error')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false })

  const { data: chats } = await supabase
    .from('chats')
    .select('id, title, created_at')
    .eq('notebook_id', notebookId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <NotebookClient
      notebook={notebook}
      initialSources={sources || []}
      initialChats={chats || []}
      userId={user.id}
    />
  )
}
