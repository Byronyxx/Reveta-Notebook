import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/audio-overviews/[id]/share
// Enables sharing and returns the share token. Idempotent — safe to call multiple times.
export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: overview } = await supabase
    .from('audio_overviews')
    .select('id, status, share_token, share_enabled, notebook_id')
    .eq('id', id)
    .single()

  if (!overview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Confirm the notebook belongs to this user
  const { data: notebook } = await supabase
    .from('notebooks')
    .select('owner_id')
    .eq('id', overview.notebook_id)
    .single()

  if (!notebook || notebook.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (overview.status !== 'ready') {
    return NextResponse.json({ error: 'Audio overview is not ready' }, { status: 400 })
  }

  // Generate token only once; reuse if already present
  const shareToken = overview.share_token ?? crypto.randomUUID()

  const { error } = await supabase
    .from('audio_overviews')
    .update({ share_token: shareToken, share_enabled: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/audio/share/${shareToken}`
  return NextResponse.json({ shareToken, shareUrl })
}

// DELETE /api/audio-overviews/[id]/share
// Revokes the share link immediately. Token is preserved for audit; share_enabled=false.
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: overview } = await supabase
    .from('audio_overviews')
    .select('id, notebook_id')
    .eq('id', id)
    .single()

  if (!overview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: notebook } = await supabase
    .from('notebooks')
    .select('owner_id')
    .eq('id', overview.notebook_id)
    .single()

  if (!notebook || notebook.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('audio_overviews')
    .update({ share_enabled: false })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ revoked: true })
}
