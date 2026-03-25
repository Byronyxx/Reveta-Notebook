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
import NotebookPreferences from '@/components/NotebookPreferences'
import { DEFAULT_STYLE, StylePreference } from '@/lib/ai/prompts'

type PanelTab = 'chat' | 'studio' | 'audio'

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

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1048576).toFixed(1)}MB`
}

function sourceTypeIcon(type: string) {
  const icons: Record<string, string> = { pdf: '📄', docx: '📝', txt: '📃', url: '🔗', youtube: '▶️', audio: '🎧' }
  return icons[type] || '📎'
}

function SourceUpload({ notebookId, onUploaded }: { notebookId: string; onUploaded: (source: Source) => void }) {
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
      <div className="flex gap-reveta-2">
        <input
          type="text"
          placeholder="Paste URL or YouTube link…"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="flex-1 h-9 px-reveta-2 rounded-component bg-neutral-800 border border-border-default text-text-primary reveta-caption placeholder:text-text-secondary focus:outline-none focus:border-accent-signal-500 transition-colors"
        />
        <Button variant="secondary" size="sm" onClick={() => submit()} loading={uploading}>Add</Button>
      </div>
      <div className="flex items-center gap-reveta-2">
        <div className="flex-1 h-px bg-border-default" />
        <span className="reveta-label text-text-secondary">or</span>
        <div className="flex-1 h-px bg-border-default" />
      </div>
      <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
        Upload file (PDF, DOCX, TXT, MP3)
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.txt,.mp3,.wav"
        className="hidden"
        onChange={e => e.target.files?.[0] && submit(e.target.files[0])}
      />
      {error && <p className="reveta-caption text-error">{error}</p>}
    </div>
  )
}

function SourceItem({ source, onDelete, selected, onToggle }: {
  source: Source
  onDelete: (id: string) => void
  selected: boolean
  onToggle: (id: string) => void
}) {
  const statusColor = source.status === 'ready' ? 'text-success'
    : source.status === 'error' ? 'text-error'
    : 'text-warning'

  return (
    <div className={`group flex items-start gap-reveta-2 p-reveta-2 rounded-component border transition-colors duration-quick cursor-pointer ${selected ? 'border-primary-500 bg-primary-950/30' : 'border-transparent hover:border-border-default'}`} onClick={() => onToggle(source.id)}>
      <input type="checkbox" checked={selected} onChange={() => onToggle(source.id)} onClick={e => e.stopPropagation()} className="mt-0.5 accent-primary-500 cursor-pointer" />
      <span className="text-base leading-none mt-0.5">{sourceTypeIcon(source.source_type)}</span>
      <div className="flex-1 min-w-0">
        <p className="reveta-caption text-text-primary truncate">{source.title}</p>
        <div className="flex items-center gap-reveta-2 mt-reveta-1">
          <span className={`reveta-label ${statusColor}`}>{source.status}</span>
          {source.word_count && <span className="reveta-label text-text-secondary">{source.word_count.toLocaleString()}w</span>}
          {source.file_size_bytes && <span className="reveta-label text-text-secondary">{formatBytes(source.file_size_bytes)}</span>}
        </div>
        {source.error && <p className="reveta-label text-error mt-reveta-1 truncate">{source.error}</p>}
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(source.id) }} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-text-secondary hover:text-error" aria-label="Delete source">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-reveta-2`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-primary-200" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
        </div>
      )}
      <div className={`max-w-[80%] rounded-large px-reveta-3 py-reveta-2 ${isUser ? 'bg-primary-600 text-white' : 'surface-ground text-text-primary'}`}>
        <p className="reveta-body whitespace-pre-wrap">{message.content}</p>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-reveta-2 pt-reveta-2 border-t border-border-default flex flex-wrap gap-reveta-1">
            {message.sources.map((s, i) => (
              <span key={i} className="reveta-label text-text-secondary bg-neutral-800 rounded px-reveta-1 py-0.5">
                src {i + 1} · {Math.round(s.similarity * 100)}%
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NotebookClient({ notebook, userId, userEmail }: { notebook: Notebook; userId: string; userEmail: string }) {
  const [sources, setSources] = useState<Source[]>([])
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<PanelTab>('chat')
  const [showSharing, setShowSharing] = useState(false)
  const [style, setStyle] = useState<StylePreference>(DEFAULT_STYLE)
  const [showStyleSettings, setShowStyleSettings] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    fetch(`/api/sources?notebookId=${notebook.id}`).then(r => r.json()).then(d => setSources(d.sources || []))
    fetch(`/api/user/profile`).then(r => r.json()).then(d => { if (d.style_preference) setStyle(d.style_preference) })
  }, [notebook.id])

  useEffect(() => {
    const pending = sources.filter(s => s.status === 'pending' || s.status === 'processing')
    if (!pending.length) return
    const interval = setInterval(async () => {
      const updates = await Promise.all(pending.map(s => fetch(`/api/sources/${s.id}/status`).then(r => r.json())))
      setSources(prev => prev.map(s => {
        const u = updates.find((_, i) => pending[i].id === s.id)
        return u ? { ...s, ...u } : s
      }))
    }, 4000)
    return () => clearInterval(interval)
  }, [sources])

  const handleSourceUploaded = (source: Source) => setSources(prev => [source, ...prev])

  const handleDeleteSource = async (id: string) => {
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
    setSources(prev => prev.filter(s => s.id !== id))
    setSelectedSourceIds(prev => prev.filter(sid => sid !== id))
  }

  const toggleSourceSelection = (id: string) => {
    setSelectedSourceIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id])
  }

  const startNewChat = useCallback(async () => {
    const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notebookId: notebook.id, title: 'New Query' }) })
    const data = await res.json()
    setChats(prev => [data.chat, ...prev])
    setActiveChatId(data.chat.id)
    setMessages([])
  }, [notebook.id])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    let chatId = activeChatId
    if (!chatId) {
      const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notebookId: notebook.id, title: input.slice(0, 50) }) })
      const data = await res.json()
      chatId = data.chat.id
      setChats(prev => [data.chat, ...prev])
      setActiveChatId(chatId)
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input, style, sourceIds: selectedSourceIds.length > 0 ? selectedSourceIds : undefined }),
    })
    const data = await res.json()
    setSending(false)
    if (data.message) setMessages(prev => [...prev, { ...data.message, sources: data.sources }])
  }

  const isOwner = notebook.owner_id === userId

  return (
    <>
      <AppShell>
        <TopNav
          title={notebook.name}
          actions={
            <div className="flex items-center gap-reveta-2">
              {isOwner && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreferences(true)}>Preferences</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSharing(true)}>Share</Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowStyleSettings(p => !p)}>Style</Button>
            </div>
          }
        />

        <div className="flex h-[calc(100vh-56px)] overflow-hidden">
          {/* Left: Sources panel */}
          <div className="w-72 flex-shrink-0 border-r border-border-default flex flex-col surface-ground overflow-hidden">
            <div className="p-reveta-3 border-b border-border-default">
              <p className="reveta-label text-text-secondary mb-reveta-3">SOURCES</p>
              <SourceUpload notebookId={notebook.id} onUploaded={handleSourceUploaded} />
            </div>
            <div className="flex-1 overflow-y-auto p-reveta-2 flex flex-col gap-reveta-1">
              {sources.length === 0 ? (
                <p className="reveta-caption text-text-secondary text-center mt-reveta-4">No sources yet. Add a URL or upload a file above.</p>
              ) : (
                sources.map(s => (
                  <SourceItem key={s.id} source={s} onDelete={handleDeleteSource} selected={selectedSourceIds.includes(s.id)} onToggle={toggleSourceSelection} />
                ))
              )}
            </div>
            {selectedSourceIds.length > 0 && (
              <div className="p-reveta-2 border-t border-border-default">
                <p className="reveta-label text-text-secondary">{selectedSourceIds.length} source{selectedSourceIds.length !== 1 ? 's' : ''} selected for scoping</p>
                <button onClick={() => setSelectedSourceIds([])} className="reveta-label text-primary-400 hover:text-primary-300 transition-colors mt-reveta-1">Clear selection</button>
              </div>
            )}
          </div>

          {/* Right: Tab panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border-default surface-ground px-reveta-3">
              {(['chat', 'studio', 'audio'] as PanelTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-reveta-3 py-reveta-2 reveta-label capitalize border-b-2 transition-colors duration-quick ${activeTab === tab ? 'border-primary-500 text-text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                >
                  {tab === 'studio' ? 'Artifacts' : tab === 'audio' ? 'Audio' : 'Chat'}
                </button>
              ))}
            </div>

            {/* Chat panel */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-reveta-4 flex flex-col gap-reveta-3">
                  {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-sm">
                        <div className="w-12 h-12 rounded-large bg-primary-800 flex items-center justify-center mx-auto mb-reveta-3">
                          <svg className="w-6 h-6 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                        </div>
                        <h2 className="reveta-h3 text-text-primary mb-reveta-2">Ask about your sources</h2>
                        <p className="reveta-body text-text-secondary">Upload sources on the left, then ask questions. Reveta will ground answers in your content.</p>
                      </div>
                    </div>
                  )}
                  {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                  {sending && (
                    <div className="flex justify-start gap-reveta-2">
                      <div className="w-7 h-7 rounded-full bg-primary-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="reveta-ingest-spinner" />
                      </div>
                      <div className="surface-ground rounded-large px-reveta-3 py-reveta-2">
                        <div className="flex gap-reveta-1 items-center h-5">
                          <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-reveta-3 border-t border-border-default surface-ground">
                  {showStyleSettings && (
                    <div className="mb-reveta-3">
                      <StyleSettings value={style} onChange={setStyle} />
                    </div>
                  )}
                  <div className="flex gap-reveta-2 items-end">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder={sources.length === 0 ? 'Add sources first, then ask a question…' : 'Ask a question about your sources…'}
                      disabled={sending}
                      rows={1}
                      className="flex-1 resize-none rounded-component bg-neutral-800 border border-border-default text-text-primary reveta-body px-reveta-3 py-reveta-2 placeholder:text-text-secondary focus:outline-none focus:border-accent-signal-500 transition-colors min-h-[40px] max-h-32"
                      style={{ height: 'auto' }}
                      onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 128) + 'px' }}
                    />
                    <Button variant="primary" size="sm" onClick={handleSend} loading={sending} disabled={!input.trim()}>Send</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'studio' && (
              <div className="flex-1 overflow-y-auto p-reveta-4">
                <ArtifactStudio notebookId={notebook.id} sources={sources} />
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="flex-1 overflow-y-auto p-reveta-4">
                <AudioStudio notebookId={notebook.id} />
              </div>
            )}
          </div>
        </div>
      </AppShell>

      {showSharing && <SharingModal notebookId={notebook.id} onClose={() => setShowSharing(false)} />}
      {showPreferences && <NotebookPreferences notebookId={notebook.id} onClose={() => setShowPreferences(false)} />}
    </>
  )
}
