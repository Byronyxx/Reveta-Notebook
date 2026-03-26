'use client'
import { ReactNode, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export { EmptyState, ToastContainer, useToast, Dialog, LoadingOverlay, ErrorBoundary } from './Feedback'
export { HoverCard3D, GlitchText, AmbientParticles, IntersectionReveal, PulseRing, CursorMagnetic } from './Immersive'

export function Card({ children, surface = 'ground', hover3d = false, className = '', onClick }: { children: ReactNode; surface?: 'ground' | 'lift' | 'float'; hover3d?: boolean; className?: string; onClick?: () => void }) {
  const surfaceClass = { ground: 'surface-ground', lift: 'surface-lift', float: 'surface-float' }[surface]
  return <div className={[surfaceClass, 'rounded-card p-reveta-4', hover3d ? 'reveta-3d-parent cursor-pointer transition-transform duration-quick ease-reveta-reveal hover:-translate-y-1' : '', onClick ? 'cursor-pointer' : '', className].join(' ')} onClick={onClick} data-3d-hover={hover3d || undefined}>{children}</div>
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; helper?: string; error?: string; icon?: ReactNode }>(({ label, helper, error, icon, className = '', id, ...props }, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 7)}`
  return (
    <div className="flex flex-col gap-reveta-1">
      {label && <label htmlFor={inputId} className="reveta-label text-text-secondary">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-reveta-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">{icon}</span>}
        <input ref={ref} id={inputId} aria-invalid={!!error} className={['w-full surface-ground rounded-component text-t-07 text-text-primary h-10 px-reveta-3', icon ? 'pl-10' : '', 'border border-border-default outline-none transition-[border-color,box-shadow] duration-quick ease-reveta-sharp hover:border-neutral-600 focus:surface-signal-glow placeholder:text-neutral-500', error ? 'border-error' : '', className].join(' ')} {...props} />
      </div>
      {error && <p className="reveta-caption text-error" role="alert">{error}</p>}
      {helper && !error && <p className="reveta-caption text-text-secondary">{helper}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }>(({ label, error, className = '', id, ...props }, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).slice(2, 7)}`
  return (
    <div className="flex flex-col gap-reveta-1">
      {label && <label htmlFor={inputId} className="reveta-label text-text-secondary">{label}</label>}
      <textarea ref={ref} id={inputId} aria-invalid={!!error} className={['w-full surface-ground rounded-component text-t-07 text-text-primary px-reveta-3 py-reveta-2 min-h-[120px] resize-y border border-border-default outline-none transition-[border-color,box-shadow] duration-quick ease-reveta-sharp hover:border-neutral-600 focus:surface-signal-glow placeholder:text-neutral-500', error ? 'border-error' : '', className].join(' ')} {...props} />
      {error && <p className="reveta-caption text-error" role="alert">{error}</p>}
    </div>
  )
})
TextArea.displayName = 'TextArea'

export function Badge({ children, variant = 'default', size = 'sm' }: { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'; size?: 'sm' | 'md' }) {
  const styles = { default: 'bg-neutral-800 text-neutral-300 border-neutral-700', success: 'bg-[rgba(0,200,122,0.12)] text-success border-[rgba(0,200,122,0.25)]', warning: 'bg-[rgba(255,179,0,0.12)] text-warning border-[rgba(255,179,0,0.25)]', error: 'bg-[rgba(255,59,48,0.12)] text-error border-[rgba(255,59,48,0.25)]', info: 'bg-[rgba(0,200,240,0.12)] text-signal-300 border-[rgba(0,200,240,0.25)]', brand: 'bg-[rgba(45,45,150,0.2)] text-primary-200 border-[rgba(74,74,171,0.3)]' }
  return <span className={['inline-flex items-center gap-1 border rounded-full font-display font-semibold', size === 'sm' ? 'text-t-09 px-reveta-2 h-5' : 'text-t-08 px-reveta-3 h-6', styles[variant]].join(' ')}>{children}</span>
}

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-8 h-8 border-[3px]' }
  return <span role="status" aria-label="Loading" className={[sizes[size], 'border-neutral-700 border-t-signal-500 rounded-full animate-spin', className].join(' ')} style={{ animationDuration: '0.8s', animationTimingFunction: 'linear' }} />
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div role="status" aria-busy="true" aria-label="Loading" className={`reveta-shimmer rounded-component ${className}`} />
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-border-default" />
  return <div className="flex items-center gap-reveta-3"><hr className="flex-1 border-border-default" /><span className="reveta-label text-text-secondary">{label}</span><hr className="flex-1 border-border-default" /></div>
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-reveta-8 gap-reveta-3">
      {icon && <div className="w-12 h-12 rounded-large bg-neutral-800 flex items-center justify-center text-text-secondary">{icon}</div>}
      <div><p className="reveta-h3 text-text-primary">{title}</p>{description && <p className="reveta-body text-text-secondary mt-reveta-1">{description}</p>}</div>
      {action && <div className="mt-reveta-2">{action}</div>}
    </div>
  )
}
