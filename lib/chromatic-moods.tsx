'use client'
/**
 * DS-CHROMATIC-MOODS — 4 Atmospheric States
 * Design System §1 · Chromatic Mood Map
 *
 * STATE-1: Ambient Rest    — Void+Ground surfaces, Tier-1 motion only, low brightness
 * STATE-2: Focused Flow    — Ground only, motion paused, reduced brightness (input focus)
 * STATE-3: Interaction Peak— Lift+Float surfaces, 1 accent, Tier-2 motion, high brightness
 * STATE-4: Revelation      — Float+Peak surfaces, accent flash, Tier-3 motion, burst brightness
 *
 * Usage:
 *   Wrap app in <ChromaticMoodProvider>
 *   const { mood, setMood, triggerRevelation } = useChromaticMood()
 */

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

export type ChromaticMood = 'ambient-rest' | 'focused-flow' | 'interaction-peak' | 'revelation'

interface ChromaticMoodContextValue {
  mood: ChromaticMood
  setMood: (mood: ChromaticMood) => void
  /** Fire STATE-4 Revelation for `duration`ms then return to previous state */
  triggerRevelation: (duration?: number) => void
  /** Convenience: call on textarea/input focus to enter STATE-2 */
  onInputFocus: () => void
  /** Convenience: call on textarea/input blur to return to STATE-1 */
  onInputBlur: () => void
  /** Convenience: call on interactive element hover to enter STATE-3 */
  onInteractionEnter: () => void
  /** Convenience: call on interactive element hover-exit */
  onInteractionLeave: () => void
}

const ChromaticMoodContext = createContext<ChromaticMoodContextValue | null>(null)

export function useChromaticMood(): ChromaticMoodContextValue {
  const ctx = useContext(ChromaticMoodContext)
  if (!ctx) throw new Error('useChromaticMood must be used inside ChromaticMoodProvider')
  return ctx
}

export function ChromaticMoodProvider({ children }: { children: React.ReactNode }) {
  const [mood, setMoodState] = useState<ChromaticMood>('ambient-rest')
  const previousMoodRef = useRef<ChromaticMood>('ambient-rest')
  const revelationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const interactionDepthRef = useRef(0) // track nested hover depth

  // Sync data-mood attribute to <html> for CSS targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood)
    return () => {
      document.documentElement.removeAttribute('data-mood')
    }
  }, [mood])

  const setMood = useCallback((nextMood: ChromaticMood) => {
    previousMoodRef.current = mood
    setMoodState(nextMood)
  }, [mood])

  const triggerRevelation = useCallback((duration = 1800) => {
    if (revelationTimerRef.current) clearTimeout(revelationTimerRef.current)
    previousMoodRef.current = mood
    setMoodState('revelation')
    revelationTimerRef.current = setTimeout(() => {
      setMoodState(previousMoodRef.current)
    }, duration)
  }, [mood])

  const onInputFocus = useCallback(() => {
    setMoodState('focused-flow')
  }, [])

  const onInputBlur = useCallback(() => {
    setMoodState('ambient-rest')
  }, [])

  const onInteractionEnter = useCallback(() => {
    interactionDepthRef.current++
    setMoodState('interaction-peak')
  }, [])

  const onInteractionLeave = useCallback(() => {
    interactionDepthRef.current = Math.max(0, interactionDepthRef.current - 1)
    if (interactionDepthRef.current === 0) {
      setMoodState('ambient-rest')
    }
  }, [])

  useEffect(() => {
    return () => {
      if (revelationTimerRef.current) clearTimeout(revelationTimerRef.current)
    }
  }, [])

  return (
    <ChromaticMoodContext.Provider value={{
      mood,
      setMood,
      triggerRevelation,
      onInputFocus,
      onInputBlur,
      onInteractionEnter,
      onInteractionLeave,
    }}>
      {children}
    </ChromaticMoodContext.Provider>
  )
}

/**
 * Convenience wrapper — wraps children in a div that automatically
 * triggers STATE-3 on pointer-enter and returns to previous on leave.
 * Zero-cost drop-in for interactive card surfaces.
 */
export function InteractionZone({ children, className }: { children: React.ReactNode, className?: string }) {
  const { onInteractionEnter, onInteractionLeave } = useChromaticMood()
  return (
    <div
      className={className}
      onPointerEnter={onInteractionEnter}
      onPointerLeave={onInteractionLeave}
    >
      {children}
    </div>
  )
}
