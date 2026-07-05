export type SpecialType =
  | 'none'
  | 'shield'     // [Passive] Survives one mine click
  | 'detector'   // [Active] Shows mines in 5×3 horizontal area for 4s
  | 'sonar'      // [Active] Reveals entire row + column for 4s
  | 'defuse'     // [Active] Safely neutralize a mine you clicked
  | 'freeze'     // [Passive] Freezes timer for 10 seconds
  | 'xray'       // [Active] Shows mines in 5×5 area for 3s
  | 'lucky'      // [Active] Next reveal guaranteed safe
  | 'double'     // [Passive] ×2 points for this reveal

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
  inventory: SpecialType[]
  activePower: SpecialType | null
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
