import { useEffect, useRef, useState } from 'react'

interface F { id: number; x: number; y: number; value: number; special?: boolean }
let fid = 0

export function useScorePopups() {
  const [floats, setFloats] = useState<F[]>([])
  const addFloat = (x: number, y: number, value: number, special?: boolean) => {
    const id = fid++
    setFloats(p => [...p, { id, x, y, value, special }])
    setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 800)
  }
  return { floats, addFloat }
}

export function ScorePopups({ floats }: { floats: F[] }) {
  if (!floats.length) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
      {floats.map(f => <ScoreFloat key={f.id} {...f} />)}
    </div>
  )
}

function ScoreFloat({ x, y, value, special }: F) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    void el.offsetHeight
    el.style.transform = 'translateY(-40px) scale(1.2)'
    el.style.opacity = '0'
  }, [])
  return (
    <div ref={ref} className={`absolute font-black text-sm ${special ? 'text-amber-400' : 'text-emerald-400'}`}
      style={{ left: x - 12, top: y - 8, transition: 'all .6s ease-out', textShadow: '0 0 8px currentColor' }}>
      +{value}
    </div>
  )
}
