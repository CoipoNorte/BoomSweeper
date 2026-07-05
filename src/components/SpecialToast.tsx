import { useEffect, useState } from 'react'
import { SPECIAL_INFO } from '../constants'

const TOAST_INFO: Record<string, { emoji: string; label: string; color: string; description: string }> = {
  ...SPECIAL_INFO,
  defuse: { emoji: '💚', label: 'Desactivado', color: '#4ade80', description: '¡Mina neutralizada!' },
  detector: { emoji: '🔍', label: 'Detector', color: '#fbbf24', description: '¡Minas visibles por 4s!' },
  sonar: { emoji: '📡', label: 'Sonar', color: '#38bdf8', description: '¡Fila + columna escaneadas!' },
  xray: { emoji: '🔬', label: 'Rayos X', color: '#c084fc', description: '¡Zona de 5×5 escaneada!' },
  lucky: { emoji: '🍀', label: 'Suerte', color: '#86efac', description: '¡Próxima casilla segura!' },
  shield_save: { emoji: '🛡️', label: 'Escudo', color: '#a78bfa', description: '¡Escudo activado, salvado!' },
  explosion: { emoji: '💥', label: 'Explosión', color: '#ef4444', description: '¡Minas alrededor!' },
}

export function SpecialToast({ specialType, onDone }: { specialType: string; onDone: () => void }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setOn(true), 30)
    const b = setTimeout(() => setOn(false), 1700)
    const c = setTimeout(onDone, 2000)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }
  }, [onDone])

  const info = TOAST_INFO[specialType]
  if (!info) return null

  return (
    <div className="fixed inset-x-0 z-[60] flex justify-center pointer-events-none" style={{ top: 90 }}>
      <div
        className="pointer-events-auto px-5 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-200"
        style={{
          background: info.color + '18', borderColor: info.color + '30',
          boxShadow: `0 8px 24px ${info.color}15`,
          transform: on ? 'translateY(0) scale(1)' : 'translateY(8px) scale(.92)',
          opacity: on ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <div className="font-bold text-sm" style={{ color: info.color }}>¡{info.label}!</div>
            <div className="text-xs text-white/35">{info.description}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
