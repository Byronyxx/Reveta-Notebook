'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Badge, Skeleton, EmptyState } from '@/components/ui/Primitives'
import { TopNav, AppShell } from '@/components/layout/Navigation'
import AudioStudio from '@/components/AudioStudio'
import ArtifactStudio from '@/components/ArtifactStudio'
import SharingModal from '@/components/SharingModal'
import StyleSettings from '@/components/StyleSettings'
import { StylePreference, DEFAULT_STYLE } from '@/lib/ai/prompts'
import NotebookPreferences from '@/components/NotebookPreferences'

type PanelTab = 'chat' | 'studio' | 'audio'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Source {
  id: string
  title: string
  source_type: string
  status: 'pending' | 'processing' | 'ready' | 'error'
  word_count: number | null
  file_size_bytes: number | null
  created_at: string
  error: string | null
}

interface Chat {
  id: string
  title: string
  created_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { id: string; source_id: string; similarity: number }[]
  created_at?: string
}

interface Notebook {
  id: string
  name: string
  description: string | null
  owner_id: string
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function sourceTypeIcon(type: string) {
  const icons: Record<string, string> = {
    pdf: '📄', docx: '📝', txt: '📃',
    url: '🔗', youtube: '▶️', audio: '🎧'
  }
  return icons[type] || '📎'
}

// ─── SOURCE UPLOAD PANEL ─────────────────────────────────────────────────────

function SourceUpload({ notebookId, onUploaded }: {
  notebookId: string
  onUploaded: (source: Source) => void
}) {
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = async (file?: File) => {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('notebookId', notebookId)
    if (file) formData.append('file', file)
    else if (url.trim()) formData.append('url', url.trim())
    else { setError('Add a URL or choose a file'); setUploading(false); return }

    const res = await fetch('/api/sources', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Upload failed'); setUploading(false); return }

    onUploaded({
      id: data.sourceId,
      title: url.trim() || file?.name || 'Untitled',
      source_type: file?.type?.includes('pdf') ? 'pdf'
        : file?.type?.includes('docx') || file?.name?.endsWith('.docx') ? 'docx'
        : url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube'
        : url ? 'url' : 'txt',
      status: 'pending',
      word_count: null,
      file_size_bytes: file?.size || null,
      created_at: new Date().toISOString(),
      error: null,
    })
    setUrl('')
    setUploading(false)
  }

  return (
    <div className="flex flex-col gap-reveta-2">
      <p className="reveta-label text-text-secondary">Add sources</p>

      {/* URL input */}
      <div className="flex gap-reveta-2">
        <input
          type="url"
          placeholder="Paste URL or YouTube link..."
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={[
            'flex-1 h-9 px-reveta-3 rounded-component text-t-08 text-text-primary',
            'surface-ground border border-border-default',
            'outline-none transition-[border-color,box-shadow] duration-quick',
            'hover:border-neutral-600 focus:surface-signal-glow',
            'placeholder:text-neutral-500',
            error ? 'border-error' : '',
          ].join(' ')}
          aria-label="Source URL"
          aria-invalid={!!error}
        />
        <Button size="sm" variant="primary" onClick={() => submit()} loading={uploading && !fileRef.current?.files?.length}>
          Add
        </Button>
      </div>

      {/* File upload */}
      <div>
        <input
          ref={fileRef}
          type="file"
          id="source-file"
          className="sr-only"
          accept=".pdf,.docx,.txt,.mp3,.wav"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) submit(file)
          }}
          aria-label="Upload file"
        />
        <label
          htmlFor="source-file"
          className={[
            'flex items-center justify-center gap-reveta-2 h-9 px-reveta-3',
            'border border-dashed border-border-default rounded-component',
            'reveta-caption text-text-secondary cursor-pointer',
            'transition-colors duration-quick hover:border-signal-500 hover:text-signal-300',
            uploading ? 'pointer-events-none opacity-50' : '',
          ].join(' ')}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          PDF, DOCX, TXT, MP3
        </label>
      </div>

      {error && <p className="reveta-caption text-error" role="alert">{error}</p>}
    </div>
  )
}

// ─── SOURCE LIST ITEM ─────────────────────────────────────────────────────────

function SourceItem({ source, onDelete }: {
  source: Source
  onDelete: (id: string) => void
}) {
  const [status, setStatus] = useState(source.status)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (source.status !== 'pending' && source.status !== 'processing') return
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`/api/sources/${source.id}/status`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data.status)
        if (data.status === 'ready' || data.status === 'error') {
          if (pollingRef.current) clearInterval(pollingRef.current)
        }
      }
    }, 3000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [source.id, source.status])

  const statusBadge = {
    pending: <Badge variant="info">Processing</Badge>,
    processing: <Badge variant="info">Processing</Badge>,
    ready: <Badge variant="success">Ready</Badge>,
    error: <Badge variant="error">Error</Badge>,
  }[status]

  return (
    <div className="group flex items-start gap-reveta-2 p-reveta-2 rounded-component hover:bg-neutral-850 transition-colors duration-quick">
      <span className="text-base mt-0.5 shrink-0" aria-hidden="true">{sourceTypeIcon(source.source_type)}</span>
      <div className="flex-1 min-w-0">
        <p className="reveta-caption text-text-primary truncate font-medium">{source.title}</p>
        <div className="flex items-center gap-reveta-2 mt-reveta-1">
          {statusBadge}
          {source.word_count && (
            <span className="reveta-label text-text-secondary">{source.word_count.toLocaleString()}w</span>
          )}
          {(status === 'pending' || status === 'processing') && (
            <span className="reveta-ingest-spinner ml-1" aria-label="Processing source" />
          )}
        </div>
        {status === 'error' && source.error && (
          <p className="reveta-label text-error mt-reveta-1 line-clamp-2">{source.error}</p>
        )}
      </div>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-quick p-reveta-1 text-text-secondary hover:text-error rounded"
        onClick={() => onDelete(source.id)}
        aria-label={`Delete source: ${source.title}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── CHAT MESSAGE ────────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  // Parse [Source: UUID] citations
  const formatContent = (text: string) => {
    return text.replace(/\[Source: ([a-f0-9-]{8,})\]/g, (match, id) => {
      return `<cite class="inline-flex items-center gap-1 text-signal-300 text-t-09 font-display font-semibold bg-[rgba(0,200,240,0.08)] border border-[rgba(0,200,240,0.2)] rounded px-1.5 py-0.5 mx-0.5 cursor-default" title="Source chunk: ${id}">[Src]</cite>`
    })
  }

  return (
    <div className={`flex gap-reveta-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} reveta-scroll-reveal`}>
      {/* Avatar */}
      <div className={[
        'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-t-09 font-display font-bold',
        isUser ? 'bg-primary-700 text-primary-200' : 'bg-neutral-800 text-signal-300',
      ].join(' ')} aria-hidden="true">
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={[
        'max-w-[80%] rounded-large px-reveta-4 py-reveta-3',
        isUser ? 'surface-ground rounded-tr-sm' : 'surface-lift rounded-tl-sm',
      ].join(' ')}>
        <div
          className="reveta-body text-text-primary whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
        {!isUser && message.sources && message.sources.length > 0 && (
          <p className="reveta-label text-text-secondary mt-reveta-2 border-t border-border-default pt-reveta-2">
            {message.sources.length} source chunk{message.sources.length !== 1 ? 's' : ''} retrieved
          </p>
        )}
      </div>
    </div>
  )
}

// ─── CHAT INTERFACE ───────────────────────────────────────────────────────────

function ChatInterface({ notebookId, chat, onNewChat, style, allSources = [] }: {
  notebookId: string
  chat: Chat | null
  onNewChat: (chat: Chat) => void
  style?: import('@/lib/ai/prompts').StylePreference
  allSources?: Source[]
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [activeChatId, setActiveChatId] = useState<string | null>(chat?.id || null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // FR-15: Selective source scoping — null = all sources, array = scoped subset
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[] | null>(null)
  const [showSourceScope, setShowSourceScope] = useState(false)

  // Load chat history when chat changes
  useEffect(() => {
    if (!chat) { setMessages([]); setActiveChatId(null); return }
    setActiveChatId(chat.id)
    setLoadingHistory(true)
    fetch(`/api/chats/${chat.id}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.messages) setMessages(data.messages)
      })
      .finally(() => setLoadingHistory(false))
  }, [chat?.id])

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'
    }
  }

  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return

    setInput('')
    setSending(true)
    if (inputRef.current) inputRef.current.style.height = 'auto'

    // Optimistic user message
    const tempId = `temp-${Date.now()}`
    const userMsg: Message = { id: tempId, role: 'user', content }
    setMessages(prev => [...prev, userMsg])

    try {
      // Create chat if we don't have one
      let chatId = activeChatId
      if (!chatId) {
        const chatRes = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notebookId, title: content.slice(0, 60) }),
        })
        const chatData = await chatRes.json()
        chatId = chatData.chat.id
        setActiveChatId(chatId)
        onNewChat(chatData.chat)
      }

      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, style, sourceIds: selectedSourceIds }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')

      setMessages(prev => [
        ...prev,
        { ...data.message, sources: data.sources }
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
        }
      ])
    } finally {
      setSending(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-reveta-5 py-reveta-5 flex flex-col gap-reveta-4"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {loadingHistory && (
          <div className="flex flex-col gap-reveta-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className={`h-16 ${i % 2 ? 'ml-auto w-2/3' : 'w-3/4'}`} />
            ))}
          </div>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center mx-auto mb-reveta-3 relative overflow-hidden">
                <div className="reveta-ambient-orb reveta-ambient-orb--primary absolute inset-0 opacity-40" aria-hidden="true" />
                <svg className="w-6 h-6 text-primary-200 relative z-ground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="reveta-h3 text-text-primary mb-reveta-1">Ask anything</p>
              <p className="reveta-caption text-text-secondary">
                Your questions will be answered strictly from the sources you've added.
              </p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {sending && (
          <div className="flex gap-reveta-3 items-start">
            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-t-09 font-display font-bold text-signal-300 shrink-0">
              AI
            </div>
            <div className="surface-lift rounded-large rounded-tl-sm px-reveta-4 py-reveta-3">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-signal-500 reveta-ambient-orb"
                    style={{ animationDuration: '1.2s', animationDelay: `${i * 0.2}s`, position: 'static' }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border-default px-reveta-4 py-reveta-3">
        {/* FR-15: Source scope selector */}
        {allSources.length > 1 && (
          <div className="mb-reveta-2">
            <button
              onClick={() => setShowSourceScope(v => !v)}
              className={[
                'flex items-center gap-reveta-1.5 reveta-label px-reveta-2 h-6 rounded',
                'transition-colors duration-quick',
                selectedSourceIds
                  ? 'bg-primary-800 text-primary-200 border border-primary-600'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
              aria-expanded={showSourceScope}
              aria-label="Filter sources for this query"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              {selectedSourceIds
                ? `${selectedSourceIds.length} source${selectedSourceIds.length !== 1 ? 's' : ''} scoped`
                : 'All sources'}
            </button>
            {showSourceScope && (
              <div className="mt-reveta-2 surface-ground border border-border-default rounded-component p-reveta-3 flex flex-wrap gap-reveta-2">
                <p className="w-full reveta-label text-text-secondary mb-reveta-1">Scope query to:</p>
                {allSources.map(src => {
                  const isSelected = selectedSourceIds ? selectedSourceIds.includes(src.id) : true
                  return (
                    <button
                      key={src.id}
                      onClick={() => {
                        setSelectedSourceIds(prev => {
                          // Start from full set if no scope yet
                          const current = prev ?? allSources.map(s => s.id)
                          if (current.includes(src.id)) {
                            const next = current.filter(id => id !== src.id)
                            return next.length === allSources.length || next.length === 0 ? null : next
                          } else {
                            const next = [...current, src.id]
                            return next.length === allSources.length ? null : next
                          }
                        })
                      }}
                      className={[
                        'flex items-center gap-reveta-1.5 px-reveta-2 h-6 rounded-component reveta-label',
                        'border transition-all duration-quick',
                        isSelected
                          ? 'bg-primary-800 border-primary-500 text-primary-200'
                          : 'surface-float border-border-default text-text-secondary opacity-50',
                      ].join(' ')}
                      aria-pressed={isSelected}
                    >
                      <span className="text-xs">{sourceTypeIcon(src.source_type)}</span>
                      <span className="max-w-[140px] truncate">{src.title}</span>
                    </button>
                  )
                })}
                {selectedSourceIds && (
                  <button
                    onClick={() => setSelectedSourceIds(null)}
                    className="reveta-label text-text-secondary hover:text-text-primary transition-colors duration-quick ml-auto"
                  >
                    Clear scope
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div className={[
          'flex items-end gap-reveta-2 surface-ground rounded-large border border-border-default',
          'transition-[border-color,box-shadow] duration-quick',
          'focus-within:surface-signal-glow',
        ].join(' ')}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Ask a question about your sources..."
            rows={1}
            className={[
              'flex-1 bg-transparent resize-none outline-none',
              'px-reveta-3 py-reveta-2 text-t-07 text-text-primary',
              'placeholder:text-neutral-500',
              'max-h-40 leading-relaxed',
            ].join(' ')}
            aria-label="Chat message input"
            aria-multiline="true"
            disabled={sending}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={sendMessage}
            loading={sending}
            disabled={!input.trim()}
            className="m-reveta-2 shrink-0"
            aria-label="Send message"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </Button>
        </div>
        <p className="reveta-label text-text-secondary mt-reveta-2 text-center">
          Answers are grounded in your sources only · ↵ to send · Shift+↵ for newline
        </p>
      </div>
    </div>
  )
}

// ─── MAIN NOTEBOOK VIEW ───────────────────────────────────────────────────────

export default function NotebookClient({
  notebook, initialSources, initialChats, userId
}: {
  notebook: Notebook
  initialSources: Source[]
  initialChats: Chat[]
  userId: string
}) {
  const [sources, setSources] = useState(initialSources)
  const [chats, setChats] = useState(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(initialChats[0] || null)
  const [sourcesPanelOpen, setSourcesPanelOpen] = useState(true)
  const [panelTab, setPanelTab] = useState<PanelTab>('chat')
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [showStyleSettings, setShowStyleSettings] = useState(false)
  const [userStyle, setUserStyle] = useState<StylePreference>(DEFAULT_STYLE)

  // Fetch user style preferences on mount (FR-11 + FR-18)
  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.style) setUserStyle(d.style) })
      .catch(() => {}) // non-critical — falls back to DEFAULT_STYLE
  }, [])
  // showPreferences + notebookStyle removed — replaced by showStyleSettings + userStyle (FR-11)
  const readySources = sources.filter(s => s.status === 'ready').length

  const handleSourceUploaded = (s: Source) => setSources(prev => [s, ...prev])
  const handleSourceDelete = async (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id))
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
  }

  const handleNewChat = (chat: Chat) => {
    setChats(prev => [chat, ...prev])
    setActiveChat(chat)
  }

  return (
    <>
      <AppShell>
        <TopNav
          actions={
            <div className="flex items-center gap-reveta-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSharingModal(true)}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>}
              >
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStyleSettings(true)}
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              >
                Style
              </Button>
              <Link href="/dashboard" className="reveta-label text-text-secondary hover:text-text-primary transition-colors duration-quick flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Notebooks
              </Link>
            </div>
          }
        />

        {/* Notebook workspace */}
        <div className="flex h-full" style={{ height: 'calc(100vh - 56px)' }}>

          {/* Sources Panel */}
          <aside
            className={[
              'flex flex-col border-r border-border-default surface-ground',
              'transition-[width] duration-standard ease-reveta-sharp overflow-hidden shrink-0',
              sourcesPanelOpen ? 'w-72' : 'w-0',
            ].join(' ')}
            aria-label="Sources panel"
          >
            <div className="min-w-72 flex flex-col h-full">
              {/* Panel header */}
              <div className="flex items-center justify-between px-reveta-4 py-reveta-3 border-b border-border-default">
                <div>
                  <p className="reveta-label text-text-secondary">Sources</p>
                  <p className="reveta-h3 text-text-primary">{notebook.name}</p>
                </div>
                <Badge variant="brand">{sources.length}</Badge>
              </div>

              {/* Upload */}
              <div className="px-reveta-3 py-reveta-3 border-b border-border-default">
                <SourceUpload notebookId={notebook.id} onUploaded={handleSourceUploaded} />
              </div>

              {/* Source list */}
              <div className="flex-1 overflow-y-auto px-reveta-2 py-reveta-2">
                {sources.length === 0 ? (
                  <EmptyState
                    variant="no-sources"
                    title="No sources yet"
                    description="Add PDFs, URLs, YouTube videos, or text files."
                  />
                ) : (
                  <div className="flex flex-col gap-reveta-1">
                    {sources.map(src => (
                      <SourceItem key={src.id} source={src} onDelete={handleSourceDelete} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main content — tabbed: Chat | Studio | Audio */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Panel switcher bar */}
            <div className="flex items-center gap-reveta-2 px-reveta-4 py-reveta-2 border-b border-border-default overflow-x-auto">
              {/* Toggle sources panel */}
              <button
                onClick={() => setSourcesPanelOpen(o => !o)}
                className="p-1.5 rounded-component text-text-secondary hover:text-text-primary hover:bg-neutral-800 transition-colors duration-quick shrink-0"
                aria-label={sourcesPanelOpen ? 'Collapse sources panel' : 'Expand sources panel'}
                aria-expanded={sourcesPanelOpen}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              </button>

              {/* Panel mode tabs */}
              {(['chat', 'studio', 'audio'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPanelTab(tab)}
                  className={[
                    'shrink-0 px-reveta-3 h-7 rounded-component reveta-label capitalize transition-colors duration-quick',
                    panelTab === tab
                      ? 'bg-primary-800 text-primary-200'
                      : 'text-text-secondary hover:text-text-primary hover:bg-neutral-800',
                  ].join(' ')}
                  aria-current={panelTab === tab ? 'page' : undefined}
                >
                  {tab === 'studio' ? 'Studio' : tab === 'audio' ? 'Audio' : 'Chat'}
                </button>
              ))}

              {/* Chat-specific: chat history tabs + new button */}
              {panelTab === 'chat' && (
                <>
                  <div className="flex items-center gap-reveta-1 overflow-x-auto ml-reveta-2 border-l border-border-default pl-reveta-2">
                    {chats.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setActiveChat(c)}
                        className={[
                          'shrink-0 px-reveta-3 h-7 rounded-component reveta-label transition-colors duration-quick',
                          activeChat?.id === c.id
                            ? 'surface-brand-border bg-neutral-800 text-text-primary'
                            : 'text-text-secondary hover:text-text-primary hover:bg-neutral-800',
                        ].join(' ')}
                        aria-current={activeChat?.id === c.id ? 'page' : undefined}
                      >
                        {c.title.slice(0, 22)}{c.title.length > 22 ? '…' : ''}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveChat(null)}
                    className="shrink-0 ml-auto"
                    icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                  >
                    New
                  </Button>
                  <button
                    onClick={() => setShowStyleSettings(true)}
                    className="shrink-0 p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded"
                    aria-label="Response style settings"
                    title={`Style: ${userStyle.length} · ${userStyle.formality} · ${userStyle.format}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {panelTab === 'chat' && (
                <ChatInterface
                  notebookId={notebook.id}
                  chat={activeChat}
                  onNewChat={handleNewChat}
                  style={userStyle}
                  allSources={sources.filter(s => s.status === 'ready')}
                />
              )}
              {panelTab === 'studio' && (
                <div className="h-full overflow-y-auto">
                  <ArtifactStudio
                    notebookId={notebook.id}
                    readySources={readySources}
                    allSources={sources.filter(s => s.status === 'ready')}
                  />
                </div>
              )}
              {panelTab === 'audio' && (
                <div className="h-full overflow-y-auto">
                  <AudioStudio
                    notebookId={notebook.id}
                    readySources={readySources}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  )
}
