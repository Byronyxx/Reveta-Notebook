'use client'
/**
 * DS-COMP-IMMERSIVE — 6 Gaming-Grade Immersive Components
 * Design System §4 · TIER-2 + TIER-3 Motion · GPU-first
 *
 * Components:
 *   HoverCard3D      — Perspective tilt on pointer move, Z-lift on hover
 *   GlitchText       — Chromatic aberration text effect with trigger modes
 *   AmbientParticles — Floating particle field, IntersectionObserver-paused
 *   IntersectionReveal — Scroll-triggered opacity+translate reveal
 *   PulseRing        — Concentric expanding ring for attention / status signals
 *   CursorMagnetic   — Magnetic cursor attraction on interactive elements
 *
 * All components:
 *   - Use only transform + opacity on GPU (will-change declared)
 *   - Respect prefers-reduced-motion (all motion disabled)
 *   - Respect data-comfort-mode="true" (same as reduced-motion)
 *   - ARIA: decorative elements aria-hidden, interactive state announced
 */

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.comfortMode === 'true'
  )
}

// ─── 1. HOVER CARD 3D ─────────────────────────────────────────────────────────
/**
 * Wraps children in a perspective container that tilts toward the cursor.
 * Perspective is on the PARENT, not the child (Design System rule).
 * Max rotation: 8deg (luxury) or 15deg (gaming) — set via `intensity`.
 */
export function HoverCard3D({
  children,
  intensity = 'luxury',
  className = '',
  style,
}: {
  children: ReactNode
  intensity?: 'luxury' | 'gaming'
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const maxDeg = intensity === 'gaming' ? 15 : 8
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg) translateZ(0)')
  const [shadow, setShadow] = useState('var(--reveta-surface-float)')
  const isHovered = useRef(false)

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    const rotX = -dy * maxDeg
    const rotY =  dx * maxDeg
    setTransform(`perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(16px)`)
    setShadow(`0 ${8 + Math.abs(dy) * 16}px ${32 + Math.abs(dx) * 32}px rgba(0,0,0,0.4)`)
  }, [maxDeg])

  const onPointerEnter = useCallback(() => {
    isHovered.current = true
  }, [])

  const onPointerLeave = useCallback(() => {
    isHovered.current = false
    setTransform('rotateX(0deg) rotateY(0deg) translateZ(0)')
    setShadow('var(--reveta-surface-float)')
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 200ms ease',
        transform,
        boxShadow: shadow,
        willChange: 'transform',
        ...style,
      }}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  )
}

// ─── 2. GLITCH TEXT ───────────────────────────────────────────────────────────
/**
 * Renders text with a chromatic aberration glitch effect.
 * Trigger modes:
 *   'hover'    — glitch on pointer enter (default)
 *   'loop'     — glitch continuously on a fixed interval
 *   'manual'   — glitch when `active` prop changes to true
 */
export function GlitchText({
  children,
  trigger = 'hover',
  active = false,
  intensity = 1,
  className = '',
  as: Tag = 'span',
}: {
  children: string
  trigger?: 'hover' | 'loop' | 'manual'
  active?: boolean
  intensity?: 1 | 2 | 3
  className?: string
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div'
}) {
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fireGlitch = useCallback(() => {
    if (prefersReducedMotion()) return
    setGlitching(true)
    timerRef.current = setTimeout(() => setGlitching(false), 400 + intensity * 100)
  }, [intensity])

  // Loop mode
  useEffect(() => {
    if (trigger !== 'loop') return
    intervalRef.current = setInterval(fireGlitch, 3000 + intensity * 500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [trigger, fireGlitch, intensity])

  // Manual mode
  useEffect(() => {
    if (trigger !== 'manual') return
    if (active) fireGlitch()
  }, [trigger, active, fireGlitch])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const shift = intensity * 2

  return (
    <Tag
      className={`glitch-text relative inline-block select-none ${className}`}
      onPointerEnter={trigger === 'hover' ? fireGlitch : undefined}
      aria-label={children}
      style={{ isolation: 'isolate' }}
    >
      {children}
      {/* Chromatic aberration pseudo-layers — aria-hidden */}
      {glitching && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              color: 'rgba(255,17,119,0.85)',
              transform: `translate(${shift}px, -1px) skewX(-1deg)`,
              clipPath: `inset(${20 + intensity * 10}% 0 ${30 + intensity * 5}% 0)`,
              mixBlendMode: 'screen',
            }}
          >
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              color: 'rgba(45,45,150,0.85)',
              transform: `translate(-${shift}px, 1px) skewX(1deg)`,
              clipPath: `inset(${50 + intensity * 5}% 0 ${10 + intensity * 5}% 0)`,
              mixBlendMode: 'screen',
            }}
          >
            {children}
          </span>
        </>
      )}
    </Tag>
  )
}

// ─── 3. AMBIENT PARTICLES ─────────────────────────────────────────────────────
/**
 * Floating particle field — purely decorative, aria-hidden.
 * Uses IntersectionObserver to pause animation when off-screen.
 * count: number of particles (max 40 recommended for perf)
 * variant: 'stars' (dots) | 'sparks' (slightly elongated)
 */
export function AmbientParticles({
  count = 20,
  variant = 'stars',
  className = '',
}: {
  count?: number
  variant?: 'stars' | 'sparks'
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Deterministic positions — avoid hydration mismatch
  const particles = Array.from({ length: count }, (_, i) => ({
    x:    ((i * 73 + 17) % 100),
    y:    ((i * 31 + 43) % 100),
    size: 1 + ((i * 11) % 3),
    dur:  4000 + ((i * 1300) % 7000),
    delay: (i * 400) % 6000,
    opacity: 0.02 + ((i * 7) % 15) * 0.004,
  }))

  if (prefersReducedMotion()) return null

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-primary-400"
          style={{
            left:   `${p.x}%`,
            top:    `${p.y}%`,
            width:  `${p.size}px`,
            height: variant === 'sparks' ? `${p.size * 2}px` : `${p.size}px`,
            opacity: p.opacity,
            willChange: 'transform',
            animation: paused
              ? 'none'
              : `reveta-particle-float ${p.dur}ms var(--reveta-ease-float) ${p.delay}ms infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── 4. INTERSECTION REVEAL ───────────────────────────────────────────────────
/**
 * Wraps children in a scroll-triggered reveal: opacity 0→1 + translateY offset→0.
 * Uses IntersectionObserver with configurable threshold.
 * `once`: default true — only reveals once, does not re-hide on scroll-out.
 */
export function IntersectionReveal({
  children,
  className = '',
  delay = 0,
  translateY = 16,
  once = true,
  threshold = 0.15,
}: {
  children: ReactNode
  className?: string
  delay?: number
  translateY?: number
  once?: boolean
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) io.disconnect()
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once, threshold])

  const reduced = prefersReducedMotion()

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: (visible || reduced) ? 1 : 0,
        transform: (visible || reduced) ? 'translateY(0) translateZ(0)' : `translateY(${translateY}px) translateZ(0)`,
        transition: reduced
          ? 'none'
          : `opacity var(--reveta-duration-deliberate) var(--reveta-ease-reveal) ${delay}ms,
             transform var(--reveta-duration-deliberate) var(--reveta-ease-reveal) ${delay}ms`,
        willChange: reduced ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  )
}

// ─── 5. PULSE RING ────────────────────────────────────────────────────────────
/**
 * Concentric expanding ring — attention signal or status indicator.
 * Variants:
 *   'active'   — blue primary, continuous
 *   'signal'   — pink accent, urgent
 *   'success'  — green, one-shot then stops
 *   'idle'     — neutral, slow, very subtle
 */
export function PulseRing({
  variant = 'active',
  size = 40,
  className = '',
  'aria-label': ariaLabel,
}: {
  variant?: 'active' | 'signal' | 'success' | 'idle'
  size?: number
  className?: string
  'aria-label'?: string
}) {
  const colorMap = {
    active:  'rgba(45,45,150,',
    signal:  'rgba(255,17,119,',
    success: 'rgba(34,197,94,',
    idle:    'rgba(120,120,160,',
  }
  const durationMap = { active: 1600, signal: 1000, success: 2000, idle: 3000 }
  const color = colorMap[variant]
  const dur = durationMap[variant]
  const reduced = prefersReducedMotion()

  return (
    <div
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Core dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          background: `${color}0.9)`,
        }}
      />
      {/* Ring 1 */}
      {!reduced && (
        <div
          aria-hidden="true"
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `${color}0.6)`,
            animation: `reveta-pulse-ring ${dur}ms var(--reveta-ease-dramatic) infinite`,
          }}
        />
      )}
      {/* Ring 2 — offset */}
      {!reduced && (
        <div
          aria-hidden="true"
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `${color}0.3)`,
            animation: `reveta-pulse-ring ${dur}ms var(--reveta-ease-dramatic) ${dur * 0.5}ms infinite`,
          }}
        />
      )}
    </div>
  )
}

// ─── 6. CURSOR MAGNETIC ───────────────────────────────────────────────────────
/**
 * Magnetic cursor attraction — the wrapped element drifts toward the cursor
 * within a defined attraction radius. Snaps back on pointer leave.
 * strength: 0.0–1.0 (0.3 is subtle luxury, 0.7 is gaming-grade pull)
 */
export function CursorMagnetic({
  children,
  strength = 0.3,
  radius = 80,
  className = '',
}: {
  children: ReactNode
  strength?: number
  radius?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const animRef = useRef<number | null>(null)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (prefersReducedMotion()) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius) {
      const pull = (1 - dist / radius) * strength
      setOffset({ x: dx * pull, y: dy * pull })
    } else {
      setOffset({ x: 0, y: 0 })
    }
  }, [strength, radius])

  const onPointerLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerleave', onPointerLeave)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [onPointerMove, onPointerLeave])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) translateZ(0)`,
        transition: 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        display: 'inline-block',
      }}
    >
      {children}
    </div>
  )
}
