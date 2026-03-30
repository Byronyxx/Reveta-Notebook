import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/chats — Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notebookId, title } = await req.json()
  if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 })

  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      notebook_id: notebookId,
      user_id: user.id,
      title: title?.slice(0, 100) || 'New Query',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chat }, { status: 201 })
}
