import { useCallback, useRef, useState } from 'react'
import type { Particle } from '../types'

let particleId = 0

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const spawnParticles = useCallback(
    (x: number, y: number, count: number, colors: string[], emojis?: string[]) => {
      const newParticles: Particle[] = []
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = 2 + Math.random() * 4
        newParticles.push({
          id: particleId++,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          emoji: emojis ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        })
      }

      setParticles(prev => [...prev, ...newParticles])

      if (!animFrameRef.current) {
        lastTimeRef.current = performance.now()
        const animate = (time: number) => {
          const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05)
          lastTimeRef.current = time

          setParticles(prev => {
            const updated = prev
              .map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 6 * dt,
                life: p.life - dt / p.maxLife,
                size: p.size * 0.98,
              }))
              .filter(p => p.life > 0)

            if (updated.length === 0) {
              animFrameRef.current = 0
              return []
            }

            animFrameRef.current = requestAnimationFrame(animate)
            return updated
          })
        }
        animFrameRef.current = requestAnimationFrame(animate)
      }
    },
    []
  )

  const spawnExplosion = useCallback(
    (x: number, y: number) => {
      spawnParticles(x, y, 20, ['#ef4444', '#f97316', '#eab308', '#fbbf24'], ['💥', '🔥', '💣'])
    },
    [spawnParticles]
  )

  const spawnSuccess = useCallback(
    (x: number, y: number) => {
      spawnParticles(x, y, 8, ['#22c55e', '#3b82f6', '#a855f7', '#f472b6'], ['✨', '⭐'])
    },
    [spawnParticles]
  )

  const spawnSpecial = useCallback(
    (x: number, y: number, emoji: string) => {
      spawnParticles(x, y, 12, ['#fbbf24', '#f472b6', '#a78bfa', '#67e8f9'], [emoji])
    },
    [spawnParticles]
  )

  const spawnWin = useCallback(
    (x: number, y: number) => {
      spawnParticles(x, y, 30, ['#fbbf24', '#22c55e', '#3b82f6', '#f472b6', '#a855f7'], ['🎉', '🏆', '💎', '🌟', '🎊'])
    },
    [spawnParticles]
  )

  return { particles, spawnExplosion, spawnSuccess, spawnSpecial, spawnWin, spawnParticles }
}
