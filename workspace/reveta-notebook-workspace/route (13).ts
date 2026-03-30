import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const origin = new URL(request.url).origin

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    // Next.js requires throwing on redirect if inside Server Components, 
    // but in Route Handlers returning NextResponse.redirect works directly.
    if (error || !data.url) {
        return NextResponse.redirect(`${origin}/login?error=provider_error`, { status: 301 })
    }

    return NextResponse.redirect(data.url, { status: 301 })
}
