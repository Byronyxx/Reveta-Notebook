'use client'
import { useState, useRef, useEffect } from 'react'

interface ShareOverview {
  id: string
  format: string
  duration_seconds: number | null
  metadata: Record<string, unknown> | null
  language: string | null
  created_at: string
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const FORMAT_LABELS: Record<string, string> = {
  deep_dive: 'Deep Dive',
  brief: 'Briefing',
  critique: 'Critical Analysis',
  debate: 'Debate',
  lecture: 'Lecture',
}

export default function AudioSharePlayer({
  overview,
  signedUrl,
}: {
  overview: ShareOverview
  signedUrl: string | null
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(overview.duration_seconds ?? 0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !signedUrl) return
    const onTime = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [signedUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  const skip = (secs: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + secs))
  }

  const formatLabel = FORMAT_LABELS[overview.format] ?? overview.format

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="w-full max-w-md surface-float rounded-large border border-border-default p-8 flex flex-col gap-6 shadow-2xl">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-primary-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <span className="reveta-label text-text-secondary">Reveta Notebook · Audio Overview</span>
        </div>

        {/* Format + language */}
        <div>
          <h1 className="reveta-h1 text-text-primary">{formatLabel}</h1>
          {overview.language && overview.language !== 'en' && (
            <p className="reveta-caption text-text-secondary mt-1 capitalize">{overview.language}</p>
          )}
        </div>

        {/* Waveform placeholder + progress bar */}
        <div className="flex flex-col gap-2">
          {/* Playhead track */}
          <div
            className="relative h-2 bg-neutral-800 rounded-full cursor-pointer group"
            onClick={seek}
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="absolute left-0 top-0 h-full bg-primary-500 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-300 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-quick"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          {/* Timestamps */}
          <div className="flex justify-between reveta-label text-text-secondary">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => skip(-15)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-quick"
            aria-label="Rewind 15 seconds"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!signedUrl}
            className={[
              'w-14 h-14 rounded-full flex items-center justify-center',
              'bg-primary-500 hover:bg-primary-400 active:scale-95',
              'transition-all duration-quick shadow-lg',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            ].join(' ')}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={() => skip(15)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-quick"
            aria-label="Forward 15 seconds"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
        </div>

        {/* Download */}
        {signedUrl && (
          <a
            href={signedUrl}
            download={`reveta-audio-${overview.format}.mp3`}
            className={[
              'flex items-center justify-center gap-2 h-10 rounded-component',
              'border border-border-default text-text-secondary hover:text-text-primary',
              'reveta-label transition-colors duration-quick',
            ].join(' ')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download MP3
          </a>
        )}

        {!signedUrl && (
          <p className="reveta-caption text-text-secondary text-center">Audio unavailable</p>
        )}

        {/* Footer */}
        <p className="reveta-label text-text-secondary text-center mt-2">
          Generated with{' '}
          <a href="/" className="text-primary-400 hover:text-primary-300 transition-colors duration-quick">
            Reveta Notebook
          </a>
        </p>
      </div>

      {/* Hidden audio element */}
      {signedUrl && <audio ref={audioRef} src={signedUrl} preload="metadata" />}
    </div>
  )
}
