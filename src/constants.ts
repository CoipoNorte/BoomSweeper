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

export const SPECIAL_INFO: Record<string, { emoji: string; label: string; color: string; description: string }> = {
  shield: {
    emoji: '🛡️',
    label: 'Escudo',
    color: '#a78bfa',
    description: '¡Sobrevives a una mina!',
  },
  reveal: {
    emoji: '👁️',
    label: 'Visión',
    color: '#c084fc',
    description: 'Revela un área de 3×3',
  },
  freeze: {
    emoji: '❄️',
    label: 'Freeze',
    color: '#67e8f9',
    description: 'Congela el timer 10s',
  },
  xray: {
    emoji: '🔍',
    label: 'X-Ray',
    color: '#fbbf24',
    description: 'Muestra minas cercanas',
  },
  lucky: {
    emoji: '🍀',
    label: 'Suerte',
    color: '#4ade80',
    description: '¡Siempre es segura!',
  },
  double: {
    emoji: '⚡',
    label: 'Doble',
    color: '#fb923c',
    description: '×2 puntos en esta casilla',
  },
}

export const NUMBER_COLORS: Record<number, string> = {
  1: '#818cf8',
  2: '#34d399',
  3: '#f87171',
  4: '#a78bfa',
  5: '#f97316',
  6: '#22d3ee',
  7: '#e2e8f0',
  8: '#94a3b8',
}

export const SCORE_PER_CELL = 10
export const COMBO_MULTIPLIER = 1.5
export const MINE_FLAG_BONUS = 25
export const WIN_TIME_BONUS_FACTOR = 5
export const FREEZE_DURATION = 10
