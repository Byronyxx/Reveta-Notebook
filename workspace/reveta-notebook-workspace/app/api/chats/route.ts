import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const chatSchema = z.object({
  notebookId: z.string().uuid("Invalid notebookId"),
  title: z.string().optional()
});

// POST /api/chats — Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parseResult = chatSchema.safeParse(body)
  if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
  }
  const { notebookId, title } = parseResult.data

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
