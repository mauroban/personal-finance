import { useMemo } from 'react'
import { Transaction, Budget, Category, MonthSummary, GroupSummary } from '@/types'
import { isDateInMonth } from '@/utils/date'

export const useBudgetCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number,
  month: number
) => {
  const monthSummary = useMemo((): MonthSummary => {
    const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))

    const totalIncome = monthTransactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.value, 0)

    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0)

    const budgetedIncome = budgets
      .filter(b => b.year === year && b.month === month && b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0)

    const budgetedExpense = budgets
      .filter(b => b.year === year && b.month === month && b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0)

    return {
      totalIncome,
      totalExpense,
      budgetedIncome,
      budgetedExpense,
      netBalance: totalIncome - totalExpense,
    }
  }, [transactions, budgets, year, month])

  const groupSummaries = useMemo((): GroupSummary[] => {
    const monthTransactions = transactions.filter(t =>
      isDateInMonth(t.date, year, month) && t.type === 'expense'
    )

    const parentCategories = categories.filter(c => !c.parentId)

    return parentCategories.map(cat => {
      const groupBudget = budgets.find(
        b => b.year === year && b.month === month && b.groupId === cat.id && b.type === 'expense'
      )

      const budgeted = groupBudget?.amount || 0

      const actual = monthTransactions
        .filter(t => t.groupId === cat.id)
        .reduce((sum, t) => sum + t.value, 0)

      const remaining = budgeted - actual
      const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0

      return {
        groupId: cat.id!,
        groupName: cat.name,
        budgeted,
        actual,
        remaining,
        percentage,
      }
    }).filter(g => g.budgeted > 0 || g.actual > 0)
  }, [transactions, budgets, categories, year, month])

  return {
    monthSummary,
    groupSummaries,
  }
}
