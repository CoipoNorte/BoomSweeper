import { useCallback, useEffect, useRef, useState } from 'react'
import type { Difficulty, GameState, SpecialType } from '../types'
import {
  createInitialState,
  placeMinesAndSpecials,
  revealCell,
  revealAllMines,
  checkWin,
  countFlags,
  calculateScore,
  getDetectorArea,
  getXrayArea,
  getSonarArea,
  defuseMine,
} from '../gameLogic'
import { DIFFICULTY_CONFIGS, FREEZE_DURATION, SCORE_PER_CELL } from '../constants'

export interface GameActions {
  handleCellClick: (row: number, col: number) => { special?: string; cellRect?: DOMRect }
  handleCellRightClick: (row: number, col: number) => void
  handleCellLongPress: (row: number, col: number) => void
  startGame: (difficulty: Difficulty) => void
  restartGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  activatePower: (power: SpecialType) => void
  cancelPower: () => void
}

interface EffectState {
  type: 'detector' | 'sonar' | 'xray'
  cells: [number, number][]
  active: boolean
}

export function useGame() {
  const [state, setState] = useState<GameState>(createInitialState('easy'))
  const [effect, setEffect] = useState<EffectState>({ type: 'detector', cells: [], active: false })
  const [revealedCount, setRevealedCount] = useState(0)
  const [luckyActive, setLuckyActive] = useState(false)
  const [defuseArmed, setDefuseArmed] = useState(false)
  const timerRef = useRef<number>(0)
  const freezeTimerRef = useRef<number>(0)

  // Timer
  useEffect(() => {
    if (state.gameStatus === 'playing' && !state.freezeActive) {
      timerRef.current = window.setInterval(() => {
        setState(prev => ({ ...prev, time: prev.time + 1 }))
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [state.gameStatus, state.freezeActive])

  // Freeze timer countdown
  useEffect(() => {
    if (state.freezeActive && state.gameStatus === 'playing') {
      freezeTimerRef.current = window.setInterval(() => {
        setState(prev => {
          const newFreezeTime = prev.freezeTimeLeft - 1
          if (newFreezeTime <= 0) {
            return { ...prev, freezeActive: false, freezeTimeLeft: 0 }
          }
          return { ...prev, freezeTimeLeft: newFreezeTime }
        })
      }, 1000)
    }
    return () => clearInterval(freezeTimerRef.current)
  }, [state.freezeActive, state.gameStatus])

  const countRevealed = useCallback((board: typeof state.board) => {
    let count = 0
    for (const row of board) {
      for (const cell of row) {
        if (cell.isRevealed && !cell.isMine) count++
      }
    }
    return count
  }, [])

  // ── Activate a power from inventory ──
  const activatePower = useCallback((power: SpecialType) => {
    const info = { detector: 1, sonar: 1, xray: 1, defuse: 1, lucky: 1 }
    if (!(power in info)) return // passive powers don't go to inventory

    setState(prev => {
      const idx = prev.inventory.indexOf(power)
      if (idx === -1) return prev
      const newInv = [...prev.inventory]
      newInv.splice(idx, 1)

      if (power === 'lucky') {
        setLuckyActive(true)
        return { ...prev, inventory: newInv }
      }
      if (power === 'defuse') {
        setDefuseArmed(true)
        return { ...prev, inventory: newInv }
      }
      // detector, sonar, xray → need a click target, set activePower
      return { ...prev, inventory: newInv, activePower: power }
    })
  }, [])

  const cancelPower = useCallback(() => {
    setState(prev => ({ ...prev, activePower: null }))
    setDefuseArmed(false)
    setLuckyActive(false)
    setEffect({ type: 'detector', cells: [], active: false })
  }, [])

  const handleCellClick = useCallback(
    (row: number, col: number): { special?: string } => {
      let returnVal: { special?: string } = {}

      setState(prev => {
        if (prev.gameStatus !== 'idle' && prev.gameStatus !== 'playing') return prev

        let newState = { ...prev }
        let board = prev.board.map(r => r.map(c => ({ ...c })))

        // First click - place mines
        if (prev.firstClick) {
          board = placeMinesAndSpecials(board, prev.difficulty, row, col)
          newState.firstClick = false
          newState.gameStatus = 'playing'
        }

        const cell = board[row][col]

        if (cell.isRevealed || cell.isFlagged) return prev

        // ── Active power consumed on click ──
        if (prev.activePower) {
          const powerType = prev.activePower
          newState.activePower = null

          switch (powerType) {
            case 'detector': {
              const area = getDetectorArea(board, row, col)
              const mines = area.filter(([r, c]) => board[r][c].isMine)
              setEffect({ type: 'detector', cells: mines, active: true })
              setTimeout(() => setEffect({ type: 'detector', cells: [], active: false }), 4000)
              // Also reveal the clicked cell normally
              board = revealCell(board, row, col)
              returnVal = { special: 'detector' }
              break
            }
            case 'sonar': {
              const area = getSonarArea(board, row, col)
              const mines = area.filter(([r, c]) => board[r][c].isMine)
              setEffect({ type: 'sonar', cells: mines, active: true })
              setTimeout(() => setEffect({ type: 'sonar', cells: [], active: false }), 4000)
              board = revealCell(board, row, col)
              returnVal = { special: 'sonar' }
              break
            }
            case 'xray': {
              const area = getXrayArea(board, row, col)
              const mines = area.filter(([r, c]) => board[r][c].isMine)
              setEffect({ type: 'xray', cells: mines, active: true })
              setTimeout(() => setEffect({ type: 'xray', cells: [], active: false }), 3000)
              board = revealCell(board, row, col)
              returnVal = { special: 'xray' }
              break
            }
          }

          // Calculate score for this reveal
          const newRevealed = countRevealed(board)
          const oldRevealed = countRevealed(prev.board)
          const justRevealed = newRevealed - oldRevealed
          const scoreGain = justRevealed * SCORE_PER_CELL

          newState.board = board
          newState.score = prev.score + scoreGain
          newState.combo = justRevealed > 1 ? prev.combo + 1 : 0
          newState.minesLeft = DIFFICULTY_CONFIGS[prev.difficulty].mines - countFlags(board)

          if (checkWin(board)) {
            const winBonus = calculateScore(0, 0, false, newState.time, true, prev.difficulty)
            newState.score += winBonus
            newState.gameStatus = 'won'
            returnVal = { ...returnVal, special: 'win' }
          }
          return newState
        }

        // ── Lucky activation: force safe ──
        if (luckyActive && cell.isMine) {
          const rows = board.length
          const cols = board[0].length
          // Try to move the mine to a random safe cell
          let placed = false
          for (let attempt = 0; attempt < 1000 && !placed; attempt++) {
            const rr = Math.floor(Math.random() * rows)
            const cc = Math.floor(Math.random() * cols)
            if (!board[rr][cc].isMine && !(rr === row && cc === col) && !board[rr][cc].isFlagged) {
              board[row][col].isMine = false
              board[rr][cc].isMine = true
              placed = true
            }
          }
          // Fallback: if no room, just remove the mine entirely
          if (!placed) board[row][col].isMine = false
          // Recalculate adjacency for entire board
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (board[r][c].isMine) continue
              let count = 0
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue
                  const nr = r + dr
                  const nc = c + dc
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) count++
                }
              }
              board[r][c].adjacentMines = count
            }
          }
          setLuckyActive(false)
        }

        // ── Defuse: only works on mines, cancel if safe cell ──
        if (defuseArmed && !cell.isMine) {
          setDefuseArmed(false)
          // Fall through to normal reveal below
        }

        if (cell.isMine) {
          if (defuseArmed) {
            board = defuseMine(board, row, col)
            board = revealCell(board, row, col)
            setDefuseArmed(false)
            returnVal = { special: 'defuse' }

            const newRevealed = countRevealed(board)
            const oldRevealed = countRevealed(prev.board)
            const justRevealed = newRevealed - oldRevealed
            newState.board = board
            newState.score = prev.score + justRevealed * SCORE_PER_CELL
            newState.combo = justRevealed > 1 ? prev.combo + 1 : 0
            newState.minesLeft = DIFFICULTY_CONFIGS[prev.difficulty].mines - countFlags(board)

            if (checkWin(board)) {
              const winBonus = calculateScore(0, 0, false, newState.time, true, prev.difficulty)
              newState.score += winBonus
              newState.gameStatus = 'won'
              returnVal = { ...returnVal, special: 'win' }
            }
            return newState
          }

          // Shield protection
          if (prev.shieldActive) {
            board[row][col].isMine = false
            board[row][col].adjacentMines = 0
            // Recalculate adjacent for neighbors
            const rows = board.length
            const cols = board[0].length
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr
                const nc = col + dc
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc].isMine) {
                  let count = 0
                  for (let ddr = -1; ddr <= 1; ddr++) {
                    for (let ddc = -1; ddc <= 1; ddc++) {
                      if (ddr === 0 && ddc === 0) continue
                      const nnr = nr + ddr
                      const nnc = nc + ddc
                      if (nnr >= 0 && nnr < rows && nnc >= 0 && nnc < cols && board[nnr][nnc].isMine) count++
                    }
                  }
                  board[nr][nc].adjacentMines = count
                }
              }
            }
            board = revealCell(board, row, col)
            returnVal = { special: 'shield_save' }
            newState.shieldActive = false
            newState.minesLeft = prev.minesLeft - 1
          } else {
            // Game Over
            board = revealAllMines(board)
            newState.gameStatus = 'lost'
            returnVal = { special: 'explosion' }
            newState.board = board
            return newState
          }
        } else {
          // Handle passive special tiles (shield, freeze, double)
          const special = cell.special
          if (special !== 'none') {
            returnVal = { special }
          }

          switch (special) {
            case 'shield':
              newState.shieldActive = true
              break
            case 'freeze':
              newState.freezeActive = true
              newState.freezeTimeLeft = FREEZE_DURATION
              break
            case 'double':
              // Handled in score calculation below
              break
            default:
              break
          }

          board = revealCell(board, row, col)

          // Add active specials to inventory
          if (special !== 'none' && special !== 'shield' && special !== 'freeze' && special !== 'double') {
            newState.inventory = [...prev.inventory, special]
          }
        }

        // Calculate new revealed count and score
        const newRevealed = countRevealed(board)
        const oldRevealed = countRevealed(prev.board)
        const justRevealed = newRevealed - oldRevealed
        const isDouble = cell.special === 'double'
        const scoreGain = justRevealed * SCORE_PER_CELL * (isDouble ? 2 : 1)
        const newCombo = justRevealed > 1 ? prev.combo + 1 : 0

        newState.board = board
        newState.score = prev.score + scoreGain + (newCombo * 5)
        newState.combo = newCombo
        newState.minesLeft = DIFFICULTY_CONFIGS[prev.difficulty].mines - countFlags(board)

        // Check win
        if (checkWin(board)) {
          const winBonus = calculateScore(0, 0, false, newState.time, true, prev.difficulty)
          newState.score += winBonus
          newState.gameStatus = 'won'
          returnVal = { ...returnVal, special: returnVal.special || 'win' }
        }

        return newState
      })

      return returnVal
    },
    [countRevealed, luckyActive, defuseArmed]
  )

  const handleCellRightClick = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.gameStatus !== 'playing' && prev.gameStatus !== 'idle') return prev

      const board = prev.board.map(r => r.map(c => ({ ...c })))
      const cell = board[row][col]

      if (cell.isRevealed) return prev

      board[row][col].isFlagged = !cell.isFlagged
      const flags = countFlags(board)

      return {
        ...prev,
        board,
        minesLeft: DIFFICULTY_CONFIGS[prev.difficulty].mines - flags,
      }
    })
  }, [])

  const handleCellLongPress = useCallback((row: number, col: number) => {
    handleCellRightClick(row, col)
  }, [handleCellRightClick])

  const startGame = useCallback((difficulty: Difficulty) => {
    setState(createInitialState(difficulty))
    setEffect({ type: 'detector', cells: [], active: false })
    setLuckyActive(false)
    setDefuseArmed(false)
  }, [])

  const restartGame = useCallback(() => {
    setState(prev => createInitialState(prev.difficulty))
    setEffect({ type: 'detector', cells: [], active: false })
    setLuckyActive(false)
    setDefuseArmed(false)
  }, [])

  const pauseGame = useCallback(() => {
    setState(prev =>
      prev.gameStatus === 'playing' ? { ...prev, gameStatus: 'paused' } : prev
    )
  }, [])

  const resumeGame = useCallback(() => {
    setState(prev =>
      prev.gameStatus === 'paused' ? { ...prev, gameStatus: 'playing' } : prev
    )
  }, [])

  useEffect(() => {
    setRevealedCount(countRevealed(state.board))
  }, [state.board, countRevealed])

  const totalSafeCells =
    DIFFICULTY_CONFIGS[state.difficulty].rows * DIFFICULTY_CONFIGS[state.difficulty].cols -
    DIFFICULTY_CONFIGS[state.difficulty].mines

  return {
    state,
    effect,
    revealedCount,
    totalSafeCells,
    luckyActive,
    defuseArmed,
    actions: {
      handleCellClick,
      handleCellRightClick,
      handleCellLongPress,
      startGame,
      restartGame,
      pauseGame,
      resumeGame,
      activatePower,
      cancelPower,
    },
  }
}
