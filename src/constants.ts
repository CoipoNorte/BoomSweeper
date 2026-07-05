import type { Difficulty, DifficultyConfig } from './types'

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    rows: 9,
    cols: 9,
    mines: 10,
    specials: 6,
    label: 'Chill',
    emoji: '😎',
  },
  medium: {
    rows: 14,
    cols: 14,
    mines: 35,
    specials: 10,
    label: 'Vibey',
    emoji: '🔥',
  },
  hard: {
    rows: 16,
    cols: 20,
    mines: 70,
    specials: 14,
    label: 'No Cap',
    emoji: '💀',
  },
}

export const SPECIAL_INFO: Record<string, { emoji: string; label: string; color: string; description: string; type: 'passive' | 'active' }> = {
  shield: {
    emoji: '🛡️',
    label: 'Escudo',
    color: '#a78bfa',
    description: '¡Sobrevives a una mina!',
    type: 'passive',
  },
  detector: {
    emoji: '🔍',
    label: 'Detector',
    color: '#fbbf24',
    description: 'Muestra minas en 5×3 por 4s',
    type: 'active',
  },
  sonar: {
    emoji: '📡',
    label: 'Sonar',
    color: '#38bdf8',
    description: 'Revela fila + columna por 4s',
    type: 'active',
  },
  defuse: {
    emoji: '💚',
    label: 'Desactivar',
    color: '#4ade80',
    description: 'Neutraliza un mina al tocar',
    type: 'active',
  },
  freeze: {
    emoji: '❄️',
    label: 'Freeze',
    color: '#67e8f9',
    description: 'Congela el timer 10s',
    type: 'passive',
  },
  xray: {
    emoji: '🔬',
    label: 'Rayos X',
    color: '#c084fc',
    description: 'Muestra minas en 5×5 por 3s',
    type: 'active',
  },
  lucky: {
    emoji: '🍀',
    label: 'Suerte',
    color: '#86efac',
    description: 'Próxima celda segura garantizada',
    type: 'active',
  },
  double: {
    emoji: '⚡',
    label: 'Doble',
    color: '#fb923c',
    description: '×2 puntos en esta casilla',
    type: 'passive',
  },
}

export const NUMBER_COLORS: Record<number, string> = {
  1: '#93a5f8',
  2: '#5eead4',
  3: '#fca5a5',
  4: '#c4b5fd',
  5: '#fdba74',
  6: '#67e8f9',
  7: '#f1f5f9',
  8: '#cbd5e1',
}

export const SCORE_PER_CELL = 10
export const COMBO_MULTIPLIER = 1.5
export const MINE_FLAG_BONUS = 25
export const WIN_TIME_BONUS_FACTOR = 5
export const FREEZE_DURATION = 10
