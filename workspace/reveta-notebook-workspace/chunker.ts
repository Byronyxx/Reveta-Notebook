'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Badge, Spinner, EmptyState } from '@/components/ui/Primitives'
import { ARTIFACT_FORMAT_META, ArtifactFormat } from '@/lib/ai/prompts'

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface Artifact {
  id: string
  artifact_type: ArtifactFormat
  title: string
  status: 'pending' | 'generating' | 'ready' | 'error'
  word_count: number | null
  error: string | null
  created_at: string
  content?: string
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function statusBadgeVariant(status: Artifact['status']) {
  return { pending: 'default', generating: 'info', ready: 'success', error: 'error' }[status] as
    'default' | 'info' | 'success' | 'error'
}

function statusLabel(status: Artifact['status']) {
  return { pending: 'Queued', generating: 'Generating…', ready: 'Ready', error: 'Failed' }[status]
}

// Minimal markdown-to-HTML renderer (no external deps)
function renderMarkdown(md: string): string {
  return md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4 class="reveta-h4 text-text-primary mt-4 mb-1.5">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="reveta-h3 text-text-primary mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="reveta-h2 text-text-primary mt-6 mb-2 pb-1.5 border-b border-border-default">$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text-primary">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="text-text-secondary italic">$1</em>')
    // Code inline
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-neutral-800 reveta-label font-mono text-signal-300">$1</code>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="surface-ground rounded-component p-reveta-3 overflow-x-auto my-3"><code class="reveta-label font-mono text-text-secondary">$1</code></pre>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (row) => {
      if (row.includes('---')) return '<tr class="border-b border-neutral-800"></tr>'
      const cells = row.split('|').filter(c => c.trim())
      const tag = row.includes('**') ? 'th' : 'td'
      return '<tr>' + cells.map(c => `<${tag} class="px-3 py-2 text-left reveta-caption text-text-secondary">${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    .replace(/((<tr>.*<\/tr>\n?)+)/g, '<table class="w-full border-collapse border border-border-default rounded-component overflow-hidden my-3 text-sm">$1</table>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="reveta-caption text-text-secondary ml-4 mb-1 list-disc">$1</li>')
    .replace(/^  - (.+)$/gm, '<li class="reveta-caption text-text-secondary ml-8 mb-0.5 list-circle">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-2">$&</ul>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="reveta-caption text-text-secondary ml-4 mb-1 list-decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border-default my-4" />')
    // Paragraphs (double newline)
    .replace(/\n\n(?!<)/g, '</p><p class="reveta-body text-text-secondary mb-3 leading-relaxed">')
    .replace(/^(?!<)/, '<p class="reveta-body text-text-secondary mb-3 leading-relaxed">')
}

// ── ICON SVGs ─────────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
  'book-open': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  'file-text': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'help-circle': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ),
  'clock': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'git-branch': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
    </svg>
  ),
  'layout': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
}

// ── ARTIFACT VIEWER ───────────────────────────────────────────────────────────

function ArtifactViewer({
  artifact,
  onClose,
}: {
  artifact: Artifact
  onClose: () => void
}) {
  const [content, setContent] = useState(artifact.content || '')
  const [loading, setLoading] = useState(!artifact.content)
  const [copied, setCopied] = useState(false)
  const meta = ARTIFACT_FORMAT_META[artifact.artifact_type]

  useEffect(() => {
    if (artifact.content) { setContent(artifact.content); return }
    fetch(`/api/artifacts/${artifact.id}`)
      .then(r => r.json())
      .then(d => setContent(d.content || ''))
      .finally(() => setLoading(false))
  }, [artifact.id, artifact.content])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.replace(/\s+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Viewer panel */}
      <div className="relative ml-auto w-full max-w-3xl surface-ground flex flex-col h-full border-l border-border-default shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-reveta-3 px-reveta-5 py-reveta-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-reveta-3">
            <div className="w-9 h-9 rounded-component bg-primary-800 text-primary-200 flex items-center justify-center shrink-0">
              {ICONS[meta.icon]}
            </div>
            <div>
              <h2 className="reveta-h3 text-text-primary">{meta.label}</h2>
              {artifact.word_count && (
                <p className="reveta-label text-text-secondary">{artifact.word_count.toLocaleString()} words · {meta.readTime} read</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-reveta-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}
              icon={copied
                ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              }
            >{copied ? 'Copied!' : 'Copy'}</Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}
              icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>}
            >Download</Button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded"
              aria-label="Close artifact viewer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-reveta-6 py-reveta-5">
          {loading ? (
            <div className="flex items-center justify-center py-reveta-12">
              <Spinner size="md" />
            </div>
          ) : (
            <article
              className="prose-reveta max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── FORMAT CARD ───────────────────────────────────────────────────────────────

function ArtifactCard({
  format,
  artifact,
  onGenerate,
  onDelete,
  onView,
  readySources,
}: {
  format: ArtifactFormat
  artifact: Artifact | null
  onGenerate: (f: ArtifactFormat) => void
  onDelete: (id: string) => void
  onView: (a: Artifact) => void
  readySources: number
}) {
  const meta = ARTIFACT_FORMAT_META[format]
  const isProcessing = artifact?.status === 'pending' || artifact?.status === 'generating'
  const isReady = artifact?.status === 'ready'
  const isError = artifact?.status === 'error'

  return (
    <div className={[
      'surface-ground rounded-large p-reveta-4 border border-border-default',
      'flex flex-col gap-reveta-3 transition-all duration-quick',
      isReady ? 'surface-brand-border' : '',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-reveta-2">
        <div className="flex items-center gap-reveta-2">
          <div className={[
            'w-9 h-9 rounded-component flex items-center justify-center shrink-0',
            isReady ? 'bg-primary-700 text-primary-200' : 'bg-neutral-800 text-text-secondary',
          ].join(' ')}>
            {ICONS[meta.icon]}
          </div>
          <div>
            <p className="reveta-h3 text-text-primary">{meta.label}</p>
            <p className="reveta-label text-text-secondary">{meta.readTime} read</p>
          </div>
        </div>

        {artifact && (
          <div className="flex items-center gap-reveta-1 shrink-0">
            <Badge variant={statusBadgeVariant(artifact.status)}>
              {statusLabel(artifact.status)}
            </Badge>
            {isReady && (
              <span className="reveta-label text-text-secondary">
                {artifact.word_count?.toLocaleString()}w
              </span>
            )}
            {!isProcessing && (
              <button
                onClick={() => onDelete(artifact.id)}
                className="p-1 text-text-secondary hover:text-error transition-colors duration-quick rounded"
                aria-label={`Delete ${meta.label}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <p className="reveta-caption text-text-secondary">{meta.description}</p>

      {isProcessing && (
        <div className="flex items-center gap-reveta-2 py-reveta-1">
          <Spinner size="sm" />
          <p className="reveta-caption text-signal-300 animate-pulse">{statusLabel(artifact!.status)}</p>
        </div>
      )}

      {isError && artifact?.error && (
        <div className="surface-ground rounded-component p-reveta-2 border border-error/30">
          <p className="reveta-caption text-error line-clamp-2">{artifact.error}</p>
        </div>
      )}

      <div className="flex gap-reveta-2 mt-auto">
        {isReady && (
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onView(artifact!)}>
            View
          </Button>
        )}
        {!isProcessing && (
          <Button
            variant={isReady ? 'ghost' : 'primary'}
            size="sm"
            className="flex-1"
            disabled={!readySources}
            onClick={() => onGenerate(format)}
            icon={isReady ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            ) : undefined}
          >
            {!readySources ? 'Add sources' : isReady ? 'Regenerate' : isError ? 'Retry' : 'Generate'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ArtifactStudio({
  notebookId,
  readySources,
  allSources = [],
}: {
  notebookId: string
  readySources: number
  allSources?: { id: string; title: string; source_type: string }[]
}) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null)
  // FR-17: source scope for mind_map format
  const [mindMapSourceIds, setMindMapSourceIds] = useState<string[] | null>(null)
  const [showMindMapPicker, setShowMindMapPicker] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const formats: ArtifactFormat[] = ['study_guide', 'brief', 'faq', 'timeline', 'mind_map', 'slide_deck']

  const artifactByFormat: Record<string, Artifact> = {}
  for (const a of artifacts) {
    if (!artifactByFormat[a.artifact_type]) artifactByFormat[a.artifact_type] = a
  }

  const fetchArtifacts = useCallback(async () => {
    const res = await fetch(`/api/artifacts?notebookId=${notebookId}`)
    if (!res.ok) return
    const data = await res.json()
    setArtifacts(data.artifacts || [])
  }, [notebookId])

  const pollSingle = useCallback(async (id: string) => {
    const res = await fetch(`/api/artifacts/${id}`)
    if (!res.ok) return
    const updated = await res.json()
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    // Also update viewer if open
    setViewingArtifact(prev => prev?.id === id ? { ...prev, ...updated } : prev)
  }, [])

  useEffect(() => {
    fetchArtifacts().finally(() => setLoading(false))
  }, [fetchArtifacts])

  useEffect(() => {
    const inProgress = artifacts.filter(a => a.status === 'pending' || a.status === 'generating')
    if (inProgress.length === 0) {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      return
    }
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        inProgress.forEach(a => pollSingle(a.id))
      }, 4000)
    }
    return () => {
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  }, [artifacts, pollSingle])

  const handleGenerate = async (format: ArtifactFormat) => {
    const body: Record<string, unknown> = { notebookId, format }
    // FR-17: include source scope for mind_map when user has made a selection
    if (format === 'mind_map' && mindMapSourceIds && mindMapSourceIds.length > 0) {
      body.sourceIds = mindMapSourceIds
    }
    const res = await fetch('/api/artifacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return
    const { artifactId } = await res.json()
    const meta = ARTIFACT_FORMAT_META[format]
    const newArtifact: Artifact = {
      id: artifactId,
      artifact_type: format,
      title: meta.label,
      status: 'pending',
      word_count: null,
      error: null,
      created_at: new Date().toISOString(),
    }
    setArtifacts(prev => [newArtifact, ...prev.filter(a => a.artifact_type !== format)])
  }

  const handleDelete = async (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id))
    if (viewingArtifact?.id === id) setViewingArtifact(null)
    await fetch(`/api/artifacts/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return <div className="flex items-center justify-center py-reveta-10"><Spinner size="md" /></div>
  }

  return (
    <>
      <div className="flex flex-col gap-reveta-5 px-reveta-5 py-reveta-5">
        {/* Header */}
        <div>
          <p className="reveta-label text-text-secondary mb-reveta-1">Studio</p>
          <h2 className="reveta-h2 text-text-primary">Generate Artefacts</h2>
          <p className="reveta-caption text-text-secondary mt-reveta-2">
            Six output formats generated from your sources and rendered instantly.
            {!readySources && <span className="text-warning"> · Process at least one source to unlock generation.</span>}
          </p>
        </div>

        {/* FR-17: Mind Map source scope picker — shown when allSources > 1 */}
        {allSources.length > 1 && (
          <div className="surface-ground border border-border-default rounded-component p-reveta-3">
            <div className="flex items-center justify-between gap-reveta-3 flex-wrap">
              <div>
                <p className="reveta-label font-medium text-text-primary">Mind Map scope</p>
                <p className="reveta-label text-text-secondary">
                  {mindMapSourceIds
                    ? `Scoped to ${mindMapSourceIds.length} source${mindMapSourceIds.length !== 1 ? 's' : ''}`
                    : 'All sources · tap to narrow'}
                </p>
              </div>
              <button
                onClick={() => setShowMindMapPicker(v => !v)}
                className={[
                  'flex items-center gap-reveta-1.5 h-7 px-reveta-2 rounded-component reveta-label border',
                  'transition-all duration-quick',
                  mindMapSourceIds
                    ? 'bg-primary-800 border-primary-500 text-primary-200'
                    : 'surface-float border-border-default text-text-secondary hover:text-text-primary',
                ].join(' ')}
                aria-expanded={showMindMapPicker}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                {showMindMapPicker ? 'Close' : 'Select sources'}
              </button>
            </div>
            {showMindMapPicker && (
              <div className="mt-reveta-3 flex flex-wrap gap-reveta-2">
                {allSources.map(src => {
                  const isSelected = mindMapSourceIds ? mindMapSourceIds.includes(src.id) : true
                  return (
                    <button
                      key={src.id}
                      onClick={() => {
                        setMindMapSourceIds(prev => {
                          const current = prev ?? allSources.map(s => s.id)
                          if (current.includes(src.id)) {
                            const next = current.filter(id => id !== src.id)
                            return next.length === 0 || next.length === allSources.length ? null : next
                          } else {
                            const next = [...current, src.id]
                            return next.length === allSources.length ? null : next
                          }
                        })
                      }}
                      className={[
                        'flex items-center gap-reveta-1.5 px-reveta-2 h-7 rounded-component reveta-label',
                        'border transition-all duration-quick',
                        isSelected
                          ? 'bg-primary-800 border-primary-500 text-primary-200'
                          : 'surface-float border-border-default text-text-secondary opacity-50',
                      ].join(' ')}
                      aria-pressed={isSelected}
                    >
                      <span className="truncate max-w-[160px]">{src.title}</span>
                    </button>
                  )
                })}
                {mindMapSourceIds && (
                  <button
                    onClick={() => setMindMapSourceIds(null)}
                    className="reveta-label text-text-secondary hover:text-text-primary transition-colors duration-quick ml-auto"
                  >
                    Reset to all
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-reveta-3">
          {formats.map(format => (
            <ArtifactCard
              key={format}
              format={format}
              artifact={artifactByFormat[format] || null}
              onGenerate={handleGenerate}
              onDelete={handleDelete}
              onView={setViewingArtifact}
              readySources={readySources}
            />
          ))}
        </div>

        {/* FR-14 note */}
        <p className="reveta-label text-text-secondary text-center border-t border-border-default pt-reveta-3">
          All artefacts are generated strictly from your sources · Never used to train AI models
        </p>
      </div>

      {/* Artifact viewer slide-in */}
      {viewingArtifact && viewingArtifact.status === 'ready' && (
        <ArtifactViewer
          artifact={viewingArtifact}
          onClose={() => setViewingArtifact(null)}
        />
      )}
    </>
  )
}
