import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const notebookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parseResult = notebookSchema.safeParse(body)
  if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.errors[0].message }, { status: 400 })
  }
  const { name, description } = parseResult.data

  // Use admin client for DB operations — user identity already verified above
  const adminDb = createAdminClient()
  const { data: notebook, error } = await adminDb
    .from('notebooks')
    .insert({ owner_id: user.id, name: name.trim(), description: description?.trim() || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notebook }, { status: 201 })
}

