'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopNav, AppShell } from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import { Card, Input, EmptyState, Badge, Skeleton } from '@/components/ui/Primitives'

interface Notebook {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

interface DashboardClientProps {
  notebooks: Notebook[]
  userEmail: string
  displayName: string | null
}

// ─── AMBIENT CANVAS BACKGROUND ───────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-base" aria-hidden="true">
      <div
        className="reveta-ambient-orb reveta-ambient-orb--primary absolute"
        style={{ width: '600px', height: '600px', top: '-200px', left: '-100px', opacity: 0.12 }}
      />
      <div
        className="reveta-ambient-orb reveta-ambient-orb--void absolute"
        style={{ width: '400px', height: '400px', bottom: '0px', right: '-100px', opacity: 0.09 }}
      />
      <div
        className="reveta-ambient-orb reveta-ambient-orb--signal absolute"
        style={{ width: '300px', height: '300px', top: '40%', right: '20%', opacity: 0.06 }}
      />
    </div>
  )
}

// ─── CREATE NOTEBOOK MODAL ─────────────────────────────────────────────────

function CreateNotebookModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (name: string, description: string) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Notebook name is required'); return }
    setLoading(true)
    try {
      await onCreate(name.trim(), description.trim())
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create notebook')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-reveta-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-notebook-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-md surface-peak rounded-large p-reveta-5 shadow-[var(--reveta-shadow-peak)]"
        style={{
          animation: 'reveta-modal-enter 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        <h2 id="create-notebook-title" className="reveta-h2 text-text-primary mb-reveta-4">
          New Notebook
        </h2>

        <div className="flex flex-col gap-reveta-3">
          <Input
            label="Notebook name"
            placeholder="e.g. Research Q3, Case Study 1..."
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            error={error}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <Input
            label="Description (optional)"
            placeholder="What will this notebook cover?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-reveta-2 mt-reveta-5 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Create Notebook
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── NOTEBOOK CARD ─────────────────────────────────────────────────────────

function NotebookCard({ notebook }: { notebook: Notebook }) {
  const router = useRouter()
  const updatedAt = new Date(notebook.updated_at)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - updatedAt.getTime()) / 86400000)
  const timeLabel = diffDays === 0 ? 'Today'
    : diffDays === 1 ? 'Yesterday'
    : diffDays < 7 ? `${diffDays}d ago`
    : updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      className={[
        'group relative surface-ground rounded-large p-reveta-4',
        'border border-border-default',
        'transition-all duration-quick ease-reveta-reveal',
        'hover:-translate-y-1 hover:surface-brand-border',
        'cursor-pointer reveta-scroll-reveal',
      ].join(' ')}
      onClick={() => router.push(`/notebook/${notebook.id}`)}
      role="article"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && router.push(`/notebook/${notebook.id}`)}
      aria-label={`Open notebook: ${notebook.name}`}
    >
      <div className="w-10 h-10 rounded-component bg-primary-800 flex items-center justify-center mb-reveta-3 relative overflow-hidden">
        <div className="reveta-ambient-orb reveta-ambient-orb--primary absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-standard" aria-hidden="true" />
        <svg className="w-5 h-5 text-primary-200 relative z-ground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      </div>

      <h3 className="reveta-h3 text-text-primary mb-reveta-1 line-clamp-1 group-hover:text-primary-200 transition-colors duration-quick">
        {notebook.name}
      </h3>

      {notebook.description && (
        <p className="reveta-caption text-text-secondary line-clamp-2 mb-reveta-3">
          {notebook.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-reveta-2 border-t border-border-default">
        <span className="reveta-label text-text-secondary">{timeLabel}</span>
        <svg
          className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-quick"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

export default function DashboardClient({ notebooks, userEmail, displayName }: DashboardClientProps) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [notebookList, setNotebookList] = useState(notebooks)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.reveta-scroll-reveal')
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('is-visible'), 100 + i * 60)
    })
  }, [notebookList])

  const handleCreate = async (name: string, description: string) => {
    setCreating(true)
    const res = await fetch('/api/notebooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to create notebook')
    }
    const { notebook } = await res.json()
    setNotebookList(prev => [notebook, ...prev])
    setCreating(false)
    router.push(`/notebook/${notebook.id}`)
  }

  const greeting = displayName ? `Welcome back, ${displayName.split(' ')[0]}` : 'Your notebooks'

  return (
    <>
      <AmbientBackground />
      <AppShell>
        <TopNav
          actions={
            <div className="flex items-center gap-reveta-3">
              <span className="reveta-label text-text-secondary hidden sm:block">{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={async () => { await fetch('/auth/logout', { method: 'POST' }); router.push('/login') }}>
                Sign out
              </Button>
            </div>
          }
        />
        <div className="px-reveta-5 py-reveta-7 max-w-6xl mx-auto w-full">
          <div className="flex items-end justify-between mb-reveta-6 gap-reveta-4 flex-wrap">
            <div>
              <p className="reveta-label text-text-secondary mb-reveta-1">Dashboard</p>
              <h1 className="reveta-h1 text-text-primary">{greeting}</h1>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowCreate(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
              New Notebook
            </Button>
          </div>
          {notebookList.length === 0 ? (
            <EmptyState icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>} title="No notebooks yet" description="Create your first notebook to start uploading sources and chatting with your content." action={<Button variant="primary" onClick={() => setShowCreate(true)}>Create first notebook</Button>} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-reveta-3">
              {notebookList.map(nb => <NotebookCard key={nb.id} notebook={nb} />)}
            </div>
          )}
        </div>
      </AppShell>
      {showCreate && <CreateNotebookModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      <style>{`@keyframes reveta-modal-enter { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0px); } }`}</style>
    </>
  )
}
