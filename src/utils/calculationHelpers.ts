/**
 * Calculation Helpers
 *
 * Reusable calculation utilities for financial operations.
 * These helpers encapsulate common patterns for percentages, averages, and financial metrics.
 */

/**
 * Calculates percentage with safe division (returns 0 if denominator is 0)
 *
 * @param value - The numerator value
 * @param total - The denominator value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Percentage value
 *
 * @example
 * calculatePercentage(50, 200) // Returns 25
 * calculatePercentage(0, 0) // Returns 0 (safe division)
 */
export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 2
): number => {
  if (total === 0) return 0
  const percentage = (value / total) * 100
  return Number(percentage.toFixed(decimals))
}

/**
 * Calculates average of an array of numbers
 *
 * @param values - Array of numbers to average
 * @returns Average value or 0 if array is empty
 *
 * @example
 * calculateAverage([10, 20, 30]) // Returns 20
 * calculateAverage([]) // Returns 0
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

/**
 * Calculates variance between actual and budgeted values
 *
 * @param actual - Actual value
 * @param budgeted - Budgeted value
 * @returns Variance (positive means under budget, negative means over budget)
 *
 * @example
 * calculateVariance(80, 100) // Returns 20 (under budget by 20)
 * calculateVariance(120, 100) // Returns -20 (over budget by 20)
 */
export const calculateVariance = (actual: number, budgeted: number): number => {
  return budgeted - actual
}

/**
 * Calculates variance percentage
 *
 * @param actual - Actual value
 * @param budgeted - Budgeted value
 * @returns Variance percentage (positive means under budget, negative means over budget)
 *
 * @example
 * calculateVariancePercentage(80, 100) // Returns 20 (20% under budget)
 * calculateVariancePercentage(120, 100) // Returns -20 (20% over budget)
 */
export const calculateVariancePercentage = (actual: number, budgeted: number): number => {
  if (budgeted === 0) return 0
  return calculatePercentage(budgeted - actual, budgeted)
}

/**
 * Determines if a value is over budget
 *
 * @param actual - Actual spending
 * @param budgeted - Budgeted amount
 * @returns True if over budget, false otherwise
 *
 * @example
 * isOverBudget(120, 100) // Returns true
 * isOverBudget(80, 100) // Returns false
 */
export const isOverBudget = (actual: number, budgeted: number): boolean => {
  return budgeted > 0 && actual > budgeted
}

/**
 * Calculates remaining budget
 *
 * @param budgeted - Budgeted amount
 * @param actual - Actual spending
 * @returns Remaining budget (can be negative if over budget)
 *
 * @example
 * calculateRemainingBudget(100, 80) // Returns 20
 * calculateRemainingBudget(100, 120) // Returns -20
 */
export const calculateRemainingBudget = (budgeted: number, actual: number): number => {
  return budgeted - actual
}

/**
 * Calculates savings rate (income - expenses) / income * 100
 *
 * @param income - Total income
 * @param expenses - Total expenses
 * @returns Savings rate percentage
 *
 * @example
 * calculateSavingsRate(5000, 4000) // Returns 20 (saving 20% of income)
 * calculateSavingsRate(5000, 6000) // Returns -20 (spending 20% more than income)
 */
export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0
  return calculatePercentage(income - expenses, income)
}

/**
 * Calculates daily spending rate
 *
 * @param totalSpent - Total amount spent
 * @param daysElapsed - Number of days elapsed
 * @returns Daily spending rate
 *
 * @example
 * calculateDailyRate(300, 10) // Returns 30 (spending 30 per day)
 */
export const calculateDailyRate = (totalSpent: number, daysElapsed: number): number => {
  if (daysElapsed === 0) return 0
  return totalSpent / daysElapsed
}

/**
 * Calculates projected spending for the month based on current rate
 *
 * @param totalSpent - Amount spent so far
 * @param daysElapsed - Days elapsed in the month
 * @param totalDays - Total days in the month
 * @returns Projected total spending for the month
 *
 * @example
 * calculateProjectedSpending(300, 10, 30) // Returns 900
 */
export const calculateProjectedSpending = (
  totalSpent: number,
  daysElapsed: number,
  totalDays: number
): number => {
  if (daysElapsed === 0) return 0
  const dailyRate = calculateDailyRate(totalSpent, daysElapsed)
  return dailyRate * totalDays
}

/**
 * Calculates recommended daily spending to stay within budget
 *
 * @param budgeted - Total budgeted amount
 * @param spent - Amount spent so far
 * @param daysRemaining - Days remaining in the period
 * @returns Recommended daily spending amount
 *
 * @example
 * calculateRecommendedDailySpending(1000, 600, 10) // Returns 40
 */
export const calculateRecommendedDailySpending = (
  budgeted: number,
  spent: number,
  daysRemaining: number
): number => {
  if (daysRemaining === 0) return 0
  const remaining = calculateRemainingBudget(budgeted, spent)
  return Math.max(0, remaining / daysRemaining)
}

/**
 * Clamps a number between a minimum and maximum value
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * clamp(150, 0, 100) // Returns 100
 * clamp(-10, 0, 100) // Returns 0
 * clamp(50, 0, 100) // Returns 50
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Rounds a number to a specific number of decimal places
 *
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 *
 * @example
 * roundToDecimals(123.456, 2) // Returns 123.46
 * roundToDecimals(123.456, 0) // Returns 123
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Formats a number as currency without the symbol
 *
 * @param value - Value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56) // Returns "1,234.56"
 * formatNumber(1234567.89) // Returns "1,234,567.89"
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
