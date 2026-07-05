import type { Cell, Difficulty, GameState, SpecialType } from './types'
import {
  DIFFICULTY_CONFIGS,
  SCORE_PER_CELL,
  COMBO_MULTIPLIER,
  WIN_TIME_BONUS_FACTOR,
} from './constants'

function getRandomSpecial(): SpecialType {
  const specials: SpecialType[] = ['shield', 'reveal', 'freeze', 'xray', 'lucky', 'double']
  return specials[Math.floor(Math.random() * specials.length)]
}

export function createBoard(difficulty: Difficulty): Cell[][] {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const board: Cell[][] = []

  for (let r = 0; r < config.rows; r++) {
    const row: Cell[] = []
    for (let c = 0; c < config.cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
        special: 'none',
      })
    }
    board.push(row)
  }

  return board
}

export function placeMinesAndSpecials(
  board: Cell[][],
  difficulty: Difficulty,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const config = DIFFICULTY_CONFIGS[difficulty]
  const rows = config.rows
  const cols = config.cols
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))

  // Safe zone around first click (radius 2 = 5x5 area for a satisfying opening)
  const safeZone = new Set<string>()
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const nr = safeRow + dr
      const nc = safeCol + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        safeZone.add(`${nr},${nc}`)
      }
    }
  }

  // Place mines
  let minesPlaced = 0
  while (minesPlaced < config.mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!newBoard[r][c].isMine && !safeZone.has(`${r},${c}`)) {
      newBoard[r][c].isMine = true
      minesPlaced++
    }
  }

  // Calculate adjacent mines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
            count++
          }
        }
      }
      newBoard[r][c].adjacentMines = count
    }
  }

  // Place specials on non-mine, non-zero cells preferably
  let specialsPlaced = 0
  const candidates: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine && !safeZone.has(`${r},${c}`)) {
        candidates.push([r, c])
      }
    }
  }

  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  while (specialsPlaced < config.specials && specialsPlaced < candidates.length) {
    const [r, c] = candidates[specialsPlaced]
    newBoard[r][c].special = getRandomSpecial()
    specialsPlaced++
  }

  // Lucky cells can never be mines (enforce)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].special === 'lucky') {
        newBoard[r][c].isMine = false
      }
    }
  }

  return newBoard
}

export function revealCell(board: Cell[][], row: number, col: number): Cell[][] {
  const rows = board.length
  const cols = board[0].length
  const newBoard = board.map(r => r.map(c => ({ ...c })))

  const stack: [number, number][] = [[row, col]]
  const visited = new Set<string>()

  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    visited.add(key)

    if (r < 0 || r >= rows || c < 0 || c >= cols) continue
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) continue

    newBoard[r][c].isRevealed = true

    if (newBoard[r][c].adjacentMines === 0 && !newBoard[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          stack.push([r + dr, c + dc])
        }
      }
    }
  }

  return newBoard
}

export function revealArea(board: Cell[][], row: number, col: number, radius: number = 1): Cell[][] {
  const rows = board.length
  const cols = board[0].length
  let newBoard = board.map(r => r.map(c => ({ ...c })))

  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (!newBoard[nr][nc].isMine && !newBoard[nr][nc].isFlagged) {
          newBoard[nr][nc].isRevealed = true
          if (newBoard[nr][nc].adjacentMines === 0) {
            newBoard = revealCell(newBoard, nr, nc)
          }
        }
      }
    }
  }

  return newBoard
}

export function revealAllMines(board: Cell[][]): Cell[][] {
  return board.map(row =>
    row.map(cell => ({
      ...cell,
      isRevealed: cell.isMine ? true : cell.isRevealed,
    }))
  )
}

export function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false
    }
  }
  return true
}

export function countFlags(board: Cell[][]): number {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) count++
    }
  }
  return count
}

export function getNeighborMines(board: Cell[][], row: number, col: number): [number, number][] {
  const rows = board.length
  const cols = board[0].length
  const mines: [number, number][] = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
        mines.push([nr, nc])
      }
    }
  }

  return mines
}

export function calculateScore(
  cellsRevealed: number,
  combo: number,
  isDouble: boolean,
  time: number,
  won: boolean,
  difficulty: Difficulty
): number {
  let base = cellsRevealed * SCORE_PER_CELL
  base *= Math.pow(COMBO_MULTIPLIER, Math.min(combo, 10))
  if (isDouble) base *= 2

  if (won) {
    const config = DIFFICULTY_CONFIGS[difficulty]
    const maxTime = config.rows * config.cols * 2
    const timeBonus = Math.max(0, (maxTime - time) * WIN_TIME_BONUS_FACTOR)
    base += timeBonus
    // Difficulty multiplier
    if (difficulty === 'medium') base *= 1.5
    if (difficulty === 'hard') base *= 2.5
  }

  return Math.floor(base)
}

export function createInitialState(difficulty: Difficulty): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty]
  return {
    board: createBoard(difficulty),
    gameStatus: 'idle',
    minesLeft: config.mines,
    time: 0,
    score: 0,
    combo: 0,
    shieldActive: false,
    freezeActive: false,
    freezeTimeLeft: 0,
    difficulty,
    firstClick: true,
  }
}
