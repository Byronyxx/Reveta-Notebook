import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/audio-overviews/[id] — Poll status + retrieve signed URL when ready
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: overview, error } = await supabase
    .from('audio_overviews')
    .select('id, format, status, duration_seconds, error, storage_path, metadata, language, created_at')
    .eq('id', id)
    .single()

  if (error || !overview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If ready, generate a short-lived signed URL for audio playback/download
  let signedUrl: string | null = null
  if (overview.status === 'ready' && overview.storage_path) {
    const { data: signed } = await supabase.storage
      .from('audio-overviews')
      .createSignedUrl(overview.storage_path, 3600) // 1-hour expiry

    signedUrl = signed?.signedUrl || null
  }

  return NextResponse.json({ ...overview, signedUrl })
}

// DELETE /api/audio-overviews/[id] — Delete an audio overview + its storage object
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get the overview to find the storage path
  const { data: overview } = await supabase
    .from('audio_overviews')
    .select('storage_path, creator_id')
    .eq('id', id)
    .single()

  if (!overview || overview.creator_id !== user.id) {
    return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
  }

  // Delete storage object if it exists
  if (overview.storage_path) {
    await supabase.storage.from('audio-overviews').remove([overview.storage_path])
  }

  // Delete the DB record
  await supabase.from('audio_overviews').delete().eq('id', id)

  return NextResponse.json({ deleted: true })
}
