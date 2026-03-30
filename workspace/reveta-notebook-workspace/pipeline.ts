'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { Badge, Spinner } from '@/components/ui/Primitives'
import { AUDIO_FORMAT_META, AudioFormat } from '@/lib/ai/prompts'

// ── FR-06: SUPPORTED LANGUAGES ────────────────────────────────────────────────
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' }, { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' }, { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' }, { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文（简体）' }, { code: 'zh-TW', label: '中文（繁體）' },
  { code: 'ko', label: '한국어' }, { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' }, { code: 'tr', label: 'Türkçe' },
  { code: 'sv', label: 'Svenska' }, { code: 'da', label: 'Dansk' },
  { code: 'no', label: 'Norsk' }, { code: 'fi', label: 'Suomi' },
  { code: 'he', label: 'עברית' }, { code: 'id', label: 'Indonesia' },
  { code: 'vi', label: 'Tiếng Việt' }, { code: 'th', label: 'ภาษาไทย' },
  { code: 'uk', label: 'Українська' }, { code: 'cs', label: 'Čeština' },
  { code: 'ro', label: 'Română' }, { code: 'hu', label: 'Magyar' },
  { code: 'el', label: 'Ελληνικά' }, { code: 'ms', label: 'Melayu' },
]



// ── TYPES ─────────────────────────────────────────────────────────────────────

interface AudioOverview {
  id: string
  format: AudioFormat
  status: 'pending' | 'generating_script' | 'synthesizing' | 'ready' | 'error'
  duration_seconds: number | null
  error: string | null
  created_at: string
  signedUrl?: string | null
  metadata?: Record<string, unknown>
  share_token?: string | null   // FR-16
  share_enabled?: boolean        // FR-16
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function statusLabel(status: AudioOverview['status']): string {
  return {
    pending: 'Queued',
    generating_script: 'Writing script…',
    synthesizing: 'Synthesizing audio…',
    ready: 'Ready',
    error: 'Failed',
  }[status]
}

function statusBadgeVariant(status: AudioOverview['status']): 'default' | 'info' | 'success' | 'error' {
  return {
    pending: 'default',
    generating_script: 'info',
    synthesizing: 'info',
    ready: 'success',
    error: 'error',
  }[status] as 'default' | 'info' | 'success' | 'error'
}

// ── FORMAT ICONS (inline SVG for zero-dependency icons) ────────────────────────

const FormatIcons: Record<string, React.ReactNode> = {
  radio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 7.5l16.5-4.125M12 6.75c-2.708 0-5.363.224-7.948.655C2.999 7.505 2.25 8.609 2.25 9.833v9.09c0 1.223.75 2.328 1.802 2.429A49.49 49.49 0 0012 21.75c2.669 0 5.29-.199 7.948-.655 1.051-.1 1.802-1.206 1.802-2.43v-9.09c0-1.224-.75-2.328-1.802-2.428A49.517 49.517 0 0012 6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 17.25a4.5 4.5 0 009 0M15 12H9" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  scale: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
}

// ── AUDIO PLAYER ──────────────────────────────────────────────────────────────

function AudioPlayer({ signedUrl, title, duration }: {
  signedUrl: string
  title: string
  duration: number | null
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(1)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = ratio * totalDuration
  }

  const skipBy = (seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0,
      Math.min(audioRef.current.currentTime + seconds, totalDuration))
  }

  const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className="surface-float rounded-large p-reveta-4 flex flex-col gap-reveta-3">
      <audio
        ref={audioRef}
        src={signedUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onDurationChange={() => setTotalDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        aria-label={`Audio overview: ${title}`}
      />

      {/* Title row */}
      <div className="flex items-center justify-between gap-reveta-2">
        <p className="reveta-caption font-medium text-text-primary truncate">{title}</p>
        <div className="flex items-center gap-reveta-1 shrink-0">
          <span className="reveta-label text-text-secondary">
            {formatDuration(currentTime)} / {formatDuration(Math.round(totalDuration))}
          </span>
          <a
            href={signedUrl}
            download
            className="p-1 text-text-secondary hover:text-signal-300 transition-colors duration-quick rounded"
            aria-label="Download audio"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 bg-neutral-800 rounded-full cursor-pointer group"
        onClick={seek}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Playback position"
      >
        <div
          className="h-full bg-signal-500 rounded-full group-hover:bg-signal-300 transition-colors duration-quick relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-signal-300 rounded-full -mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-quick" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-reveta-3">
        <button
          onClick={() => skipBy(-15)}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick"
          aria-label="Skip back 15 seconds"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="sr-only">−15s</span>
        </button>

        <button
          onClick={toggle}
          className={[
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            'bg-primary-400 hover:bg-primary-300 text-neutral-50',
            'transition-[background-color,transform] duration-quick hover:scale-105 active:scale-95',
          ].join(' ')}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={() => skipBy(30)}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick"
          aria-label="Skip forward 30 seconds"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="sr-only">+30s</span>
        </button>
      </div>
    </div>
  )
}

// ── FORMAT CARD ───────────────────────────────────────────────────────────────

// ── FR-16: AUDIO SHARE PANEL ──────────────────────────────────────────────────
function AudioSharePanel({
  overview,
  onShareToggle,
}: {
  overview: AudioOverview
  onShareToggle: (id: string, enabled: boolean, token?: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = overview.share_token ? `${appUrl}/audio/share/${overview.share_token}` : null

  const toggle = async () => {
    setLoading(true)
    try {
      if (overview.share_enabled) {
        await fetch(`/api/audio-overviews/${overview.id}/share`, { method: 'DELETE' })
        onShareToggle(overview.id, false)
      } else {
        const res = await fetch(`/api/audio-overviews/${overview.id}/share`, { method: 'POST' })
        const data = await res.json()
        onShareToggle(overview.id, true, data.shareToken)
      }
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="pt-reveta-3 border-t border-border-default flex flex-col gap-reveta-2">
      <div className="flex items-center gap-reveta-2">
        <button
          onClick={toggle}
          disabled={loading}
          className={[
            'flex items-center gap-reveta-1.5 h-7 px-reveta-2 rounded-component reveta-label',
            'border transition-all duration-quick',
            overview.share_enabled
              ? 'bg-signal-900 border-signal-500 text-signal-200 hover:bg-signal-800'
              : 'surface-float border-border-default text-text-secondary hover:text-text-primary hover:border-neutral-600',
            loading ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          aria-pressed={!!overview.share_enabled}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          {overview.share_enabled ? 'Shared' : 'Share'}
        </button>
        {overview.share_enabled && shareUrl && (
          <button
            onClick={copy}
            className="reveta-label text-text-secondary hover:text-text-primary transition-colors duration-quick"
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        )}
      </div>
      {overview.share_enabled && shareUrl && (
        <div className="flex items-center gap-reveta-2 px-reveta-2 py-reveta-1.5 surface-ground rounded border border-border-default">
          <code className="reveta-label text-text-secondary truncate flex-1 text-[10px]">{shareUrl}</code>
          <button onClick={copy} className="shrink-0 reveta-label text-primary-400 hover:text-primary-300 transition-colors duration-quick">
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}

function FormatCard({
  format,
  overview,
  onGenerate,
  onDelete,
  onShareToggle,
  readySources,
}: {
  format: AudioFormat
  overview: AudioOverview | null
  onGenerate: (format: AudioFormat) => void
  onDelete: (id: string) => void
  onShareToggle: (id: string, enabled: boolean, token?: string) => void
  readySources: number
}) {
  const meta = AUDIO_FORMAT_META[format]
  const isProcessing = overview?.status === 'pending' ||
    overview?.status === 'generating_script' ||
    overview?.status === 'synthesizing'
  const isReady = overview?.status === 'ready'
  const isError = overview?.status === 'error'
  const hasSources = readySources > 0

  return (
    <div className={[
      'surface-ground rounded-large p-reveta-4 border border-border-default',
      'flex flex-col gap-reveta-3 transition-all duration-quick',
      isReady ? 'surface-brand-border' : '',
    ].join(' ')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-reveta-2">
        <div className="flex items-center gap-reveta-2">
          <div className={[
            'w-9 h-9 rounded-component flex items-center justify-center shrink-0',
            isReady ? 'bg-primary-700 text-primary-200' : 'bg-neutral-800 text-text-secondary',
          ].join(' ')} aria-hidden="true">
            {FormatIcons[meta.icon]}
          </div>
          <div>
            <p className="reveta-h3 text-text-primary">{meta.label}</p>
            <p className="reveta-label text-text-secondary">{meta.duration}</p>
          </div>
        </div>

        {overview && (
          <div className="flex items-center gap-reveta-1 shrink-0">
            <Badge variant={statusBadgeVariant(overview.status)}>
              {statusLabel(overview.status)}
            </Badge>
            {!isProcessing && (
              <button
                onClick={() => onDelete(overview.id)}
                className="p-1 text-text-secondary hover:text-error transition-colors duration-quick rounded"
                aria-label={`Delete ${meta.label} overview`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="reveta-caption text-text-secondary">{meta.description}</p>

      {/* Hosts indicator */}
      <div className="flex items-center gap-reveta-2">
        <span className="reveta-label text-text-secondary">
          {meta.hosts === 'dual' ? '2 hosts · Alex & Sam' : '1 host · Alex'}
        </span>
        <span className="text-neutral-700">·</span>
        <span className="reveta-label text-text-secondary">
          {meta.hosts === 'dual' ? 'alloy + echo voices' : 'nova voice'}
        </span>
      </div>

      {/* Processing state */}
      {isProcessing && overview && (
        <div className="flex items-center gap-reveta-2 py-reveta-2">
          <Spinner size="sm" />
          <p className="reveta-caption text-signal-300 animate-pulse">
            {statusLabel(overview.status)}
          </p>
        </div>
      )}

      {/* FR-16: Share panel — only when ready */}
      {isReady && overview && (
        <AudioSharePanel overview={overview} onShareToggle={onShareToggle} />
      )}

      {/* Error state */}
      {isError && overview?.error && (
        <div className="surface-ground rounded-component p-reveta-2 border border-error/30">
          <p className="reveta-caption text-error line-clamp-3">{overview.error}</p>
        </div>
      )}

      {/* Audio player when ready */}
      {isReady && overview?.signedUrl && (
        <AudioPlayer
          signedUrl={overview.signedUrl}
          title={`${meta.label} Overview`}
          duration={overview.duration_seconds}
        />
      )}

      {/* Generate / Regenerate button */}
      {!isProcessing && (
        <Button
          variant={isReady ? 'ghost' : 'primary'}
          size="sm"
          onClick={() => onGenerate(format)}
          disabled={!hasSources}
          className="w-full"
          icon={
            isReady ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            )
          }
        >
          {!hasSources ? 'Add sources first' : isReady ? 'Regenerate' : isError ? 'Retry' : 'Generate'}
        </Button>
      )}
    </div>
  )
}

// ── MAIN AUDIO STUDIO ─────────────────────────────────────────────────────────

export default function AudioStudio({
  notebookId,
  readySources,
}: {
  notebookId: string
  readySources: number
}) {
  const [overviews, setOverviews] = useState<AudioOverview[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [loading, setLoading] = useState(true)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formats: AudioFormat[] = ['deep_dive', 'brief', 'critique', 'debate', 'lecture']

  // Build a map from format → most recent overview
  const overviewByFormat: Record<string, AudioOverview> = {}
  for (const ov of overviews) {
    if (!overviewByFormat[ov.format]) overviewByFormat[ov.format] = ov
  }

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchOverviews = useCallback(async () => {
    const res = await fetch(`/api/audio-overviews?notebookId=${notebookId}`)
    if (!res.ok) return
    const data = await res.json()
    setOverviews(data.overviews || [])
  }, [notebookId])

  // ── Poll status for in-progress items ────────────────────────────────────
  const pollSingleStatus = useCallback(async (id: string) => {
    const res = await fetch(`/api/audio-overviews/${id}`)
    if (!res.ok) return
    const updated = await res.json()
    setOverviews(prev => prev.map(ov => ov.id === id ? { ...ov, ...updated } : ov))
  }, [])

  useEffect(() => {
    fetchOverviews().finally(() => setLoading(false))
  }, [fetchOverviews])

  // Auto-poll any in-progress overviews every 4 seconds
  useEffect(() => {
    const inProgress = overviews.filter(ov =>
      ov.status === 'pending' || ov.status === 'generating_script' || ov.status === 'synthesizing'
    )

    if (inProgress.length === 0) {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        inProgress.forEach(ov => pollSingleStatus(ov.id))
      }, 4000)
    }

    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  }, [overviews, pollSingleStatus])

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async (format: AudioFormat) => {
    const res = await fetch('/api/audio-overviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebookId, format, language: selectedLanguage }),
    })
    if (!res.ok) return
    const { overviewId } = await res.json()

    const newOverview: AudioOverview = {
      id: overviewId,
      format,
      status: 'pending',
      duration_seconds: null,
      error: null,
      created_at: new Date().toISOString(),
    }

    setOverviews(prev => {
      // Replace existing overview for this format if any
      const filtered = prev.filter(ov => ov.format !== format)
      return [newOverview, ...filtered]
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setOverviews(prev => prev.filter(ov => ov.id !== id))
    await fetch(`/api/audio-overviews/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-reveta-8">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-reveta-5 px-reveta-5 py-reveta-5">
      {/* Studio header */}
      <div>
        <p className="reveta-label text-text-secondary mb-reveta-1">Audio Studio</p>
        <h2 className="reveta-h2 text-text-primary">Generate Audio Overviews</h2>
        <p className="reveta-caption text-text-secondary mt-reveta-2">
          Five formats, grounded in your sources. All synthesized by OpenAI TTS.
          {readySources === 0 && (
            <span className="text-warning"> · Add and process at least one source to generate audio.</span>
          )}
        </p>
      </div>

      {/* Language selector — FR-06 */}
      <div className="flex items-center gap-reveta-3 flex-wrap">
        <div className="flex items-center gap-reveta-2">
          <label htmlFor="audio-language" className="reveta-label text-text-secondary shrink-0">
            Output language
          </label>
          <select
            id="audio-language"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className={[
              'surface-ground border border-border-default rounded-component',
              'px-reveta-3 h-9 text-t-08 text-text-primary',
              'outline-none transition-[border-color] duration-quick',
              'hover:border-neutral-600 focus:surface-signal-glow',
            ].join(' ')}
            aria-label="Select audio output language"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
        {selectedLanguage !== 'en' && (
          <p className="reveta-label text-signal-300">
            Script and audio will be generated in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.label}
          </p>
        )}
      </div>

      {/* Format cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-reveta-3">
        {formats.map(format => (
          <FormatCard
            key={format}
            format={format}
            overview={overviewByFormat[format] || null}
            onGenerate={handleGenerate}
            onDelete={handleDelete}
            onShareToggle={(id, enabled, token) => {
              setOverviews(prev => prev.map(ov =>
                ov.id === id
                  ? { ...ov, share_enabled: enabled, ...(token ? { share_token: token } : {}) }
                  : ov
              ))
            }}
            readySources={readySources}
          />
        ))}
      </div>

      {/* FR-14 compliance note */}
      <p className="reveta-label text-text-secondary text-center border-t border-border-default pt-reveta-3">
        Audio is generated strictly from your sources · Never used to train AI models · Signed URLs expire after 1 hour
      </p>
    </div>
  )
}
