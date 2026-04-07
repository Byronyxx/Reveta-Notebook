'use client'
/**
 * NFR-COMFORT — Comfort Mode Toggle
 * Design System §6 · Accessibility · First-class surface
 *
 * Comfort Mode disables ALL motion:
 *   - Tier-1 ambient animations (reveta-ambient class)
 *   - Tier-4 parallax transforms
 *   - 3D hover effects
 *   - Chromatic mood pulse animations
 *
 * Preserves functional Tier-2 and Tier-3 transitions (with instant duration).
 *
 * Implementation:
 *   - Sets data-comfort-mode="true" on <html>
 *   - Persists to localStorage under key 'reveta-motion'
 *   - Screen-reader announces state change via aria-live
 *   - Keyboard accessible (no mouse required)
 *   - Initialised in layout.tsx inline script (zero FOUC)
 */

import { useState, useEffect, useCallback, useId } from 'react'

const STORAGE_KEY = 'reveta-motion'
const COMFORT_VALUE = 'comfort'
const NORMAL_VALUE = 'normal'

function getInitialComfortMode(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === COMFORT_VALUE) return true
  // Also respect system prefers-reduced-motion as the initial default
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useComfortMode(): {
  comfortMode: boolean
  toggle: () => void
  setComfortMode: (enabled: boolean) => void
} {
  const [comfortMode, setComfortModeState] = useState(false)

  useEffect(() => {
    setComfortModeState(getInitialComfortMode())
  }, [])

  const setComfortMode = useCallback((enabled: boolean) => {
    setComfortModeState(enabled)
    localStorage.setItem(STORAGE_KEY, enabled ? COMFORT_VALUE : NORMAL_VALUE)
    document.documentElement.setAttribute('data-comfort-mode', String(enabled))
  }, [])

  const toggle = useCallback(() => {
    setComfortMode(!comfortMode)
  }, [comfortMode, setComfortMode])

  // Sync html attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-comfort-mode', String(comfortMode))
  }, [comfortMode])

  return { comfortMode, toggle, setComfortMode }
}

// ── COMFORT MODE TOGGLE COMPONENT ─────────────────────────────────────────────

interface ComfortModeToggleProps {
  /** Render as compact icon-only pill (default) or full labeled row */
  variant?: 'compact' | 'full'
  className?: string
}

export function ComfortModeToggle({ variant = 'full', className = '' }: ComfortModeToggleProps) {
  const { comfortMode, toggle } = useComfortMode()
  const announcerId = useId()

  const label = comfortMode ? 'Comfort Mode: On' : 'Comfort Mode: Off'
  const description = comfortMode
    ? 'All animations disabled. Click to re-enable motion.'
    : 'Reduces all animations and motion effects.'

  if (variant === 'compact') {
    return (
      <>
        {/* Screen reader announcer — aria-live region */}
        <span
          id={announcerId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {label}
        </span>
        <button
          onClick={toggle}
          aria-pressed={comfortMode}
          aria-label={label}
          title={description}
          className={[
            'relative inline-flex items-center justify-center w-8 h-8 rounded-component',
            'border transition-colors duration-quick',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-[var(--reveta-accent-signal-500)]',
            comfortMode
              ? 'bg-signal-900 border-signal-500 text-signal-300'
              : 'surface-float border-border-default text-text-secondary hover:text-text-primary',
            className,
          ].join(' ')}
        >
          <MotionIcon enabled={!comfortMode} />
        </button>
      </>
    )
  }

  return (
    <div className={`flex flex-col gap-reveta-1 ${className}`}>
      {/* Screen reader announcer */}
      <span
        id={announcerId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {label}
      </span>

      <div className="flex items-center justify-between gap-reveta-4">
        <div>
          <p className="reveta-label font-medium text-text-primary">Comfort Mode</p>
          <p className="reveta-label text-text-secondary">{description}</p>
        </div>

        {/* Toggle switch */}
        <button
          role="switch"
          aria-checked={comfortMode}
          aria-label="Toggle Comfort Mode"
          onClick={toggle}
          className={[
            'relative inline-flex w-11 h-6 items-center rounded-full shrink-0',
            'transition-colors duration-quick',
            'focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-[var(--reveta-accent-signal-500)]',
            comfortMode ? 'bg-signal-600' : 'bg-neutral-700',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block w-4 h-4 bg-white rounded-full shadow',
              'transition-transform duration-quick',
              comfortMode ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Comfort mode state indicator */}
      {comfortMode && (
        <p className="reveta-label text-signal-300 flex items-center gap-reveta-1.5">
          <span aria-hidden="true">✦</span>
          Animations paused system-wide
        </p>
      )}
    </div>
  )
}

// ── MOTION ICON ────────────────────────────────────────────────────────────────

function MotionIcon({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    // Pause/no-motion icon
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
    )
  }
  // Active motion icon
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
  )
}

// ── COMFORT MODE CSS (appended separately in globals.css) ─────────────────────
// All motion-disabling CSS is in globals.css under:
//   [data-comfort-mode="true"] .reveta-ambient { animation: none !important; }
//   [data-comfort-mode="true"] [data-parallax-layer] { transform: none !important; }
//   [data-comfort-mode="true"] .reveta-3d-parent { perspective: none !important; }
// See DS-CHROMATIC-MOODS and DS-PARALLAX-NARRATIVE CSS blocks.
