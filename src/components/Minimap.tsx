import { useCallback, useRef, useState, useEffect } from 'react'
import type { Cell } from '../types'

interface Props {
  board: Cell[][]
  scrollContainer: React.RefObject<HTMLDivElement | null>
}

const CELL = 4
const MAX_W = 280
const MAX_H = 60

export function Minimap({ board, scrollContainer }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState({ x: 0, y: 0, w: 0, h: 0, show: false })

  const rows = board.length
  const cols = board[0]?.length || 0
  const gridW = cols * CELL
  const gridH = rows * CELL
  const scale = Math.min(MAX_W / gridW, MAX_H / gridH, 1)
  const dw = gridW * scale
  const dh = gridH * scale

  useEffect(() => {
    const c = scrollContainer.current
    if (!c) return
    const update = () => {
      const { scrollLeft, scrollTop, clientWidth, clientHeight, scrollWidth, scrollHeight } = c
      if (scrollWidth <= clientWidth + 4 && scrollHeight <= clientHeight + 4) {
        setVp(v => v.show ? { x: 0, y: 0, w: 0, h: 0, show: false } : v)
        return
      }
      const sx = dw / scrollWidth
      const sy = dh / scrollHeight
      setVp({
        x: scrollLeft * sx,
        y: scrollTop * sy,
        w: Math.min(clientWidth * sx, dw),
        h: Math.min(clientHeight * sy, dh),
        show: true,
      })
    }
    update()
    c.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(c)
    return () => { c.removeEventListener('scroll', update); ro.disconnect() }
  }, [scrollContainer, dw, dh, board])

  const pan = useCallback((cx: number, cy: number) => {
    const c = scrollContainer.current
    const el = ref.current
    if (!c || !el) return
    const r = el.getBoundingClientRect()
    const x = cx - r.left
    const y = cy - r.top
    c.scrollTo({
      left: Math.max(0, Math.min((x / dw) * c.scrollWidth - c.clientWidth / 2, c.scrollWidth - c.clientWidth)),
      top: Math.max(0, Math.min((y / dh) * c.scrollHeight - c.clientHeight / 2, c.scrollHeight - c.clientHeight)),
    })
  }, [scrollContainer, dw, dh])

  if (!vp.show) return null

  return (
    <div className="flex-shrink-0 px-3 py-1.5 sm:hidden">
      <div
        ref={ref}
        className="relative mx-auto rounded-lg border border-white/10 bg-black/30 overflow-hidden"
        style={{ width: dw, height: dh }}
        onTouchStart={e => { e.stopPropagation(); pan(e.touches[0].clientX, e.touches[0].clientY) }}
        onTouchMove={e => { e.preventDefault(); e.stopPropagation(); pan(e.touches[0].clientX, e.touches[0].clientY) }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL * scale}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL * scale}px)`,
          gap: 0,
        }}>
          {board.flat().map(c => (
            <div key={`${c.row}-${c.col}`} style={{
              background: c.isRevealed
                ? c.isMine ? '#ef444480' : '#ffffff08'
                : c.isFlagged ? '#f9731680' : '#ffffff12',
            }} />
          ))}
        </div>
        <div
          className="absolute border border-violet-400/50 rounded-sm pointer-events-none"
          style={{
            left: vp.x,
            top: vp.y,
            width: vp.w,
            height: vp.h,
            background: 'rgba(139,92,246,.1)',
            boxShadow: '0 0 0 1px rgba(139,92,246,.2)',
          }}
        />
      </div>
    </div>
  )
}
