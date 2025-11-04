import { useMemo } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { isDateInMonth, getMonthName } from '@/utils/date'

export interface MonthlyBreakdown {
  month: number
  monthName: string
  income: number
  expense: number
  budgetedIncome: number
  budgetedExpense: number
  netBalance: number
  incomeVariance: number
  expenseVariance: number
}

export interface YearlySummary {
  totalIncome: number
  totalExpense: number
  totalBudgetedIncome: number
  totalBudgetedExpense: number
  netBalance: number
  totalIncomeVariance: number
  totalExpenseVariance: number
  monthlyBreakdowns: MonthlyBreakdown[]
}

export interface YearlyGroupSummary {
  groupId: number
  groupName: string
  totalBudgeted: number
  totalActual: number
  totalRemaining: number
  averagePercentage: number
  monthlyData: {
    month: number
    budgeted: number
    actual: number
  }[]
}

export const useYearlyCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number
) => {
  const yearlySummary = useMemo((): YearlySummary => {
    const monthlyBreakdowns: MonthlyBreakdown[] = []
    let totalIncome = 0
    let totalExpense = 0
    let totalBudgetedIncome = 0
    let totalBudgetedExpense = 0

    for (let month = 1; month <= 12; month++) {
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))

      const income = monthTransactions
        .filter(t => t.type === 'earning')
        .reduce((sum, t) => sum + t.value, 0)

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0)

      const budgetedIncome = budgets
        .filter(b => b.year === year && b.month === month && b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0)

      const budgetedExpense = budgets
        .filter(b => b.year === year && b.month === month && b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0)

      totalIncome += income
      totalExpense += expense
      totalBudgetedIncome += budgetedIncome
      totalBudgetedExpense += budgetedExpense

      monthlyBreakdowns.push({
        month,
        monthName: getMonthName(month),
        income,
        expense,
        budgetedIncome,
        budgetedExpense,
        netBalance: income - expense,
        incomeVariance: income - budgetedIncome,
        expenseVariance: budgetedExpense - expense,
      })
    }

    return {
      totalIncome,
      totalExpense,
      totalBudgetedIncome,
      totalBudgetedExpense,
      netBalance: totalIncome - totalExpense,
      totalIncomeVariance: totalIncome - totalBudgetedIncome,
      totalExpenseVariance: totalBudgetedExpense - totalExpense,
      monthlyBreakdowns,
    }
  }, [transactions, budgets, year])

  const yearlyGroupSummaries = useMemo((): YearlyGroupSummary[] => {
    const parentCategories = categories.filter(c => !c.parentId)

    return parentCategories.map(cat => {
      let totalBudgeted = 0
      let totalActual = 0
      const monthlyData: { month: number; budgeted: number; actual: number }[] = []

      for (let month = 1; month <= 12; month++) {
        const monthTransactions = transactions.filter(t =>
          isDateInMonth(t.date, year, month) && t.type === 'expense'
        )

        const groupBudget = budgets.find(
          b => b.year === year && b.month === month && b.groupId === cat.id && b.type === 'expense'
        )

        const budgeted = groupBudget?.amount || 0
        const actual = monthTransactions
          .filter(t => t.groupId === cat.id)
          .reduce((sum, t) => sum + t.value, 0)

        totalBudgeted += budgeted
        totalActual += actual

        monthlyData.push({ month, budgeted, actual })
      }

      const totalRemaining = totalBudgeted - totalActual
      const averagePercentage = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0

      return {
        groupId: cat.id!,
        groupName: cat.name,
        totalBudgeted,
        totalActual,
        totalRemaining,
        averagePercentage,
        monthlyData,
      }
    }).filter(g => g.totalBudgeted > 0 || g.totalActual > 0)
  }, [transactions, budgets, categories, year])

  return {
    yearlySummary,
    yearlyGroupSummaries,
  }
}
