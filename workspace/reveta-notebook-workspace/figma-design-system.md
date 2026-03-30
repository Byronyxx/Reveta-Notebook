import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/notebooks/[id]/shares — List active shares for a notebook
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only owner can list shares
  const { data: notebook } = await supabase
    .from('notebooks')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!notebook || notebook.owner_id !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const { data: shares, error } = await supabase
    .from('notebook_shares')
    .select('id, invitee_email, invitee_id, access_level, accepted_at, revoked_at, created_at')
    .eq('notebook_id', id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shares: shares || [] })
}

// POST /api/notebooks/[id]/shares — Invite a collaborator
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, accessLevel = 'view' } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!['view', 'edit'].includes(accessLevel)) {
    return NextResponse.json({ error: 'accessLevel must be "view" or "edit"' }, { status: 400 })
  }

  // Verify requester has edit access
  const { data: hasAccess } = await supabase.rpc('user_has_notebook_access', {
    check_notebook_id: id,
    required_level: 'edit',
  })
  if (!hasAccess) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })

  // Check if invitee already has an active share
  const { data: existing } = await supabase
    .from('notebook_shares')
    .select('id, revoked_at')
    .eq('notebook_id', id)
    .eq('invitee_email', email.toLowerCase())
    .single()

  if (existing && !existing.revoked_at) {
    return NextResponse.json({ error: 'This email already has access to this notebook' }, { status: 409 })
  }

  // Look up invitee by email to pre-populate invitee_id if they're already a user
  const { data: inviteeProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (
      await supabase.rpc('get_user_id_by_email', { lookup_email: email.toLowerCase() })
    ).data)
    .single()

  const { data: share, error } = await supabase
    .from('notebook_shares')
    .insert({
      notebook_id: id,
      shared_by: user.id,
      invitee_email: email.toLowerCase(),
      invitee_id: inviteeProfile?.id || null,
      access_level: accessLevel,
    })
    .select('id, token, invitee_email, access_level')
    .single()

  if (error || !share) {
    return NextResponse.json({ error: error?.message || 'Failed to create share' }, { status: 500 })
  }

  // In production: send invite email via Resend/SendGrid using share.token
  // The invite link would be: /invite/[token]
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${share.token}`

  return NextResponse.json({
    shareId: share.id,
    inviteLink,
    inviteeEmail: share.invitee_email,
    accessLevel: share.access_level,
  }, { status: 201 })
}

// DELETE /api/notebooks/[id]/shares — Revoke a share by shareId in body
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shareId } = await req.json()
  if (!shareId) return NextResponse.json({ error: 'shareId required' }, { status: 400 })

  // Soft-delete: set revoked_at
  const { error } = await supabase
    .from('notebook_shares')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq('notebook_id', id)
    .eq('shared_by', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ revoked: true })
}
