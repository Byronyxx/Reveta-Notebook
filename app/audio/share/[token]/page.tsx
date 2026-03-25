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

  const { data: overview } = await supabase
    .from('audio_overviews')
    .select('id, format, duration_seconds, storage_path, language, metadata')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single()

  if (!overview || !overview.storage_path) notFound()

  const { data: signed } = await supabase.storage
    .from('audio-overviews')
    .createSignedUrl(overview.storage_path, 3600)

  if (!signed?.signedUrl) notFound()

  return <AudioSharePlayer overview={overview} signedUrl={signed.signedUrl} />
}
