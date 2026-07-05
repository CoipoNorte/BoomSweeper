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
          <IconBtn onClick={onHome}>🏠</IconBtn>
          <IconBtn onClick={onRestart}>🔄</IconBtn>
          {(state.gameStatus === 'playing' || state.gameStatus === 'idle') && (
            <IconBtn onClick={onPause}>
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
            onClick={onToggleFlag}
            className={`md:hidden text-xs font-bold px-2.5 py-1.5 rounded-full transition-all
              ${flagMode ? 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/30' : 'bg-white/[.04] text-white/30'}`}
          >
            {flagMode ? '🚩 Flag' : '👆 Tap'}
          </button>
          <span className="text-sm">{DIFFICULTY_CONFIGS[state.difficulty].emoji}</span>
        </div>
      </div>

      {/* Stats: always 3 columns, never overflows */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <StatBox label="Minas" val={`💣 ${state.minesLeft}`} cls={state.minesLeft < 0 ? 'text-red-400' : ''} />
        <StatBox label="Tiempo" val={`${mm}:${ss}`} cls={state.freezeActive ? 'text-cyan-300' : ''} sub={state.freezeActive ? `❄️ ${state.freezeTimeLeft}s` : undefined} />
        <StatBox label="Score" val={state.score.toLocaleString()} cls="text-amber-400" />
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 rounded-full bg-white/[.06] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7c3aed,#d946ef,#f59e0b)' }} />
        </div>
        <span className="text-[10px] text-white/20 font-bold w-7 text-right">{pct}%</span>
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

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-9 h-9 rounded-lg bg-white/[.04] border border-white/[.06] flex items-center justify-center text-sm active:scale-90 transition-transform">
      {children}
    </button>
  )
}

function StatBox({ label, val, cls, sub }: { label: string; val: string; cls?: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/[.03] border border-white/[.05] py-2 text-center">
      <div className="text-[9px] uppercase tracking-widest text-white/20">{label}</div>
      <div className={`text-sm font-extrabold tabular-nums mt-0.5 ${cls || 'text-white/80'}`}>{val}</div>
      {sub && <div className="text-[9px] text-cyan-400/60 mt-0.5">{sub}</div>}
    </div>
  )
}

function Pill({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c + '18', color: c, border: `1px solid ${c}30` }}>
      {children}
    </span>
  )
}
