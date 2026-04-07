'use client'
/**
 * DS-COMP-FEEDBACK — 5 Feedback + Overlay Components
 *
 * Components:
 *   1. Toast         — transient status notifications (success/error/info/warning)
 *   2. Dialog        — modal confirmation + content overlay
 *   3. LoadingOverlay — full-surface loading state
 *   4. ErrorBoundary  — graceful error capture + recovery surface
 *   5. EmptyState     — zero-content states with call-to-action
 *
 * All tokens resolve to CSS custom properties (--reveta-*). Zero hardcoded values.
 * prefers-reduced-motion: all entrance animations suppressed.
 * ARIA: role=alert (Toast), role=dialog (Dialog), aria-busy (LoadingOverlay)
 */

import React, { useState, useEffect, useCallback, useRef, Component, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOAST
// ─────────────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number // ms — default 4000, 0 = persistent
}

const TOAST_ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: 'bg-semantic-success text-neutral-50 border-green-600',
  error:   'bg-semantic-error text-neutral-50 border-red-700',
  info:    'surface-float text-text-primary border-border-default',
  warning: 'bg-semantic-warning text-neutral-900 border-yellow-600',
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Mount → animate in
    const showTimer = requestAnimationFrame(() => setVisible(true))
    // Auto-dismiss
    if ((item.duration ?? 4000) > 0) {
      const hideTimer = setTimeout(() => {
        setVisible(false)
        setTimeout(() => onDismiss(item.id), 300)
      }, item.duration ?? 4000)
      return () => { cancelAnimationFrame(showTimer); clearTimeout(hideTimer) }
    }
    return () => cancelAnimationFrame(showTimer)
  }, [item.id, item.duration, onDismiss])

  const variant = item.variant ?? 'info'

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        'flex items-center gap-reveta-3 px-reveta-4 py-reveta-3 rounded-component',
        'border shadow-xl text-sm font-medium',
        'transition-all duration-moderate pointer-events-auto',
        TOAST_STYLES[variant],
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2',
        '@media (prefers-reduced-motion: reduce) { transition: none }',
      ].join(' ')}
    >
      {TOAST_ICONS[variant]}
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(item.id), 300) }}
        className="opacity-60 hover:opacity-100 transition-opacity duration-quick ml-reveta-2"
        aria-label="Dismiss notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (typeof window === 'undefined') return null
  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed bottom-reveta-5 right-reveta-5 z-toast flex flex-col gap-reveta-2 w-80 pointer-events-none"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

// Hook for easy toast management
let toastListeners: Array<(toast: ToastItem) => void> = []

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts(prev => [...prev, { id, message, variant, duration }])
  }, [])

  return { toasts, toast, dismiss }
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. DIALOG (Modal)
// ─────────────────────────────────────────────────────────────────────────────

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  /** Confirmation shorthand: renders confirm + cancel buttons */
  onConfirm?: () => void
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
  cancelLabel?: string
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const DIALOG_SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Dialog({
  open, onClose, title, description, children,
  onConfirm, confirmLabel = 'Confirm', confirmVariant = 'primary',
  cancelLabel = 'Cancel', loading, size = 'md',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prevFocus?.focus()
    }
  }, [open, onClose])

  if (!open || typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-dialog flex items-center justify-center p-reveta-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-desc' : undefined}
        tabIndex={-1}
        className={[
          'relative w-full surface-float rounded-large border border-border-default',
          'shadow-2xl p-reveta-5 flex flex-col gap-reveta-4',
          'outline-none',
          'animate-[dialog-in_200ms_var(--reveta-ease-enter)_both]',
          DIALOG_SIZES[size],
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-reveta-3">
          <div>
            <h2 id="dialog-title" className="reveta-h2 text-text-primary">{title}</h2>
            {description && (
              <p id="dialog-desc" className="reveta-caption text-text-secondary mt-reveta-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 shrink-0 text-text-secondary hover:text-text-primary transition-colors duration-quick rounded"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content slot */}
        {children && <div>{children}</div>}

        {/* Confirmation actions */}
        {onConfirm && (
          <div className="flex items-center justify-end gap-reveta-3 pt-reveta-2 border-t border-border-default">
            <Button variant="ghost" size="sm" onClick={onClose}>{cancelLabel}</Button>
            <Button
              variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
              size="sm"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dialog-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes dialog-in { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </div>,
    document.body
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. LOADING OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

export interface LoadingOverlayProps {
  visible: boolean
  label?: string
  /** 'full' = fixed full viewport | 'local' = absolute fill parent */
  mode?: 'full' | 'local'
}

export function LoadingOverlay({ visible, label = 'Loading…', mode = 'full' }: LoadingOverlayProps) {
  if (!visible) return null

  const base = mode === 'full'
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-10 rounded-[inherit]'

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={[
        base,
        'flex flex-col items-center justify-center gap-reveta-3',
        'bg-neutral-950/70 backdrop-blur-sm',
      ].join(' ')}
    >
      {/* Animated ring */}
      <svg
        className="w-10 h-10 animate-spin text-primary-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-80" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="reveta-label text-text-secondary">{label}</span>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. ERROR BOUNDARY (Class component — required by React for error boundaries)
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}
interface ErrorBoundaryState { error: Error | null }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[Reveta] ErrorBoundary caught:', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return (
        <DefaultErrorFallback error={this.state.error} reset={this.reset} />
      )
    }
    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-reveta-4 p-reveta-8 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-semantic-error/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-semantic-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h3 className="reveta-h3 text-text-primary mb-reveta-1">Something went wrong</h3>
        <p className="reveta-caption text-text-secondary max-w-xs">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>Try again</Button>
    </div>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

export type EmptyStateVariant =
  | 'no-sources'
  | 'no-chats'
  | 'no-artifacts'
  | 'no-audio'
  | 'no-results'
  | 'generic'

const EMPTY_ICONS: Record<EmptyStateVariant, ReactNode> = {
  'no-sources': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'no-chats': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  'no-artifacts': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  ),
  'no-audio': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  'no-results': (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  generic: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
}

const EMPTY_DEFAULTS: Record<EmptyStateVariant, { title: string; description: string }> = {
  'no-sources':   { title: 'No sources yet',        description: 'Upload PDFs, paste URLs, or add YouTube links to get started.' },
  'no-chats':     { title: 'No conversations yet',  description: 'Ask a question to start a new conversation grounded in your sources.' },
  'no-artifacts': { title: 'No artefacts yet',      description: 'Generate a Study Guide, FAQ, Timeline, or more from your sources.' },
  'no-audio':     { title: 'No audio overviews',    description: 'Generate an audio overview to listen to your sources on the go.' },
  'no-results':   { title: 'No results found',      description: 'Try a different search term or check your spelling.' },
  generic:        { title: 'Nothing here yet',      description: 'Content will appear here once it\'s available.' },
}

export interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const defaults = EMPTY_DEFAULTS[variant]

  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-reveta-3 py-reveta-10 px-reveta-6 text-center',
        className,
      ].join(' ')}
      aria-label={title ?? defaults.title}
    >
      <div className="w-14 h-14 rounded-full surface-ground border border-border-default flex items-center justify-center text-text-secondary">
        {EMPTY_ICONS[variant]}
      </div>
      <div>
        <h3 className="reveta-h3 text-text-primary">{title ?? defaults.title}</h3>
        <p className="reveta-caption text-text-secondary mt-reveta-1 max-w-xs">
          {description ?? defaults.description}
        </p>
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
