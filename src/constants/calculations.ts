/**
 * Calculation Constants
 *
 * Magic numbers and thresholds used throughout the application for financial calculations,
 * trend analysis, and data processing.
 */

// Transaction and Budget Limits
export const MAX_TRANSACTION_VALUE = 1_000_000_000 // 1 billion BRL
export const MIN_TRANSACTION_VALUE = 0.01 // 1 cent
export const MAX_INSTALLMENTS = 999
export const MIN_INSTALLMENTS = 1
export const DEFAULT_INSTALLMENTS = 1

// Trend Analysis Thresholds
export const TREND_THRESHOLD_PERCENTAGE = 10 // % change to consider significant
export const TREND_VARIANCE_THRESHOLD = 0.1 // 10% variance threshold
export const MIN_DATA_POINTS_FOR_TREND = 2 // Minimum months needed for trend analysis

// Dashboard Calculations
export const MONTHS_TO_ANALYZE = 3 // Number of months to analyze for insights
export const MAX_LOOKBACK_MONTHS = 10 // Maximum months to look back when finding data
export const MIN_TRANSACTION_COUNT_FOR_INSIGHTS = 1 // Minimum transactions needed for insights

// Top Transactions Display
export const DEFAULT_TOP_TRANSACTIONS_LIMIT = 5
export const MAX_TOP_TRANSACTIONS = 100

// Percentage Calculations
export const PERCENTAGE_MULTIPLIER = 100
export const DECIMAL_PLACES_CURRENCY = 2
export const DECIMAL_PLACES_PERCENTAGE = 1

// Date Ranges
export const MONTHS_IN_YEAR = 12
export const DAYS_IN_WEEK = 7
export const CURRENT_YEAR = new Date().getFullYear()

// Budget Analysis
export const BUDGET_WARNING_THRESHOLD = 0.8 // 80% - show warning when budget usage exceeds this
export const BUDGET_CRITICAL_THRESHOLD = 0.95 // 95% - show critical warning
export const BUDGET_EXCEEDED_THRESHOLD = 1.0 // 100% - budget exceeded

// Category Impact Analysis
export const IMPACT_HIGH_THRESHOLD = 0.15 // 15% of total spending
export const IMPACT_MEDIUM_THRESHOLD = 0.05 // 5% of total spending
export const IMPACT_LOW_THRESHOLD = 0.01 // 1% of total spending

// Cache and Performance
export const CALCULATION_CACHE_TIMEOUT_MS = 1000 // 1 second
export const DEBOUNCE_INPUT_MS = 300 // 300ms for input debouncing

// Display Limits
export const MAX_CATEGORIES_IN_CHART = 10
export const MAX_MONTHS_IN_YEARLY_VIEW = 12
export const MAX_CHART_DATA_POINTS = 365

// Variance Analysis
export const VARIANCE_SIGNIFICANT_AMOUNT = 100 // R$ 100.00 minimum to consider significant
export const VARIANCE_HIGH_PERCENTAGE = 20 // 20% variance is high
export const VARIANCE_MEDIUM_PERCENTAGE = 10 // 10% variance is medium

// Spending Insights
export const SPENDING_SPIKE_MULTIPLIER = 1.5 // 50% increase compared to average
export const SPENDING_DROP_MULTIPLIER = 0.5 // 50% decrease compared to average

// Export file settings
export const EXPORT_FILE_PREFIX = 'orcamento-backup'
export const EXPORT_FILE_EXTENSION = '.json'
export const EXPORT_SCHEMA_VERSION = 1

// Database
export const DB_VERSION = 2
export const DB_NAME = 'SimpleBudgetDB'

// UI Delays and Animations
export const TOAST_DURATION_MS = 3000
export const MODAL_ANIMATION_MS = 200
export const TOOLTIP_DELAY_MS = 500

/**
 * Calculate if a percentage change is significant
 */
export const isSignificantChange = (percentageChange: number): boolean => {
  return Math.abs(percentageChange) >= TREND_THRESHOLD_PERCENTAGE
}

/**
 * Calculate if a budget is in warning state
 */
export const isBudgetWarning = (used: number, budget: number): boolean => {
  if (budget <= 0) return false
  return used / budget >= BUDGET_WARNING_THRESHOLD && used / budget < BUDGET_EXCEEDED_THRESHOLD
}

/**
 * Calculate if a budget is exceeded
 */
export const isBudgetExceeded = (used: number, budget: number): boolean => {
  if (budget <= 0) return false
  return used / budget >= BUDGET_EXCEEDED_THRESHOLD
}

/**
 * Determine impact level based on percentage of total
 */
export const getImpactLevel = (percentage: number): 'high' | 'medium' | 'low' | 'minimal' => {
  if (percentage >= IMPACT_HIGH_THRESHOLD) return 'high'
  if (percentage >= IMPACT_MEDIUM_THRESHOLD) return 'medium'
  if (percentage >= IMPACT_LOW_THRESHOLD) return 'low'
  return 'minimal'
}
