import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { Difficulty, SpecialType } from './types'
import { DIFFICULTY_CONFIGS, SPECIAL_INFO } from './constants'
import { useGame } from './hooks/useGame'
import { useParticles } from './hooks/useParticles'
import { useScreenShake } from './hooks/useScreenShake'
import { useSound } from './hooks/useSound'
import { StartScreen } from './components/StartScreen'
import { Board } from './components/Board'
import { GameHeader } from './components/GameHeader'
import { GameOverModal } from './components/GameOverModal'
import { PauseModal } from './components/PauseModal'
import { ParticleLayer } from './components/ParticleLayer'
import { SpecialToast } from './components/SpecialToast'
import { ScorePopups, useScorePopups } from './components/ScorePopup'
import { Minimap } from './components/Minimap'
import { PowerBar } from './components/PowerBar'

function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu')
  const [toast, setToast] = useState<string | null>(null)
  const [flagMode, setFlagMode] = useState(false)
  const [win, setWin] = useState({ w: innerWidth, h: innerHeight })
  const boardRef = useRef<HTMLDivElement>(null)

  // Track resize
  useEffect(() => {
    let t: number
    const fn = () => { clearTimeout(t); t = window.setTimeout(() => setWin({ w: innerWidth, h: innerHeight }), 120) }
    addEventListener('resize', fn); return () => { removeEventListener('resize', fn); clearTimeout(t) }
  }, [])

  const { state, effect, revealedCount, totalSafeCells, luckyActive, defuseArmed, actions } = useGame()
  const { particles, spawnExplosion, spawnSuccess, spawnSpecial, spawnWin } = useParticles()
  const { offset, shake } = useScreenShake()
  const snd = useSound()
  const { floats, addFloat } = useScorePopups()

  // ── Cell size ──
  const mobile = win.w < 640
  const cellSize = useMemo(() => {
    if (screen !== 'game') return 30
    const cfg = DIFFICULTY_CONFIGS[state.difficulty]
    const gap = 2

    if (mobile) {
      // Mobile: fixed size for zoom/scroll + minimap
      return 28
    }

    // Desktop: try to fit, but allow scroll if needed (min 24px for usability)
    const px = 24
    const hdr = 80
    const bp = 6

    const availW = win.w - px * 2 - bp * 2 - gap * (cfg.cols - 1)
    const availH = win.h - hdr - px - bp * 2 - gap * (cfg.rows - 1)

    const cw = Math.floor(availW / cfg.cols)
    const ch = Math.floor(availH / cfg.rows)
    return Math.max(Math.min(cw, ch, 48), 24)
  }, [state.difficulty, screen, win, mobile])

  // ── Keyboard ──
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { state.gameStatus === 'playing' ? actions.pauseGame() : state.gameStatus === 'paused' && actions.resumeGame() }
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) { (state.gameStatus === 'lost' || state.gameStatus === 'won') && actions.restartGame() }
      if (e.key === 'f' || e.key === 'F') setFlagMode(p => !p)
    }
    addEventListener('keydown', fn); return () => removeEventListener('keydown', fn)
  }, [state.gameStatus, actions])

  const start = useCallback((d: Difficulty) => { actions.startGame(d); setFlagMode(false); setScreen('game') }, [actions])
  const home = useCallback(() => { setScreen('menu'); setFlagMode(false) }, [])

  const cellXY = useCallback((r: number, c: number) => {
    const g = boardRef.current?.querySelector('.grid')
    if (!g) return { x: win.w / 2, y: win.h / 2 }
    const el = g.children[r * DIFFICULTY_CONFIGS[state.difficulty].cols + c]
    if (!el) return { x: win.w / 2, y: win.h / 2 }
    const b = el.getBoundingClientRect()
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 }
  }, [state.difficulty, win])

  const onCell = useCallback((r: number, c: number) => {
    const res = actions.handleCellClick(r, c)
    const p = cellXY(r, c)
    if (res.special === 'explosion') { spawnExplosion(p.x, p.y); shake(14, 400); snd.playExplosion(); return }
    if (res.special === 'win') { spawnWin(p.x, p.y); setTimeout(() => spawnWin(win.w/2, win.h/2), 200); snd.playWin(); return }
    if (res.special === 'shield_save') { spawnSpecial(p.x, p.y, '🛡️'); shake(5, 200); snd.playSpecial(); setToast('shield'); return }
    if (res.special === 'defuse') { spawnSpecial(p.x, p.y, '💚'); shake(3, 150); snd.playSpecial(); setToast('defuse'); return }
    if (res.special === 'detector') { spawnSpecial(p.x, p.y, '🔍'); snd.playSpecial(); setToast('detector'); return }
    if (res.special === 'sonar') { spawnSpecial(p.x, p.y, '📡'); snd.playSpecial(); setToast('sonar'); return }
    if (res.special === 'xray') { spawnSpecial(p.x, p.y, '🔬'); snd.playSpecial(); setToast('xray'); return }
    if (res.special === 'lucky') { spawnSpecial(p.x, p.y, '🍀'); snd.playSpecial(); setToast('lucky'); return }
    if (res.special && res.special !== 'none') {
      const em: Record<string,string> = { shield:'🛡️', freeze:'❄️', double:'⚡' }
      spawnSpecial(p.x, p.y, em[res.special]||'✨'); snd.playSpecial(); setToast(res.special)
      addFloat(p.x, p.y-10, res.special==='double'?20:10, true)
    } else { spawnSuccess(p.x, p.y); snd.playReveal(); addFloat(p.x, p.y-10, 10) }
  }, [actions, cellXY, spawnExplosion, spawnSuccess, spawnSpecial, spawnWin, shake, snd, addFloat, win])

  const onFlag = useCallback((r:number,c:number) => { actions.handleCellRightClick(r,c); snd.playFlag() }, [actions, snd])
  const onLong = useCallback((r:number,c:number) => { actions.handleCellLongPress(r,c); snd.playFlag() }, [actions, snd])

  // ════════════ MENU ════════════
  if (screen === 'menu') return <StartScreen onStart={start} />

  // ════════════ GAME ════════════
  const over = state.gameStatus === 'won' || state.gameStatus === 'lost'

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden" style={{ background: '#0d0d1a' }}>
      <ParticleLayer particles={particles} />
      <ScorePopups floats={floats} />
      {toast && <SpecialToast specialType={toast} onDone={() => setToast(null)} />}

      {/* HEADER — fixed at top with comfortable padding */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1 sm:px-6 sm:pt-4 sm:pb-2">
        <GameHeader
          state={state} revealedCount={revealedCount} totalSafeCells={totalSafeCells}
          flagMode={flagMode} onToggleFlag={() => setFlagMode(f => !f)}
          onPause={actions.pauseGame} onRestart={actions.restartGame} onHome={home}
        />
      </div>

      {/* BOARD — centered when fits, scrollable when overflows */}
      <div
        ref={boardRef}
        className={`flex-1 overflow-auto transition-all duration-300 ${
          state.gameStatus === 'paused' ? 'blur-lg scale-95 pointer-events-none' : ''
        }`}
        style={{ WebkitOverflowScrolling: 'touch', padding: 12 } as React.CSSProperties}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'max-content',
          minWidth: '100%',
          minHeight: '100%',
        }}>
          {state.gameStatus === 'idle' && (
            <p className="text-white/15 text-xs mb-2 animate-pulse select-none">👆 Toca cualquier casilla</p>
          )}
          <Board
            board={state.board} xrayCells={effect.cells} flagMode={flagMode}
            effectType={effect.active ? effect.type : null}
            onCellClick={onCell} onCellRightClick={onFlag} onCellLongPress={onLong}
            gameOver={over} shieldActive={state.shieldActive} cellSize={cellSize} shakeOffset={offset}
            defuseArmed={defuseArmed} luckyActive={luckyActive}
          />
        </div>
      </div>

      {/* MINIMAP — shows when board overflows on any screen */}
      <Minimap board={state.board} scrollContainer={boardRef} />

      {/* POWER BAR — mobile inventory */}
      {mobile && (
        <PowerBar
          inventory={state.inventory}
          activePower={state.activePower}
          onActivate={actions.activatePower}
          onCancel={actions.cancelPower}
        />
      )}

      {/* DESKTOP POWER BAR */}
      {!mobile && (state.inventory.length > 0 || state.activePower) && (
        <div className="flex-shrink-0 px-3 py-2 sm:px-6 flex items-center justify-center gap-2">
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider mr-2">Poder:</span>
          {(() => {
            const counts = new Map<string, number>()
            for (const p of state.inventory) counts.set(p, (counts.get(p) || 0) + 1)
            return Array.from(counts.keys()).map(power => {
              const info = SPECIAL_INFO[power]
              if (!info) return null
              const count = counts.get(power) || 1
              return (
                <button
                  key={power}
                  onClick={() => actions.activatePower(power as SpecialType)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                  style={{ background: `${info.color}15`, border: `1px solid ${info.color}30`, color: info.color }}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                  {count > 1 && <span className="text-[9px] opacity-60">×{count}</span>}
                </button>
              )
            })
          })()}
          {state.activePower && (
            <button onClick={actions.cancelPower} className="text-xs text-white/40 ml-2">✕</button>
          )}
        </div>
      )}

      {/* MODALS */}
      {state.gameStatus === 'paused' && <PauseModal onResume={actions.resumeGame} onRestart={actions.restartGame} onHome={home} />}
      {over && <GameOverModal state={state} onRestart={actions.restartGame} onHome={home} />}
    </div>
  )
}

export default App
