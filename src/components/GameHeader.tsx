import { DIFFICULTY_CONFIGS } from '../constants'
import type { GameState } from '../types'

interface Props {
  state: GameState; revealedCount: number; totalSafeCells: number
  flagMode: boolean; onToggleFlag: () => void
  onPause: () => void; onRestart: () => void; onHome: () => void
}

export function GameHeader({ state, revealedCount, totalSafeCells, flagMode, onToggleFlag, onPause, onRestart, onHome }: Props) {
  const pct = totalSafeCells > 0 ? Math.round((revealedCount / totalSafeCells) * 100) : 0
  const mm = Math.floor(state.time / 60)
  const ss = String(state.time % 60).padStart(2, '0')

  return (
    <div className="w-full" style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Top row: buttons left, stats right */}
      <div className="flex items-center justify-between mb-2">

        {/* Left: nav */}
        <div className="flex items-center gap-1">
          <IconBtn onClick={onHome} label="Menú principal">🏠</IconBtn>
          <IconBtn onClick={onRestart} label="Reiniciar partida">🔄</IconBtn>
          {(state.gameStatus === 'playing' || state.gameStatus === 'idle') && (
            <IconBtn onClick={onPause} label="Pausar">
              {/* SVG pause — no blue emoji */}
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" className="text-white/50">
                <rect width="3" height="12" rx="1" />
                <rect x="7" width="3" height="12" rx="1" />
              </svg>
            </IconBtn>
          )}
        </div>

        {/* Right: flag mode + badge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFlag}
            aria-label={flagMode ? 'Cambiar a modo revelar' : 'Cambiar a modo bandera'}
            aria-pressed={flagMode}
            className={`md:hidden text-sm font-bold px-3 py-2 rounded-full transition-all min-h-[44px]
              ${flagMode ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-400/40' : 'bg-white/[.06] text-white/50'}`}
          >
            {flagMode ? '🚩 Bandera' : '👆 Revelar'}
          </button>
          <span className="text-sm">{DIFFICULTY_CONFIGS[state.difficulty].emoji}</span>
        </div>
      </div>

      {/* Stats: always 3 columns, never overflows */}
      <div className="grid grid-cols-3 gap-1.5 mb-2" role="status">
        <StatBox label="Minas" val={`💣 ${state.minesLeft}`} cls={state.minesLeft < 0 ? 'text-red-400' : ''} />
        <StatBox label="Tiempo" val={`${mm}:${ss}`} cls={state.freezeActive ? 'text-cyan-300' : ''} sub={state.freezeActive ? `❄️ ${state.freezeTimeLeft}s` : undefined} />
        <StatBox label="Score" val={state.score.toLocaleString()} cls="text-amber-400" />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% completado`} aria-live="off">
        <div className="flex-1 h-2.5 rounded-full bg-white/[.08] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#d946ef,#f59e0b)' }} />
        </div>
        <span className="text-xs text-white/40 font-bold w-8 text-right">{pct}%</span>
      </div>

      {/* Active buffs */}
      {(state.shieldActive || state.freezeActive || state.combo > 1) && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {state.shieldActive && <Pill c="#a78bfa">🛡️ Escudo</Pill>}
          {state.freezeActive && <Pill c="#67e8f9">❄️ Freeze {state.freezeTimeLeft}s</Pill>}
          {state.combo > 1 && <Pill c="#fbbf24">🔥 ×{state.combo}</Pill>}
        </div>
      )}
    </div>
  )
}

function IconBtn({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="w-11 h-11 rounded-lg bg-white/[.06] border border-white/[.10] flex items-center justify-center text-base active:scale-90 transition-transform">
      {children}
    </button>
  )
}

function StatBox({ label, val, cls, sub }: { label: string; val: string; cls?: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/[.04] border border-white/[.08] py-2.5 text-center">
      <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">{label}</div>
      <div className={`text-base font-extrabold tabular-nums mt-0.5 ${cls || 'text-white/90'}`}>{val}</div>
      {sub && <div className="text-[11px] text-cyan-300/70 mt-0.5 font-medium">{sub}</div>}
    </div>
  )
}

function Pill({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: c + '20', color: c, border: `1px solid ${c}40` }}>
      {children}
    </span>
  )
}
