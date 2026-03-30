import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/artifacts/[id] — Poll status + fetch full content when ready
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artifact, error } = await supabase
    .from('artifacts')
    .select('id, artifact_type, title, status, content, word_count, error, metadata, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !artifact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(artifact)
}

// DELETE /api/artifacts/[id] — Hard delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: artifact } = await supabase
    .from('artifacts')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!artifact || artifact.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
  }

  await supabase.from('artifacts').delete().eq('id', id)
  return NextResponse.json({ deleted: true })
}
