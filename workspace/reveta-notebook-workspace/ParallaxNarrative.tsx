import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    if (!id) {
        return NextResponse.json({ error: 'Source ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('sources')
        .select('status, error, word_count, file_size_bytes')
        .eq('id', id)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Source not found or access denied' }, { status: 404 })
    }

    return NextResponse.json(data)
}
