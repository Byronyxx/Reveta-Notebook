import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { DEFAULT_STYLE } from '@/lib/ai/prompts'

// ── ZOD VALIDATION SCHEMAS ────────────────────────────────────────────────────
const StylePreferenceSchema = z.object({
  length: z.enum(['concise', 'medium', 'detailed', 'comprehensive']).optional(),
  formality: z.enum(['casual', 'neutral', 'formal', 'academic']).optional(),
  format: z.enum(['prose', 'bullets', 'structured']).optional(),
  language: z.string().min(2).max(8).optional(),
}).strict()

// GET /api/user/profile — Fetch current style + language preferences
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, style_preference')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // Profile may not yet exist — return defaults
    return NextResponse.json({ style: DEFAULT_STYLE, displayName: null })
  }

  // Merge stored preferences with defaults (handles missing keys gracefully)
  const stored = profile.style_preference || {}
  const style = { ...DEFAULT_STYLE, ...stored }

  return NextResponse.json({ style, displayName: profile.display_name })
}

// PATCH /api/user/profile — Update style or language preferences
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = StylePreferenceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid style preference', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // Fetch current preferences to merge with (partial update)
  const { data: existing } = await supabase
    .from('profiles')
    .select('style_preference')
    .eq('id', user.id)
    .single()

  const currentStyle = existing?.style_preference || DEFAULT_STYLE
  const updatedStyle = { ...currentStyle, ...parsed.data }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, style_preference: updatedStyle })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ style: updatedStyle })
}
