import { memo, useCallback, useRef } from 'react'
import type { Cell } from '../types'
import { SPECIAL_INFO, NUMBER_COLORS } from '../constants'

interface Props {
  cell: Cell; cellSize: number; isXray: boolean; effectType: 'detector' | 'sonar' | 'xray' | null
  flagMode: boolean; defuseArmed: boolean; luckyActive: boolean
  onClick: (r: number, c: number) => void
  onRightClick: (r: number, c: number) => void
  onLongPress: (r: number, c: number) => void
  gameOver: boolean; shieldActive: boolean
}

export const CellComponent = memo(function CellComponent({
  cell, cellSize, isXray, effectType, flagMode, defuseArmed, luckyActive,
  onClick, onRightClick, onLongPress, gameOver, shieldActive,
}: Props) {
  const longPressTimer = useRef<number | null>(null)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const gestureMoved = useRef(false)
  const longPressTriggered = useRef(false)
  const touchLocked = useRef(false)
  const suppressClick = useRef(false)

  const fs = Math.max(12, cellSize * 0.45)
  const sp = cell.special !== 'none' ? SPECIAL_INFO[cell.special] : null

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const resetGesture = useCallback(() => {
    clearLongPress()
    gestureMoved.current = false
    longPressTriggered.current = false
  }, [clearLongPress])

  const handleAction = useCallback(() => {
    if (flagMode && !cell.isRevealed) {
      onRightClick(cell.row, cell.col)
    } else {
      onClick(cell.row, cell.col)
    }
  }, [cell.isRevealed, cell.row, cell.col, flagMode, onClick, onRightClick])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (gameOver) return
    e.preventDefault()
    suppressClick.current = true
    touchLocked.current = false
    gestureMoved.current = false
    longPressTriggered.current = false
    const t = e.touches[0]
    touchStartPos.current = { x: t.clientX, y: t.clientY }
    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      touchLocked.current = true
      onLongPress(cell.row, cell.col)
      navigator.vibrate?.(20)
    }, 380)
  }, [cell.row, cell.col, clearLongPress, gameOver, onLongPress])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    if (!e.touches.length) return
    const t = e.touches[0]
    const dx = t.clientX - touchStartPos.current.x
    const dy = t.clientY - touchStartPos.current.y
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      gestureMoved.current = true
      clearLongPress()
    }
  }, [clearLongPress])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault()
    clearLongPress()
    if (longPressTriggered.current) {
      resetGesture()
      return
    }
    if (!gestureMoved.current) {
      handleAction()
    }
    resetGesture()
  }, [clearLongPress, handleAction, resetGesture])

  const handleTouchCancel = useCallback(() => {
    clearLongPress()
    resetGesture()
  }, [clearLongPress, resetGesture])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (suppressClick.current || touchLocked.current) {
      suppressClick.current = false
      touchLocked.current = false
      return
    }
    handleAction()
  }, [handleAction])

  // Determine visuals
  let bg = ''
  let content: React.ReactNode = null
  let anim = ''

  if (cell.isRevealed) {
    if (cell.isMine) {
      bg = 'bg-red-500/50'
      content = '💣'
      anim = 'mine-pop .3s ease-out'
    } else if (sp) {
      bg = 'bg-white/[.04]'
      content = (
        <div className="flex flex-col items-center leading-none">
          <span style={{ fontSize: fs * 0.7 }}>{sp.emoji}</span>
          {cell.adjacentMines > 0 && (
            <span style={{ color: NUMBER_COLORS[cell.adjacentMines], fontSize: fs * 0.5, fontWeight: 800 }}>{cell.adjacentMines}</span>
          )}
        </div>
      )
    } else if (cell.adjacentMines > 0) {
      bg = 'bg-white/[.03]'
      content = <span style={{ color: NUMBER_COLORS[cell.adjacentMines], fontWeight: 800 }}>{cell.adjacentMines}</span>
    } else {
      bg = 'bg-white/[.015]'
    }
  } else if (cell.isFlagged) {
    bg = 'bg-orange-500/10 border-orange-400/20'
    content = '🚩'
  } else if (isXray) {
    const effectColor = effectType === 'sonar' ? 'bg-sky-500/20 border-sky-400/30'
      : effectType === 'detector' ? 'bg-amber-500/20 border-amber-400/30'
      : 'bg-purple-500/20 border-purple-400/30'
    bg = effectColor
    content = '💣'
    anim = 'xray-blink .5s ease-in-out infinite'
  } else {
    bg = shieldActive
      ? 'bg-violet-500/10 border-violet-400/15 hover:bg-violet-500/20'
      : 'bg-white/[.05] border-white/[.07] hover:bg-violet-500/10'

    if (defuseArmed && !cell.isRevealed) {
      bg = 'bg-emerald-500/15 border-emerald-400/25 hover:bg-emerald-500/25'
      anim = 'power-pulse 1.5s ease-in-out infinite'
    }

    if (luckyActive && !cell.isRevealed) {
      bg = 'bg-lime-500/15 border-lime-400/25 hover:bg-lime-500/25'
      anim = 'power-pulse 1.5s ease-in-out infinite'
    }

    if (sp && !gameOver) bg += ' cell-shimmer'
  }

  const showPowerBorder = !cell.isRevealed && !gameOver && (
    (defuseArmed && !cell.isFlagged) || (luckyActive && !cell.isFlagged)
  )

  return (
    <button
      type="button"
      aria-label={cell.isRevealed ? (cell.isMine ? 'Mina' : cell.adjacentMines > 0 ? `${cell.adjacentMines} minas alrededor` : 'Vacía') : cell.isFlagged ? 'Casilla con bandera' : 'Casilla oculta'}
      className={`relative flex items-center justify-center border rounded select-none transition-colors duration-75 ${bg} ${!cell.isRevealed && !gameOver ? 'active:scale-[.85]' : ''}`}
      style={{ width: cellSize, height: cellSize, fontSize: fs, animation: anim || undefined }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleClick}
      onContextMenu={useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        onRightClick(cell.row, cell.col)
      }, [cell.row, cell.col, onRightClick])}
      disabled={gameOver}
    >
      {typeof content === 'string' ? <span style={{ fontSize: fs }}>{content}</span> : content}
      {cell.isRevealed && !cell.isMine && (
        <div className="absolute inset-0 rounded bg-white/10 pointer-events-none" style={{ animation: 'cell-flash .3s ease-out forwards' }} />
      )}
      {showPowerBorder && (
        <div className="absolute inset-[-2px] rounded border-2 pointer-events-none"
          style={{
            borderColor: defuseArmed ? '#4ade80' : '#a3e635',
            animation: 'power-ring-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </button>
  )
})
