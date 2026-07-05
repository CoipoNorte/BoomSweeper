import { useCallback, useRef } from 'react'

// Simple Web Audio API sound effects
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, duration: number, type: OscillatorType = 'sine', vol: number = 0.1) => {
      try {
        const ctx = getCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        gain.gain.setValueAtTime(vol, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + duration)
      } catch {
        // Silently fail if audio not available
      }
    },
    [getCtx]
  )

  const playClick = useCallback(() => {
    playTone(600, 0.08, 'square', 0.05)
  }, [playTone])

  const playReveal = useCallback(() => {
    playTone(800, 0.1, 'sine', 0.06)
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.04), 50)
  }, [playTone])

  const playFlag = useCallback(() => {
    playTone(500, 0.15, 'triangle', 0.08)
  }, [playTone])

  const playExplosion = useCallback(() => {
    playTone(100, 0.5, 'sawtooth', 0.15)
    setTimeout(() => playTone(60, 0.4, 'square', 0.1), 100)
  }, [playTone])

  const playSpecial = useCallback(() => {
    playTone(523, 0.1, 'sine', 0.08)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.08), 80)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 160)
  }, [playTone])

  const playWin = useCallback(() => {
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.1), i * 150)
    })
  }, [playTone])

  return { playClick, playReveal, playFlag, playExplosion, playSpecial, playWin }
}
