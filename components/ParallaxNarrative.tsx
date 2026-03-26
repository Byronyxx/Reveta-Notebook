'use client'
import { useRef, useEffect, useCallback } from 'react'

export type ParallaxLayer = 'base' | 'ground' | 'content' | 'foreground' | 'sky'

const PARALLAX_COEFFICIENTS: Record<ParallaxLayer, number | 'fixed'> = { base: 0.2, ground: 0.4, content: 0.7, foreground: 1.1, sky: 'fixed' }
const LAYER_Z: Record<ParallaxLayer, number> = { base: 0, ground: 10, content: 20, foreground: 30, sky: 100 }

export function ParallaxScene({ children, height = '100vh', className = '', staticMode = false }: { children: React.ReactNode; height?: string; className?: string; staticMode?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || staticMode) return
    const rect = container.getBoundingClientRect()
    const scrollPx = (1 - (rect.top + rect.height) / (window.innerHeight + rect.height)) * rect.height
    container.querySelectorAll<HTMLElement>('[data-parallax-layer]').forEach(el => {
      const coeff = PARALLAX_COEFFICIENTS[el.dataset.parallaxLayer as ParallaxLayer]
      if (coeff === 'fixed') return
      el.style.transform = `translateY(${-(scrollPx * (coeff as number))}px) translateZ(0)`
    })
  }, [staticMode])
  useEffect(() => {
    if (!CSS.supports('animation-timeline', 'scroll()')) {
      let rafId: number
      const onScroll = () => { rafId = requestAnimationFrame(handleScroll) }
      window.addEventListener('scroll', onScroll, { passive: true })
      handleScroll()
      return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
    }
  }, [handleScroll])
  return <div ref={containerRef} className={`parallax-scene relative overflow-hidden ${className}`} style={{ height, perspective: '1px', perspectiveOrigin: '50% 50%' }}>{children}</div>
}

export function ParallaxPlane({ layer, children, className = '', interactive = false }: { layer: ParallaxLayer; children?: React.ReactNode; className?: string; interactive?: boolean }) {
  const coeff = PARALLAX_COEFFICIENTS[layer]
  const isFixed = coeff === 'fixed'
  return <div data-parallax-layer={layer} aria-hidden={!interactive || undefined} className={['parallax-plane', `parallax-plane--${layer}`, 'absolute inset-0', !isFixed ? `parallax-scroll-${layer}` : '', 'motion-safe:will-change-transform', className].join(' ')} style={{ zIndex: LAYER_Z[layer], willChange: isFixed ? 'auto' : 'transform' }}>{children}</div>
}

export function AtmosphericVoid({ className = '' }: { className?: string }) {
  return <ParallaxPlane layer="base" className={className}><div aria-hidden="true" className="absolute inset-0 overflow-hidden"><div className="absolute w-[60vw] h-[60vw] -top-[10vw] -left-[10vw] rounded-full opacity-[0.07] blur-[80px] reveta-ambient" style={{ background: 'radial-gradient(ellipse, var(--reveta-color-primary-500) 0%, transparent 70%)' }} /><div className="absolute w-[40vw] h-[40vw] bottom-0 right-0 rounded-full opacity-[0.04] blur-[100px] reveta-ambient" style={{ background: 'radial-gradient(ellipse, var(--reveta-color-primary-400) 0%, transparent 70%)' }} /></div></ParallaxPlane>
}

export function AtmosphericFog({ className = '' }: { className?: string }) {
  return <ParallaxPlane layer="ground" className={className}><div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" /></ParallaxPlane>
}

export function AtmosphericShards({ count = 12, className = '' }: { count?: number; className?: string }) {
  const shards = Array.from({ length: count }, (_, i) => ({ left: ((i * 37 + 11) % 100), top: ((i * 53 + 7) % 100), size: 1 + ((i * 17) % 3), opacity: 0.03 + ((i * 7) % 12) * 0.005, duration: 4000 + (i * 1100) % 6000 }))
  return <ParallaxPlane layer="foreground" className={className}><div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">{shards.map((s, i) => <div key={i} className="absolute rounded-full bg-primary-400 reveta-ambient" style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDuration: `${s.duration}ms` }} />)}</div></ParallaxPlane>
}
