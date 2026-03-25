import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { DEFAULT_STYLE } from '@/lib/ai/prompts'

// ── ZOD VALIDATION SCHEMA (strict) ──
const StylePreferenceSchema = z.object({
  length:    z.enum(['concise', 'medium', 'detailed', 'comprehensive']),
  formality: z.enum(['casual', 'neutral', 'formal', 'academic']),
  format:    z.enum(['prose', 'bullets', 'structured']),
  language:  z.string().min(2).max(10).optional(),
})

const ProfilePatchSchema = z.object({
  display_name:     z.string().min(1).max(100).optional(),
  style_preference: StylePreferenceSchema.optional(),
})

// GET /api/user/profile — Fetch current user's profile
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, style_preference, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // Auto-create profile row if missing (race condition fallback)
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({ id: user.id, display_name: user.email?.split('@')[0] || 'User', style_preference: DEFAULT_STYLE })
      .select()
      .single()
    return NextResponse.json(newProfile || { id: user.id, style_preference: DEFAULT_STYLE })
  }

  return NextResponse.json(profile)
}

// PATCH /api/user/profile — Update display name and/or style preferences
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProfilePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (parsed.data.display_name)     updates.display_name = parsed.data.display_name
  if (parsed.data.style_preference) updates.style_preference = parsed.data.style_preference

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: true })
}
