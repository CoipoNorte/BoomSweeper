export type SpecialType =
  | 'none'
  | 'shield'    // Protects from one mine click
  | 'reveal'    // Reveals a 3x3 area safely
  | 'freeze'    // Freezes timer for 10 seconds
  | 'xray'      // Shows mines in adjacent cells briefly
  | 'lucky'     // Guaranteed safe - never a mine
  | 'double'    // Double points for this reveal

export interface Cell {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
  special: SpecialType
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
  specials: number
  label: string
  emoji: string
}

export interface GameState {
  board: Cell[][]
  gameStatus: 'idle' | 'playing' | 'paused' | 'won' | 'lost'
  minesLeft: number
  time: number
  score: number
  combo: number
  shieldActive: boolean
  freezeActive: boolean
  freezeTimeLeft: number
  difficulty: Difficulty
  firstClick: boolean
}

export interface HighScore {
  name: string
  score: number
  difficulty: Difficulty
  date: string
  time: number
}

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  emoji?: string
}
