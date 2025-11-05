/**
 * Filter Helpers
 *
 * Reusable filtering utilities to eliminate code duplication across hooks and components.
 * These helpers encapsulate common filtering patterns for transactions, budgets, and date ranges.
 */

import { Transaction, Budget } from '@/types'
import { isDateInMonth } from './date'

/**
 * Filters transactions to only include those in a specific year and month
 *
 * @param transactions - Array of transactions to filter
 * @param year - Target year
 * @param month - Target month (1-12)
 * @returns Filtered array of transactions
 *
 * @example
 * const marchTransactions = filterTransactionsByMonth(allTransactions, 2025, 3)
 */
export const filterTransactionsByMonth = (
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] => {
  return transactions.filter(t => isDateInMonth(t.date, year, month))
}

/**
 * Filters budgets to only include those for a specific year and month
 *
 * @param budgets - Array of budgets to filter
 * @param year - Target year
 * @param month - Target month (1-12)
 * @returns Filtered array of budgets
 *
 * @example
 * const marchBudgets = filterBudgetsByMonth(allBudgets, 2025, 3)
 */
export const filterBudgetsByMonth = (
  budgets: Budget[],
  year: number,
  month: number
): Budget[] => {
  return budgets.filter(b => b.year === year && b.month === month)
}

/**
 * Filters transactions by type (income or expense)
 *
 * @param transactions - Array of transactions to filter
 * @param type - Transaction type to filter by
 * @returns Filtered array of transactions
 *
 * @example
 * const expenses = filterTransactionsByType(allTransactions, 'expense')
 */
export const filterTransactionsByType = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): Transaction[] => {
  return transactions.filter(t => t.type === type)
}

/**
 * Filters budgets by type (income or expense)
 *
 * @param budgets - Array of budgets to filter
 * @param type - Budget type to filter by
 * @returns Filtered array of budgets
 *
 * @example
 * const expenseBudgets = filterBudgetsByType(allBudgets, 'expense')
 */
export const filterBudgetsByType = (
  budgets: Budget[],
  type: 'income' | 'expense'
): Budget[] => {
  return budgets.filter(b => b.type === type)
}

/**
 * Filters transactions by category (groupId) or subcategory (subgroupId)
 *
 * @param transactions - Array of transactions to filter
 * @param categoryId - Category ID to filter by (optional)
 * @param subcategoryId - Subcategory ID to filter by (optional)
 * @returns Filtered array of transactions
 *
 * @example
 * const foodTransactions = filterTransactionsByCategory(allTransactions, 1)
 * const restaurantTransactions = filterTransactionsByCategory(allTransactions, 1, 5)
 */
export const filterTransactionsByCategory = (
  transactions: Transaction[],
  categoryId?: number,
  subcategoryId?: number
): Transaction[] => {
  return transactions.filter(t => {
    if (subcategoryId !== undefined) {
      return t.subgroupId === subcategoryId
    }
    if (categoryId !== undefined) {
      return t.groupId === categoryId
    }
    return true
  })
}

/**
 * Filters budgets by category (groupId) or subcategory (subgroupId)
 *
 * @param budgets - Array of budgets to filter
 * @param categoryId - Category ID to filter by (optional)
 * @param subcategoryId - Subcategory ID to filter by (optional)
 * @returns Filtered array of budgets
 *
 * @example
 * const foodBudgets = filterBudgetsByCategory(allBudgets, 1)
 * const restaurantBudgets = filterBudgetsByCategory(allBudgets, 1, 5)
 */
export const filterBudgetsByCategory = (
  budgets: Budget[],
  categoryId?: number,
  subcategoryId?: number
): Budget[] => {
  return budgets.filter(b => {
    if (subcategoryId !== undefined) {
      return b.subgroupId === subcategoryId
    }
    if (categoryId !== undefined) {
      return b.groupId === categoryId
    }
    return true
  })
}

/**
 * Filters transactions by source (income source)
 *
 * @param transactions - Array of transactions to filter
 * @param sourceId - Source ID to filter by
 * @returns Filtered array of transactions
 *
 * @example
 * const salaryTransactions = filterTransactionsBySource(allTransactions, 1)
 */
export const filterTransactionsBySource = (
  transactions: Transaction[],
  sourceId: number
): Transaction[] => {
  return transactions.filter(t => t.sourceId === sourceId)
}

/**
 * Filters budgets by source (income source)
 *
 * @param budgets - Array of budgets to filter
 * @param sourceId - Source ID to filter by
 * @returns Filtered array of budgets
 *
 * @example
 * const salaryBudgets = filterBudgetsBySource(allBudgets, 1)
 */
export const filterBudgetsBySource = (
  budgets: Budget[],
  sourceId: number
): Budget[] => {
  return budgets.filter(b => b.sourceId === sourceId)
}

/**
 * Filters transactions for a date range
 *
 * @param transactions - Array of transactions to filter
 * @param startDate - Start date (inclusive)
 * @param endDate - End date (inclusive)
 * @returns Filtered array of transactions
 *
 * @example
 * const q1Transactions = filterTransactionsByDateRange(
 *   allTransactions,
 *   new Date('2025-01-01'),
 *   new Date('2025-03-31')
 * )
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= startDate && transactionDate <= endDate
  })
}

/**
 * Gets transactions for the last N months including the current month
 *
 * @param transactions - Array of transactions to filter
 * @param year - Current year
 * @param month - Current month
 * @param monthCount - Number of months to include (default: 3)
 * @returns Array of transaction arrays, one for each month
 *
 * @example
 * // Get last 3 months of transactions
 * const last3Months = getLastNMonthsTransactions(allTransactions, 2025, 3, 3)
 * // Returns: [[jan transactions], [feb transactions], [mar transactions]]
 */
export const getLastNMonthsTransactions = (
  transactions: Transaction[],
  year: number,
  month: number,
  monthCount: number = 3
): Transaction[][] => {
  const result: Transaction[][] = []

  for (let i = monthCount - 1; i >= 0; i--) {
    let targetYear = year
    let targetMonth = month - i

    // Handle year wraparound
    while (targetMonth <= 0) {
      targetMonth += 12
      targetYear--
    }

    const monthTransactions = filterTransactionsByMonth(transactions, targetYear, targetMonth)
    result.push(monthTransactions)
  }

  return result
}

/**
 * Calculates the sum of transaction values
 *
 * @param transactions - Array of transactions to sum
 * @returns Total sum of transaction values
 *
 * @example
 * const totalExpense = sumTransactions(expenseTransactions)
 */
export const sumTransactions = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.value, 0)
}

/**
 * Calculates the sum of budget amounts
 *
 * @param budgets - Array of budgets to sum
 * @returns Total sum of budget amounts
 *
 * @example
 * const totalBudgeted = sumBudgets(expenseBudgets)
 */
export const sumBudgets = (budgets: Budget[]): number => {
  return budgets.reduce((sum, b) => sum + b.amount, 0)
}
