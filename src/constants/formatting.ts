/**
 * Currency formatting constants
 */
export const CURRENCY_CONFIG = {
  locale: 'pt-BR',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
} as const

export const CENTS_PER_REAL = 100

/**
 * Trend calculation constants
 */
export const TREND_THRESHOLDS = {
  /** Minimum percentage change to be considered a significant trend */
  significantChange: 10,
} as const

/**
 * Budget adherence scoring constants
 */
export const BUDGET_ADHERENCE = {
  /** Base score for perfect adherence */
  baseScore: 50,
  /** Maximum score for staying under budget */
  maxScore: 100,
  /** Threshold for "good" adherence achievement */
  goodThreshold: 70,
  /** Threshold for "poor" adherence warning */
  poorThreshold: 50,
} as const
