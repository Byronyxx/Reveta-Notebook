'use client'
import { useEffect, useState } from 'react'

type MotionState = 'full' | 'reduced-os' | 'comfort' | 'reduced-both'

export function useMotion() {
    const [motionState, setMotionState] = useState<MotionState>('full')

    useEffect(() => {
        const osReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches
        const comfortMode =
            localStorage.getItem('reveta-motion') === 'comfort'

        if (osReduced && comfortMode) setMotionState('reduced-both')
        else if (osReduced) setMotionState('reduced-os')
        else if (comfortMode) setMotionState('comfort')
        else setMotionState('full')
    }, [])

    const setComfortMode = (enabled: boolean) => {
        localStorage.setItem('reveta-motion', enabled ? 'comfort' : 'full')
        document.documentElement.setAttribute(
            'data-comfort-mode',
            enabled ? 'true' : 'false'
        )
        setMotionState(prev => {
            if (enabled) return prev === 'reduced-os' ? 'reduced-both' : 'comfort'
            return prev === 'reduced-both' ? 'reduced-os' : 'full'
        })
    }

    return {
        motionState,
        isReduced: motionState !== 'full',
        setComfortMode,
    }
}
