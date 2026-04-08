import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen items-center justify-center bg-page text-text-primary">
            <div className="w-full max-w-sm rounded-large border border-border-default bg-card p-reveta-5 shadow-lift">
                <h1 className="mb-reveta-4 reveta-h2 text-text-primary">Sign In</h1>
                <form action="/auth/login-google" method="post">
                    <button className="w-full rounded-component bg-interactive-primary px-reveta-3 py-reveta-2 reveta-body text-text-inverse hover:bg-interactive-primary-hover transition-colors">
                        Continue with Google
                    </button>
                </form>
            </div>
        </div>
    )
}
