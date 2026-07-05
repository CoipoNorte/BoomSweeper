import { useCallback, useRef, useState } from 'react'

export function useScreenShake() {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const frameRef = useRef<number>(0)

  const shake = useCallback((intensity: number = 8, duration: number = 300) => {
    const start = performance.now()

    const animate = (time: number) => {
      const elapsed = time - start
      const progress = elapsed / duration

      if (progress >= 1) {
        setOffset({ x: 0, y: 0 })
        frameRef.current = 0
        return
      }

      const decay = 1 - progress
      const x = (Math.random() - 0.5) * intensity * decay * 2
      const y = (Math.random() - 0.5) * intensity * decay * 2
      setOffset({ x, y })
      frameRef.current = requestAnimationFrame(animate)
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(animate)
  }, [])

  return { offset, shake }
}
