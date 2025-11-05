import { useMemo } from 'react'
import { Transaction, Budget } from '@/types'
import { isDateInMonth } from '@/utils/date'

export interface YTDSummary {
  totalIncome: number
  totalExpense: number
  totalSavings: number
  budgetedIncome: number
  budgetedExpense: number
  budgetedSavings: number
  savingsPercentage: number
  savingsRate: number // Savings as % of income
  monthsCompleted: number
  averageMonthlyIncome: number
  averageMonthlyExpense: number
  averageMonthlySavings: number
}

export const useYTDCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  year: number,
  currentMonth: number
): YTDSummary => {
  return useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    let budgetedIncome = 0
    let budgetedExpense = 0

    // Only include completed months (exclude current month)
    const today = new Date()
    const isCurrentYear = today.getFullYear() === year
    const todayMonth = today.getMonth() + 1

    // If we're in the current year, only count months up to (but not including) current month
    // Otherwise, count all months up to currentMonth
    const monthsToCount = isCurrentYear && todayMonth === currentMonth
      ? currentMonth - 1
      : currentMonth

    const monthsCompleted = Math.max(monthsToCount, 0)

    // Calculate YTD totals (from January to last completed month)
    for (let month = 1; month <= monthsCompleted; month++) {
      // Sum actual transactions
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))

      monthTransactions.forEach(t => {
        if (t.type === 'earning') {
          totalIncome += t.value
        } else {
          totalExpense += t.value
        }
      })

      // Sum budgets
      const monthBudgets = budgets.filter(b => b.year === year && b.month === month)

      monthBudgets.forEach(b => {
        if (b.type === 'income') {
          budgetedIncome += b.amount
        } else {
          budgetedExpense += b.amount
        }
      })
    }

    const totalSavings = totalIncome - totalExpense
    const budgetedSavings = budgetedIncome - budgetedExpense

    // Handle edge case: if no completed months yet, use 0 for percentages
    const savingsPercentage = budgetedSavings > 0 && monthsCompleted > 0
      ? (totalSavings / budgetedSavings) * 100
      : 0
    const savingsRate = totalIncome > 0
      ? (totalSavings / totalIncome) * 100
      : 0

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      budgetedIncome,
      budgetedExpense,
      budgetedSavings,
      savingsPercentage,
      savingsRate,
      monthsCompleted,
      averageMonthlyIncome: monthsCompleted > 0 ? totalIncome / monthsCompleted : 0,
      averageMonthlyExpense: monthsCompleted > 0 ? totalExpense / monthsCompleted : 0,
      averageMonthlySavings: monthsCompleted > 0 ? totalSavings / monthsCompleted : 0,
    }
  }, [transactions, budgets, year, currentMonth])
}
