import { useCallback, useEffect, useRef, useState } from 'react'
import type { Difficulty, GameState } from '../types'
import {
  createInitialState,
  placeMinesAndSpecials,
  revealCell,
  revealArea,
  revealAllMines,
  checkWin,
  countFlags,
  getNeighborMines,
  calculateScore,
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
}

interface XRayState {
  cells: [number, number][]
  active: boolean
}

export function useGame() {
  const [state, setState] = useState<GameState>(createInitialState('easy'))
  const [xray, setXray] = useState<XRayState>({ cells: [], active: false })
  const [revealedCount, setRevealedCount] = useState(0)
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

        // Handle mine click
        if (cell.isMine) {
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
                      if (nnr >= 0 && nnr < rows && nnc >= 0 && nnc < cols && board[nnr][nnc].isMine) {
                        count++
                      }
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
          // Handle special tiles
          const special = cell.special
          if (special !== 'none') {
            returnVal = { special }
          }

          switch (special) {
            case 'shield':
              newState.shieldActive = true
              break
            case 'reveal':
              board = revealArea(board, row, col, 1)
              break
            case 'freeze':
              newState.freezeActive = true
              newState.freezeTimeLeft = FREEZE_DURATION
              break
            case 'xray': {
              const mines = getNeighborMines(board, row, col)
              setXray({ cells: mines, active: true })
              setTimeout(() => setXray({ cells: [], active: false }), 2000)
              break
            }
            case 'double':
              // Handled in score calculation
              break
            default:
              break
          }

          board = revealCell(board, row, col)
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
    [countRevealed]
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

  const startGame = useCallback((difficulty: Difficulty) => {
    setState(createInitialState(difficulty))
    setXray({ cells: [], active: false })
  }, [])

  const restartGame = useCallback(() => {
    setState(prev => createInitialState(prev.difficulty))
    setXray({ cells: [], active: false })
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
    xray,
    revealedCount,
    totalSafeCells,
    actions: {
      handleCellClick,
      handleCellRightClick,
      handleCellLongPress: handleCellRightClick,
      startGame,
      restartGame,
      pauseGame,
      resumeGame,
    },
  }
}
