import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AudioSharePlayer from './AudioSharePlayer'

export default async function AudioSharePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Look up overview by share token — no auth required, RLS allows share_enabled=true
  const { data: overview, error } = await supabase
    .from('audio_overviews')
    .select('id, format, duration_seconds, storage_path, metadata, language, created_at, share_enabled')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single()

  if (error || !overview) notFound()

  // Generate signed playback URL (1 hour) — server-side
  let signedUrl: string | null = null
  if (overview.storage_path) {
    const { data: signed } = await supabase.storage
      .from('audio-overviews')
      .createSignedUrl(overview.storage_path, 3600)
    signedUrl = signed?.signedUrl ?? null
  }

  return (
    <AudioSharePlayer
      overview={overview}
      signedUrl={signedUrl}
    />
  )
}
