import { useState, useEffect } from 'react'
import type { GameState, HighScore } from '../types'
import { saveHighScore, getHighScores } from '../storage'
import { DIFFICULTY_CONFIGS } from '../constants'

export function GameOverModal({ state, onRestart, onHome }: { state: GameState; onRestart:()=>void; onHome:()=>void }) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [top, setTop] = useState<HighScore[]>([])
  const [show, setShow] = useState(false)
  const win = state.gameStatus === 'won'

  useEffect(() => { setTimeout(() => setShow(true), 150); getHighScores().then(setTop) }, [])

  const save = async () => {
    if (!name.trim()) return
    await saveHighScore({ name: name.trim(), score: state.score, difficulty: state.difficulty, date: new Date().toISOString(), time: state.time })
    setSaved(true); setTop(await getHighScores())
  }

  const t = state.time; const fmt = Math.floor(t/60) > 0 ? `${Math.floor(t/60)}m ${t%60}s` : `${t}s`

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show?'opacity-100':'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className={`relative w-full bg-[#111122] border border-white/[.08] rounded-2xl p-6 overflow-y-auto transition-all duration-400 ${show?'scale-100':'scale-90'}`} style={{ maxWidth: 380, maxHeight: '85dvh' }}>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-5xl mb-2">{win ? '🎉' : '💥'}</div>
          <h2 className={`text-3xl font-black ${win?'text-green-400':'text-red-400'}`}>{win?'¡Victoria!':'¡Boom!'}</h2>
          <p className="text-sm text-white/40 mt-1">{win ? 'Todas las minas desactivadas 🏆' : 'Pisaste una mina 💪'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <MiniStat label="Score" val={state.score.toLocaleString()} cls="text-amber-400" />
          <MiniStat label="Tiempo" val={fmt} />
          <MiniStat label="Nivel" val={DIFFICULTY_CONFIGS[state.difficulty].emoji} big />
        </div>

        <div className="h-px bg-white/[.06] mb-5" />

        {/* Save */}
        {state.score > 0 && !saved && (
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-wider text-white/20 font-bold mb-2">Guardar score</p>
            <div className="flex gap-2">
              <input
                type="text" placeholder="Tu nombre…" value={name}
                onChange={e => setName(e.target.value)} onKeyDown={e => e.key==='Enter' && save()}
                maxLength={15} autoFocus
                className="flex-1 px-3 py-3 rounded-xl bg-white/[.06] border border-white/[.10] text-base placeholder-white/30 focus:outline-none focus:border-violet-400/40 min-h-[44px]"
              />
              <button onClick={save} disabled={!name.trim()} aria-label="Guardar score" className="px-5 py-3 rounded-xl bg-violet-600 font-bold text-base disabled:opacity-20 active:scale-95 transition-all min-h-[44px]">💾</button>
            </div>
          </div>
        )}
        {saved && <p className="text-center text-green-400 text-sm font-semibold mb-4" style={{ animation: 'float-up .3s ease-out' }}>✅ ¡Guardado!</p>}

        {/* Leaderboard */}
        {top.length > 0 && (
          <div className="mb-5 space-y-1 max-h-28 overflow-y-auto">
            {top.slice(0,5).map((s,i) => (
              <div key={i} className="flex justify-between text-sm px-2.5 py-2 rounded-lg bg-white/[.03]">
                <span>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`} {s.name}</span>
                <span className="text-amber-400 font-bold">{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-white/[.06] mb-5" />

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onRestart} className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 active:scale-[.97] transition-transform text-base min-h-[44px]">🔄 Otra vez</button>
          <button onClick={onHome} aria-label="Volver al menú" className="w-14 rounded-xl bg-white/[.06] border border-white/[.10] flex items-center justify-center text-xl active:scale-90 transition-transform min-h-[44px]">🏠</button>
        </div>
        <p className="text-center text-xs text-white/20 mt-3"><kbd className="px-1.5 py-0.5 rounded bg-white/[.06] font-mono text-xs">R</kbd> reiniciar</p>
      </div>
    </div>
  )
}

function MiniStat({ label, val, cls, big }: { label: string; val: string; cls?: string; big?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[.04] border border-white/[.08] py-3 text-center">
      <div className="text-xs uppercase tracking-wider text-white/40 mb-0.5 font-semibold">{label}</div>
      <div className={`font-extrabold tabular-nums ${big?'text-2xl':'text-base'} ${cls||'text-white/90'}`}>{val}</div>
    </div>
  )
}
