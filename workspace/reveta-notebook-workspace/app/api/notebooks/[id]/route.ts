import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const NotebookUpdateSchema = z.object({
  name:            z.string().min(1).max(200).optional(),
  description:     z.string().max(1000).optional(),
  stylePreference: z.object({
    length:    z.enum(['concise', 'medium', 'detailed', 'comprehensive']),
    formality: z.enum(['casual', 'neutral', 'formal', 'academic']),
    format:    z.enum(['prose', 'bullets', 'structured']),
  }).optional(),
  responseLanguage: z.string().min(2).max(10).optional(),
})

// PATCH /api/notebooks/[id] — update notebook metadata + preferences
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = NotebookUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  // Verify user has edit access
  const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
    check_notebook_id: id,
    required_level: 'edit',
  })
  if (!hasAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  const updates: Record<string, unknown> = {}
  if (parsed.data.name)             updates.name = parsed.data.name
  if (parsed.data.description !== undefined) updates.description = parsed.data.description
  if (parsed.data.stylePreference)  updates.style_preference = parsed.data.stylePreference
  if (parsed.data.responseLanguage) updates.response_language = parsed.data.responseLanguage

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('notebooks')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: true })
}

// GET /api/notebooks/[id] — fetch notebook including preferences
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: notebook, error } = await supabase
    .from('notebooks')
    .select('id, name, description, style_preference, response_language, owner_id, created_at, updated_at')
    .eq('id', id)
    .single()

  if (error || !notebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Access check (owner or shared viewer)
  const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
    check_notebook_id: id,
    required_level: 'view',
  })
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  return NextResponse.json(notebook)
}
