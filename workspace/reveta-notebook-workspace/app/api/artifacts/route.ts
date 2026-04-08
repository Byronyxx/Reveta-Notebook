import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processArtifactJob } from '@/lib/ai/artifact-generator'
import { ArtifactFormat, ARTIFACT_FORMAT_META } from '@/lib/ai/prompts'
import { z } from 'zod'

const VALID_FORMATS: ArtifactFormat[] = ['study_guide', 'brief', 'faq', 'timeline', 'mind_map', 'slide_deck']

const artifactSchema = z.object({
  notebookId: z.string().uuid("Invalid notebookId"),
  format: z.enum(['study_guide', 'brief', 'faq', 'timeline', 'mind_map', 'slide_deck']),
  sourceIds: z.array(z.string().uuid()).optional()
});


// POST /api/artifacts — Trigger artifact generation
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parseResult = artifactSchema.safeParse(body)
  
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
  }
  
  const { notebookId, format, sourceIds } = parseResult.data;

  // FR-17: Validate sourceIds array when provided (must be UUIDs, mind_map format only)
  const activeScopeIds: string[] | undefined =
    format === 'mind_map' && Array.isArray(sourceIds) && sourceIds.length > 0
      ? sourceIds.filter((id: unknown) => typeof id === 'string' && id.length > 0)
      : undefined

  const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
    check_notebook_id: notebookId,
    required_level: 'edit',
  })
  if (!hasAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  const meta = ARTIFACT_FORMAT_META[format as ArtifactFormat]

  const { data: artifact, error } = await supabase
    .from('artifacts')
    .insert({
      notebook_id: notebookId,
      creator_id: user.id,
      artifact_type: format,
      title: `${meta.label}`,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !artifact) {
    return NextResponse.json({ error: error?.message || 'Failed to create artifact' }, { status: 500 })
  }

  // Fire-and-forget background generation (FR-17: passes sourceIds for mind_map scoping)
  processArtifactJob(artifact.id, notebookId, format as ArtifactFormat, activeScopeIds).catch(console.error)

  return NextResponse.json({ artifactId: artifact.id, status: 'pending' }, { status: 202 })
}

// GET /api/artifacts?notebookId=... — List all artifacts for a notebook
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notebookId = req.nextUrl.searchParams.get('notebookId')
  if (!notebookId) return NextResponse.json({ error: 'notebookId is required' }, { status: 400 })

  const { data, error } = await supabase
    .from('artifacts')
    .select('id, artifact_type, title, status, word_count, error, created_at, updated_at')
    .eq('notebook_id', notebookId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ artifacts: data || [] })
}
