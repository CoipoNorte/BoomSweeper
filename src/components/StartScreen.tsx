import { useState, useEffect } from 'react'
import type { Difficulty, HighScore } from '../types'
import { DIFFICULTY_CONFIGS, SPECIAL_INFO } from '../constants'
import { getHighScores, clearHighScores } from '../storage'

export function StartScreen({ onStart }: { onStart: (d: Difficulty) => void }) {
  const [diff, setDiff] = useState<Difficulty>('easy')
  const [scores, setScores] = useState<HighScore[]>([])
  const [modal, setModal] = useState<null | 'help' | 'scores'>(null)

  useEffect(() => { getHighScores().then(setScores) }, [])

  return (
    <div className="h-full overflow-y-auto">
    <div className="min-h-full flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[380px] px-2 sm:px-0">

        {/* ── Logo ── */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="text-5xl sm:text-7xl mb-3 sm:mb-4" style={{ animation: 'bounce-logo 2.5s ease-in-out infinite' }}>💣</div>
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent leading-tight">
            BoomSweeper
          </h1>
          <p className="text-white/50 text-sm sm:text-base mt-2 sm:mt-3">Buscaminas con poderes ✨</p>
        </div>

        {/* ── Difficulty ── */}
        <div className="rounded-2xl bg-white/[.03] border border-white/[.06] p-3 sm:p-5 mb-4 sm:mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Dificultad</p>
          <div className="space-y-3">
            {(['easy','medium','hard'] as Difficulty[]).map(d => {
              const c = DIFFICULTY_CONFIGS[d]
              const on = diff === d
              return (
                <button
                  key={d}
                  onClick={() => setDiff(d)}
                  className={`w-full flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 transition-all text-left
                    ${on ? 'bg-violet-500/15 ring-2 ring-violet-400/50' : 'bg-white/[.02] hover:bg-white/[.04]'}`}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold">{c.label}</div>
                    <div className="text-sm text-white/50 mt-0.5">{c.rows}×{c.cols} · 💣 {c.mines} · ✨ {c.specials}</div>
                  </div>
                  {on && <span className="text-violet-400 font-bold text-xl">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Play ── */}
        <button
          onClick={() => onStart(diff)}
          className="w-full py-3.5 sm:py-4 mb-4 sm:mb-5 rounded-2xl text-base sm:text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-700/30 active:scale-[.97] transition-transform"
          aria-label="Iniciar partida"
        >
          Jugar 🎮
        </button>

        {/* ── Links ── */}
        <div className="flex gap-3">
          <button onClick={() => setModal('help')}   className="flex-1 py-3.5 sm:py-4 rounded-xl bg-white/[.06] border border-white/[.10] text-sm sm:text-base font-semibold text-white/60 active:scale-[.97] transition-transform">📖 Cómo jugar</button>
          <button onClick={() => { setModal('scores'); getHighScores().then(setScores) }} className="flex-1 py-3.5 sm:py-4 rounded-xl bg-white/[.06] border border-white/[.10] text-sm sm:text-base font-semibold text-white/60 active:scale-[.97] transition-transform">🏆 Records</button>
        </div>
      </div>

      {/* ══════ HELP MODAL ══════ */}
      {modal === 'help' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-xl font-bold mb-1">📖 Cómo jugar</h2>
          <p className="text-xs text-white/25 mb-5">Todo lo que necesitas saber</p>

          <Section title="🎯 Objetivo" color="text-violet-300">
            Revela todas las casillas sin pisar una mina 💣. Los números te dicen cuántas minas rodean cada casilla.
          </Section>

          <Section title="🎮 Controles" color="text-pink-300">
            <div className="flex gap-3 mt-2">
              <div className="flex-1 rounded-xl bg-white/[.03] p-3 text-center">
                <div className="text-lg mb-1">📱</div>
                <p className="text-xs text-white/50"><b className="text-white/70">Tap</b> = Revelar</p>
                <p className="text-xs text-white/50"><b className="text-white/70">Mantener</b> = 🚩</p>
              </div>
              <div className="flex-1 rounded-xl bg-white/[.03] p-3 text-center">
                <div className="text-lg mb-1">🖥️</div>
                <p className="text-xs text-white/50"><b className="text-white/70">Click</b> = Revelar</p>
                <p className="text-xs text-white/50"><b className="text-white/70">Clic der.</b> = 🚩</p>
              </div>
            </div>
          </Section>

          <Section title="✨ Poderes especiales" color="text-amber-300">
            <p className="text-sm text-white/40 mb-2">Algunas casillas brillan. Al revelarlas obtienes:</p>
            <div className="space-y-1.5">
              {Object.entries(SPECIAL_INFO).map(([k,v]) => (
                <div key={k} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: v.color + '0a' }}>
                  <span className="text-lg">{v.emoji}</span>
                  <span className="text-sm"><b style={{color:v.color}}>{v.label}</b> — <span className="text-white/50">{v.description}</span></span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="💰 Puntos" color="text-green-300">
            <ul className="text-sm text-white/50 space-y-1.5 list-disc list-inside">
              <li>+10 pts por casilla revelada</li>
              <li>Combos al revelar muchas de golpe</li>
              <li>Bonus por velocidad al ganar</li>
              <li>×1.5 / ×2.5 según dificultad</li>
            </ul>
          </Section>

          <button onClick={() => setModal(null)} className="w-full mt-4 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 active:scale-[.97] transition-transform">
            ¡Entendido! 👍
          </button>
        </Modal>
      )}

      {/* ══════ SCORES MODAL ══════ */}
      {modal === 'scores' && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-xl font-bold mb-5">🏆 Records</h2>
          {scores.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🕹️</div>
              <p className="text-white/20 text-sm">Aún no hay records</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[55vh] overflow-y-auto mb-4">
              {scores.slice(0,15).map((s,i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-white/[.025]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center text-sm">{i===0?'🥇':i===1?'🥈':i===2?'🥉':<span className="text-white/15 text-xs">{i+1}</span>}</span>
                    <span className="font-semibold text-sm">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-amber-400 text-sm">{s.score.toLocaleString()}</div>
                    <div className="text-[10px] text-white/15">{DIFFICULTY_CONFIGS[s.difficulty].emoji} {s.time}s</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-white/[.04] border border-white/[.06] text-sm font-semibold text-white/40 active:scale-[.97] transition-transform">← Volver</button>
            {scores.length > 0 && (
              <button onClick={async () => { await clearHighScores(); setScores([]) }} className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-semibold active:scale-[.97] transition-transform">🗑️</button>
            )}
          </div>
        </Modal>
      )}
    </div>
    </div>
  )
}

/* ── Reusable modal shell ── */
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'float-up .2s ease-out' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-[#111122] border border-white/[.08] rounded-2xl p-6 overflow-y-auto" style={{ maxWidth: 400, maxHeight: '85dvh' }}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[.05] flex items-center justify-center text-white/30 hover:bg-white/10 text-sm">✕</button>
        {children}
      </div>
    </div>
  )
}

/* ── Section in tutorial ── */
function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="h-px bg-white/[.06] mb-5" />
      <h3 className={`text-sm font-bold ${color} mb-2`}>{title}</h3>
      <div>{typeof children === 'string' ? <p className="text-xs text-white/40 leading-relaxed">{children}</p> : children}</div>
    </div>
  )
}
