import type { Particle } from '../types'

export function ParticleLayer({ particles }: { particles: Particle[] }) {
  if (!particles.length) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute" style={{ left: p.x, top: p.y, opacity: Math.max(0, p.life), transform: `scale(${p.life})` }}>
          {p.emoji
            ? <span style={{ fontSize: p.size * 2 }}>{p.emoji}</span>
            : <div className="rounded-full" style={{ width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 ${p.size}px ${p.color}` }} />
          }
        </div>
      ))}
    </div>
  )
}
