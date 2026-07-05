import { useMemo, useRef, useCallback, forwardRef } from 'react'
import type { Cell } from '../types'
import { CellComponent } from './CellComponent'

interface Props {
  board: Cell[][]; xrayCells: [number, number][]; flagMode: boolean
  effectType: 'detector' | 'sonar' | 'xray' | null
  onCellClick: (r: number, c: number) => void
  onCellRightClick: (r: number, c: number) => void
  onCellLongPress: (r: number, c: number) => void
  gameOver: boolean; shieldActive: boolean; cellSize: number
  shakeOffset: { x: number; y: number }
  defuseArmed: boolean; luckyActive: boolean
}

export const Board = forwardRef<HTMLDivElement, Props>(function Board({ board, xrayCells, flagMode, effectType, onCellClick, onCellRightClick, onCellLongPress, gameOver, shieldActive, cellSize, shakeOffset, defuseArmed, luckyActive }: Props, forwardedRef) {
  const localRef = useRef<HTMLDivElement>(null)
  const ref = forwardedRef || localRef
  const xset = useMemo(() => new Set(xrayCells.map(([r,c]) => `${r},${c}`)), [xrayCells])
  const click = useCallback((r:number,c:number) => onCellClick(r,c), [onCellClick])

  return (
    <div
      ref={ref}
      className="inline-block rounded-xl"
      onContextMenu={useCallback((e: React.MouseEvent) => e.preventDefault(), [])}
      style={{
        padding: 6,
        background: 'rgba(255,255,255,.025)',
        border: '1px solid rgba(255,255,255,.05)',
        transform: `translate(${shakeOffset.x}px,${shakeOffset.y}px)`,
        touchAction: 'manipulation',
      }}
    >
      <div className="grid" style={{
        gridTemplateColumns: `repeat(${board[0]?.length || 0},${cellSize}px)`,
        gridTemplateRows: `repeat(${board.length},${cellSize}px)`,
        gap: 2,
      }}>
        {board.flat().map(cell => (
          <CellComponent
            key={`${cell.row}-${cell.col}`}
            cell={cell} cellSize={cellSize} isXray={xset.has(`${cell.row},${cell.col}`)}
            effectType={effectType}
            flagMode={flagMode} onClick={click} onRightClick={onCellRightClick}
            onLongPress={onCellLongPress} gameOver={gameOver} shieldActive={shieldActive}
            defuseArmed={defuseArmed} luckyActive={luckyActive}
          />
        ))}
      </div>
    </div>
  )
})
