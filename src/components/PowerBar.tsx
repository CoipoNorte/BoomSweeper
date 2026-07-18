import { memo } from 'react'
import type { SpecialType } from '../types'
import { SPECIAL_INFO } from '../constants'

interface Props {
  inventory: SpecialType[]
  activePower: SpecialType | null
  flagMode: boolean
  onActivate: (power: SpecialType) => void
  onCancel: () => void
  onToggleFlag: () => void
}

export const PowerBar = memo(function PowerBar({ inventory, activePower, flagMode, onActivate, onCancel, onToggleFlag }: Props) {
  // Count duplicates
  const counts = new Map<SpecialType, number>()
  for (const p of inventory) counts.set(p, (counts.get(p) || 0) + 1)
  const unique = Array.from(counts.keys())

  if (unique.length === 0 && !activePower) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Active power indicator */}
      {activePower && (
        <div className="flex items-center justify-center gap-2 py-2 px-4"
          style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)' }}>
          <span className="text-sm text-white/80">Toca una casilla para usar</span>
          <span className="text-lg">{SPECIAL_INFO[activePower]?.emoji}</span>
          <span className="text-xs font-bold" style={{ color: SPECIAL_INFO[activePower]?.color }}>
            {SPECIAL_INFO[activePower]?.label}
          </span>
          <button
            onClick={onCancel}
            className="ml-2 px-2 py-1 rounded-lg bg-white/10 text-white/60 text-xs font-bold active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile actions bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 overflow-x-auto"
        style={{ background: 'rgba(13,13,26,.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagMode}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 active:scale-95 transition-all duration-150 ${flagMode ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-400/40' : 'bg-white/10 text-white/70'}`}
        >
          <span className="text-lg">🚩</span>
          <span className="text-[11px] font-bold">{flagMode ? 'Bandera' : 'Marcar'}</span>
        </button>
        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider flex-shrink-0 mr-1">Poder</span>
        {unique.map((power) => {
          const info = SPECIAL_INFO[power]
          if (!info) return null
          const count = counts.get(power) || 1
          const isActive = activePower === power
          return (
            <button
              key={power}
              onClick={() => onActivate(power)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 active:scale-95 transition-all duration-150 ${
                isActive ? 'ring-2' : ''
              }`}
              style={{
                background: isActive ? `${info.color}30` : 'rgba(255,255,255,.06)',
                border: `1px solid ${isActive ? info.color + '60' : 'rgba(255,255,255,.08)'}`,
                ...(isActive ? { ringColor: info.color } : {}),
              }}
              aria-label={`Activar ${info.label}: ${info.description}`}
            >
              <span className="text-lg">{info.emoji}</span>
              <span className="text-[11px] font-bold text-white/70">{info.label}</span>
              {count > 1 && (
                <span className="text-[9px] font-black text-white/40 bg-white/10 rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})
