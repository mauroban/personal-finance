import { useMemo } from 'react'
import { Transaction, Budget, Category, MonthSummary, GroupSummary } from '@/types'
import { isDateInMonth } from '@/utils/date'

export interface SubcategorySummary {
  subgroupId: number
  subgroupName: string
  budgeted: number
  actual: number
  remaining: number
  percentage: number
}

export interface GroupWithSubcategories extends GroupSummary {
  subcategories: SubcategorySummary[]
}

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
      // Get all child category IDs for this parent category
      const childCategoryIds = categories
        .filter(c => c.parentId === cat.id)
        .map(c => c.id!)

      // Consolidate budgets: sum budgets at parent level AND subcategory level
      const budgeted = budgets
        .filter(b =>
          b.year === year &&
          b.month === month &&
          b.type === 'expense' &&
          (b.groupId === cat.id || (b.subgroupId && childCategoryIds.includes(b.subgroupId)))
        )
        .reduce((sum, b) => sum + b.amount, 0)

      // Consolidate actuals: sum transactions at parent level AND subcategory level
      const actual = monthTransactions
        .filter(t =>
          t.groupId === cat.id ||
          (t.subgroupId && childCategoryIds.includes(t.subgroupId))
        )
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

  const groupSummariesWithSubcategories = useMemo((): GroupWithSubcategories[] => {
    const monthTransactions = transactions.filter(t =>
      isDateInMonth(t.date, year, month) && t.type === 'expense'
    )

    const parentCategories = categories.filter(c => !c.parentId)

    return parentCategories.map(cat => {
      const childCategories = categories.filter(c => c.parentId === cat.id)
      const childCategoryIds = childCategories.map(c => c.id!)

      // Calculate parent-level totals
      const budgeted = budgets
        .filter(b =>
          b.year === year &&
          b.month === month &&
          b.type === 'expense' &&
          (b.groupId === cat.id || (b.subgroupId && childCategoryIds.includes(b.subgroupId)))
        )
        .reduce((sum, b) => sum + b.amount, 0)

      const actual = monthTransactions
        .filter(t =>
          t.groupId === cat.id ||
          (t.subgroupId && childCategoryIds.includes(t.subgroupId))
        )
        .reduce((sum, t) => sum + t.value, 0)

      const remaining = budgeted - actual
      const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0

      // Calculate subcategory summaries
      const subcategories: SubcategorySummary[] = childCategories.map(subcat => {
        const subBudgeted = budgets
          .filter(b =>
            b.year === year &&
            b.month === month &&
            b.type === 'expense' &&
            b.subgroupId === subcat.id
          )
          .reduce((sum, b) => sum + b.amount, 0)

        const subActual = monthTransactions
          .filter(t => t.subgroupId === subcat.id)
          .reduce((sum, t) => sum + t.value, 0)

        const subRemaining = subBudgeted - subActual
        const subPercentage = subBudgeted > 0 ? (subActual / subBudgeted) * 100 : 0

        return {
          subgroupId: subcat.id!,
          subgroupName: subcat.name,
          budgeted: subBudgeted,
          actual: subActual,
          remaining: subRemaining,
          percentage: subPercentage,
        }
      }).filter(s => s.budgeted > 0 || s.actual > 0)

      return {
        groupId: cat.id!,
        groupName: cat.name,
        budgeted,
        actual,
        remaining,
        percentage,
        subcategories,
      }
    }).filter(g => g.budgeted > 0 || g.actual > 0)
  }, [transactions, budgets, categories, year, month])

  return {
    monthSummary,
    groupSummaries,
    groupSummariesWithSubcategories,
  }
}
