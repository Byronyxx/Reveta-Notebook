import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jxwkqhgrbbdjykwbqdev.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4d2txaGdyYmJkanlrd2JxZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDQ5NDgsImV4cCI6MjA5MDYyMDk0OH0.W3iCff97L3ntInBY04widqY3bDJRFyUMyTqlShLmbpA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'http://localhost:3000/auth/callback',
        },
    })
    console.log('DATA:', data)
    console.log('ERROR:', error)
}
test()
