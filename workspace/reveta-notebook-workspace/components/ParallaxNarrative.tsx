'use client'
/**
 * DS-PARALLAX-NARRATIVE — 5-Plane Parallax Choreography
 * Design System §3 · Z-Axis Elevation System · TIER-4 NARRATIVE Motion
 *
 * Planes (z-index, parallax coefficient):
 *   z-0 Base:       coefficient 0.2x — slowest, deepest background
 *   z-1 Ground:     coefficient 0.4x — terrain layer
 *   z-2 Content:    coefficient 0.7x — near-background
 *   z-3 Foreground: coefficient 1.1x — moves faster than scroll
 *   z-4 Sky:        fixed — atmosphere, non-parallax overlay
 *
 * Implementation: CSS Scroll Timeline (Chrome 115+) with JS RAF fallback for Safari.
 * All decorative planes are aria-hidden. Fully disabled under prefers-reduced-motion.
 *
 * Usage:
 *   <ParallaxScene height="600px">
 *     <ParallaxPlane layer="base">   <BackgroundTexture /> </ParallaxPlane>
 *     <ParallaxPlane layer="ground"> <GroundFog />         </ParallaxPlane>
 *     <ParallaxPlane layer="content" interactive> <HeroContent /> </ParallaxPlane>
 *     <ParallaxPlane layer="foreground"> <ForegroundShards /> </ParallaxPlane>
 *     <ParallaxPlane layer="sky">    <AtmosphericHaze />  </ParallaxPlane>
 *   </ParallaxScene>
 */

import { useRef, useEffect, useCallback } from 'react'

export type ParallaxLayer = 'base' | 'ground' | 'content' | 'foreground' | 'sky'

// Design System coefficients from §3 Z-Axis table
const PARALLAX_COEFFICIENTS: Record<ParallaxLayer, number | 'fixed'> = {
  base:       0.2,
  ground:     0.4,
  content:    0.7,
  foreground: 1.1,
  sky:        'fixed',
}

const LAYER_Z: Record<ParallaxLayer, number> = {
  base:       0,
  ground:     10,
  content:    20,
  foreground: 30,
  sky:        100,
}

interface ParallaxSceneProps {
  children: React.ReactNode
  height?: string
  className?: string
  /** When true, disables JS parallax (use when content handles its own scroll) */
  staticMode?: boolean
}

/**
 * ParallaxScene — root container that establishes the parallax scroll context.
 * Sets perspective on the container, not individual children (Design System rule).
 */
export function ParallaxScene({
  children,
  height = '100vh',
  className = '',
  staticMode = false,
}: ParallaxSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || staticMode) return
    const rect = container.getBoundingClientRect()
    const scrollRatio = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height)
    const scrollPx = scrollRatio * rect.height

    // Apply JS transforms to each plane — this is the Safari fallback
    container.querySelectorAll<HTMLElement>('[data-parallax-layer]').forEach(el => {
      const layer = el.dataset.parallaxLayer as ParallaxLayer
      const coeff = PARALLAX_COEFFICIENTS[layer]
      if (coeff === 'fixed') return
      // Positive coefficient = moves up slower (depth); > 1 = moves up faster (foreground pop)
      const translateY = -(scrollPx * coeff)
      el.style.transform = `translateY(${translateY}px) translateZ(0)`
    })
  }, [staticMode])

  useEffect(() => {
    // Check for CSS Scroll Timeline support
    const supportsScrollTimeline = CSS.supports('animation-timeline', 'scroll()')

    if (!supportsScrollTimeline) {
      // JS RAF fallback for Safari and older browsers
      let rafId: number
      const onScroll = () => {
        rafId = requestAnimationFrame(handleScroll)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      handleScroll() // initial position
      return () => {
        window.removeEventListener('scroll', onScroll)
        cancelAnimationFrame(rafId)
      }
    }
    // CSS Scroll Timeline path — handled by CSS classes, no JS needed
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className={`parallax-scene relative overflow-hidden ${className}`}
      style={{
        height,
        perspective: '1px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  )
}

interface ParallaxPlaneProps {
  layer: ParallaxLayer
  children?: React.ReactNode
  className?: string
  /**
   * When true, this plane contains interactive/informational content.
   * Removes aria-hidden and keeps the plane in the accessibility tree.
   */
  interactive?: boolean
}

/**
 * ParallaxPlane — individual depth plane within a ParallaxScene.
 * Decorative planes (interactive=false) are aria-hidden for screen readers.
 */
export function ParallaxPlane({
  layer,
  children,
  className = '',
  interactive = false,
}: ParallaxPlaneProps) {
  const coeff = PARALLAX_COEFFICIENTS[layer]
  const zIndex = LAYER_Z[layer]
  const isFixed = coeff === 'fixed'

  return (
    <div
      data-parallax-layer={layer}
      aria-hidden={!interactive || undefined}
      className={[
        'parallax-plane',
        `parallax-plane--${layer}`,
        'absolute inset-0',
        // CSS Scroll Timeline animation class — handles Chromium natively
        !isFixed ? `parallax-scroll-${layer}` : '',
        // Comfort mode class — motion disabled via data-comfort-mode selector in CSS
        'motion-safe:will-change-transform',
        className,
      ].join(' ')}
      style={{
        zIndex,
        willChange: isFixed ? 'auto' : 'transform',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Built-in atmospheric layer presets — drop-in ambient planes for common use.
 * All are aria-hidden and Tier-1 ambient (paused under prefers-reduced-motion).
 */
export function AtmosphericVoid({ className = '' }: { className?: string }) {
  return (
    <ParallaxPlane layer="base" className={className}>
      {/* Deep void — primary orb */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
      >
        <div className={[
          'absolute w-[60vw] h-[60vw] -top-[10vw] -left-[10vw]',
          'rounded-full opacity-[0.07]',
          'bg-gradient-radial from-primary-500 via-primary-800 to-transparent',
          'blur-[80px]',
          'reveta-ambient',
        ].join(' ')} />
        <div className={[
          'absolute w-[40vw] h-[40vw] bottom-0 right-0',
          'rounded-full opacity-[0.04]',
          'bg-gradient-radial from-primary-400 to-transparent',
          'blur-[100px]',
          'reveta-ambient',
        ].join(' ')} />
      </div>
    </ParallaxPlane>
  )
}

export function AtmosphericFog({ className = '' }: { className?: string }) {
  return (
    <ParallaxPlane layer="ground" className={className}>
      <div
        aria-hidden="true"
        className={[
          'absolute inset-x-0 bottom-0 h-[40%]',
          'bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent',
          'pointer-events-none',
        ].join(' ')}
      />
    </ParallaxPlane>
  )
}

export function AtmosphericShards({ count = 12, className = '' }: { count?: number, className?: string }) {
  // Deterministic positions — no random to avoid hydration mismatch
  const shards = Array.from({ length: count }, (_, i) => ({
    left: ((i * 37 + 11) % 100),
    top:  ((i * 53 + 7)  % 100),
    size: 1 + ((i * 17) % 3),
    opacity: 0.03 + ((i * 7) % 12) * 0.005,
    duration: 4000 + (i * 1100) % 6000,
  }))

  return (
    <ParallaxPlane layer="foreground" className={className}>
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {shards.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary-400 reveta-ambient"
            style={{
              left: `${s.left}%`,
              top:  `${s.top}%`,
              width:  `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: `${s.duration}ms`,
            }}
          />
        ))}
      </div>
    </ParallaxPlane>
  )
}
