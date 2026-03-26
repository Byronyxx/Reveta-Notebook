'use client'
import { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { Badge, Spinner } from '@/components/ui/Primitives'

interface Share { id: string; invitee_email: string; invitee_id: string | null; access_level: 'view' | 'edit'; accepted_at: string | null; created_at: string }

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (hours < 1) return `${minutes}m ago`
  if (days < 1) return `${hours}h ago`
  return `${days}d ago`
}

export default function SharingModal({ notebookId, onClose }: { notebookId: string; onClose: () => void }) {
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit'>('view')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ link: string; email: string } | null>(null)
  const [error, setError] = useState('')
  const [revoking, setRevoking] = useState<string | null>(null)

  const fetchShares = useCallback(async () => {
    const res = await fetch(`/api/notebooks/${notebookId}/shares`)
    if (!res.ok) return
    const data = await res.json()
    setShares(data.shares || [])
  }, [notebookId])

  useEffect(() => { fetchShares().finally(() => setLoading(false)) }, [fetchShares])

  const handleInvite = async () => {
    setError('')
    setInviteResult(null)
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address.'); return }
    setInviting(true)
    const res = await fetch(`/api/notebooks/${notebookId}/shares`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), accessLevel }) })
    const data = await res.json()
    setInviting(false)
    if (!res.ok) { setError(data.error || 'Failed to invite collaborator.'); return }
    setInviteResult({ link: data.inviteLink, email: data.inviteeEmail })
    setEmail('')
    fetchShares()
  }

  const handleRevoke = async (shareId: string) => {
    setRevoking(shareId)
    const res = await fetch(`/api/notebooks/${notebookId}/shares`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId }) })
    setRevoking(null)
    if (res.ok) setShares(prev => prev.filter(s => s.id !== shareId))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-reveta-4">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative surface-float rounded-large w-full max-w-lg shadow-2xl border border-border-default flex flex-col max-h-[90vh]" role="dialog" aria-modal="true" aria-labelledby="sharing-modal-title">
        <div className="flex items-center justify-between px-reveta-5 py-reveta-4 border-b border-border-default shrink-0">
          <h2 id="sharing-modal-title" className="reveta-h3 text-text-primary">Share Notebook</h2>
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded" aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-reveta-5 py-reveta-4 flex flex-col gap-reveta-5">
          <div className="flex flex-col gap-reveta-3">
            <h3 className="reveta-h4 text-text-primary">Invite collaborator</h3>
            <div className="flex gap-reveta-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInvite()} placeholder="colleague@example.com" className={['w-full h-10 px-reveta-3 surface-ground border rounded-component reveta-caption text-text-primary placeholder:text-text-secondary outline-none transition-[border-color] duration-quick', error ? 'border-error' : 'border-border-default hover:border-neutral-600 focus:surface-signal-glow'].join(' ')} aria-invalid={!!error} />
              <select value={accessLevel} onChange={e => setAccessLevel(e.target.value as 'view' | 'edit')} className="h-10 px-reveta-2 surface-ground border border-border-default rounded-component reveta-caption text-text-primary shrink-0 outline-none" aria-label="Access level">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
            </div>
            {error && <p className="reveta-label text-error" role="alert">{error}</p>}
            <Button variant="primary" size="sm" onClick={handleInvite} loading={inviting} disabled={!email.trim()}>Send invite</Button>
            {inviteResult && (
              <div className="surface-ground rounded-component p-reveta-3 border border-signal-600/30 flex flex-col gap-reveta-2">
                <p className="reveta-caption text-text-primary">Invite created for <strong>{inviteResult.email}</strong></p>
                <div className="flex items-center gap-reveta-2">
                  <code className="flex-1 reveta-label font-mono text-text-secondary truncate bg-neutral-800 px-2 py-1 rounded">{inviteResult.link}</code>
                  <button onClick={() => navigator.clipboard.writeText(inviteResult.link)} className="shrink-0 p-1.5 text-text-secondary hover:text-text-primary" aria-label="Copy link">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-reveta-3">
            <h3 className="reveta-h4 text-text-primary">Active shares {shares.length > 0 && <span className="reveta-label text-text-secondary ml-2">({shares.length})</span>}</h3>
            {loading ? <div className="flex justify-center py-reveta-4"><Spinner size="sm" /></div> : shares.length === 0 ? <p className="reveta-caption text-text-secondary py-reveta-3 text-center">No active shares yet.</p> : (
              <div className="flex flex-col gap-reveta-2">
                {shares.map(share => (
                  <div key={share.id} className="flex items-center justify-between gap-reveta-3 surface-ground rounded-component p-reveta-3 border border-border-default">
                    <div className="flex items-center gap-reveta-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center shrink-0"><span className="reveta-label text-primary-200 font-medium uppercase">{share.invitee_email[0]}</span></div>
                      <div className="min-w-0">
                        <p className="reveta-caption text-text-primary truncate">{share.invitee_email}</p>
                        <div className="flex items-center gap-reveta-2 mt-0.5">
                          <Badge variant={share.access_level === 'edit' ? 'info' : 'default'}>{share.access_level === 'edit' ? 'Can edit' : 'Can view'}</Badge>
                          <span className="reveta-label text-text-secondary">&middot;</span>
                          <span className="reveta-label text-text-secondary">{share.accepted_at ? `Accepted ${relativeTime(share.accepted_at)}` : `Invited ${relativeTime(share.created_at)}`}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRevoke(share.id)} disabled={revoking === share.id} className="shrink-0 p-1.5 text-text-secondary hover:text-error transition-colors duration-quick rounded disabled:opacity-50" aria-label={`Revoke ${share.invitee_email}`}>
                      {revoking === share.id ? <Spinner size="sm" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-reveta-5 py-reveta-3 border-t border-border-default shrink-0">
          <p className="reveta-label text-text-secondary">Viewers can read &middot; Editors can add sources &middot; Revocation is immediate</p>
        </div>
      </div>
    </div>
  )
}
