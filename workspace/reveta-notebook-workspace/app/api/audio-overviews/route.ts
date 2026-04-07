import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processAudioOverviewJob } from '@/lib/ai/audio-overview'
import { AudioFormat } from '@/lib/ai/prompts'

const VALID_FORMATS: AudioFormat[] = ['deep_dive', 'brief', 'critique', 'debate', 'lecture']

// POST /api/audio-overviews — Trigger a new audio overview generation job
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notebookId, format, language = 'en' } = await req.json()

  if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 })
  if (!VALID_FORMATS.includes(format)) {
    return NextResponse.json({ error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}` }, { status: 400 })
  }

  // Verify user has edit access to the notebook
  const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
    check_notebook_id: notebookId,
    required_level: 'edit',
  })
  if (!hasAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  // Create the pending overview record
  const { data: overview, error: insertError } = await supabase
    .from('audio_overviews')
    .insert({
      notebook_id: notebookId,
      creator_id: user.id,
      format,
      language,
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !overview) {
    return NextResponse.json({ error: insertError?.message || 'Failed to create overview record' }, { status: 500 })
  }

  // Fire off the background pipeline — non-blocking
  processAudioOverviewJob(overview.id, notebookId, format as AudioFormat, language).catch(console.error)

  return NextResponse.json({ overviewId: overview.id, status: 'pending' }, { status: 202 })
}

// GET /api/audio-overviews?notebookId=... — List all overviews for a notebook
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notebookId = req.nextUrl.searchParams.get('notebookId')
  if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('audio_overviews')
    .select('id, format, status, duration_seconds, language, error, created_at, metadata')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ overviews: data || [] })
}
