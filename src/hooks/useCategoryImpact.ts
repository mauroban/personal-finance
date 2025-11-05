import { useMemo } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { isDateInMonth } from '@/utils/date'

export interface SubcategoryImpact {
  id: number
  name: string
  spent: number
  budgeted: number
  percentage: number
  isOverBudget: boolean
  impact: number // How much this affects total spending
  avg3Months: number // Average spending over last 3 months
  trend: 'up' | 'down' | 'stable' // Compared to 3-month average
}

export interface CategoryImpact {
  id: number
  name: string
  spent: number
  budgeted: number
  percentage: number
  isOverBudget: boolean
  impact: number // Percentage of total spending
  subcategories: SubcategoryImpact[]
  topSubcategory?: SubcategoryImpact
  avg3Months: number // Average spending over last 3 months
  trend: 'up' | 'down' | 'stable' // Compared to 3-month average
}

export const useCategoryImpact = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number,
  month: number
) => {
  return useMemo(() => {
    // Get month transactions and budgets
    const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))
    const monthBudgets = budgets.filter(b => b.year === year && b.month === month)

    // Calculate total spending
    const totalSpent = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0)

    // Get parent categories
    const parentCategories = categories.filter(c => !c.parentId)

    // Calculate 3-month average for comparison (only completed months with activity)
    const getLast3MonthsTransactions = () => {
      const last3Months: Transaction[][] = []
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1

      for (let i = 1; i <= 10; i++) { // Look back up to 10 months to find 3 with activity
        if (last3Months.length >= 3) break // Stop once we have 3 months

        let targetMonth = month - i
        let targetYear = year

        if (targetMonth <= 0) {
          targetMonth += 12
          targetYear -= 1
        }

        // Only include months that are actually completed
        // Skip if target month is in the future or is the current month
        if (targetYear > currentYear || (targetYear === currentYear && targetMonth >= currentMonth)) {
          continue
        }

        const monthTrans = transactions.filter(t => isDateInMonth(t.date, targetYear, targetMonth))
        const monthBuds = budgets.filter(b => b.year === targetYear && b.month === targetMonth)

        // Only include months that have expenses or budgets
        if (monthTrans.some(t => t.type === 'expense') || monthBuds.some(b => b.type === 'expense')) {
          last3Months.push(monthTrans)
        }
      }
      return last3Months
    }

    const last3MonthsTransactions = getLast3MonthsTransactions()
    const completedMonthsCount = last3MonthsTransactions.length

    // Calculate impact for each category
    const categoryImpacts: CategoryImpact[] = parentCategories.map(cat => {
      const childCategories = categories.filter(c => c.parentId === cat.id)

      // Calculate subcategory impacts
      const subcategoryImpacts: SubcategoryImpact[] = childCategories
        .map(subcat => {
          const spent = monthTransactions
            .filter(t => t.type === 'expense' && t.subgroupId === subcat.id)
            .reduce((sum, t) => sum + t.value, 0)

          const budgeted = monthBudgets
            .filter(b => b.type === 'expense' && b.subgroupId === subcat.id)
            .reduce((sum, b) => sum + b.amount, 0)

          // Calculate 3-month average for this subcategory
          const last3MonthsSpent = last3MonthsTransactions.map(monthTrans =>
            monthTrans
              .filter(t => t.type === 'expense' && t.subgroupId === subcat.id)
              .reduce((sum, t) => sum + t.value, 0)
          )
          const avg3Months = completedMonthsCount > 0
            ? last3MonthsSpent.reduce((sum, val) => sum + val, 0) / completedMonthsCount
            : 0

          // Determine trend
          const trend: 'up' | 'down' | 'stable' = avg3Months === 0
            ? 'stable'
            : spent > avg3Months * 1.1
            ? 'up'
            : spent < avg3Months * 0.9
            ? 'down'
            : 'stable'

          const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0
          const impact = totalSpent > 0 ? (spent / totalSpent) * 100 : 0

          return {
            id: subcat.id!,
            name: subcat.name,
            spent,
            budgeted,
            percentage,
            isOverBudget: budgeted > 0 && spent > budgeted,
            impact,
            avg3Months,
            trend,
          }
        })
        .filter(s => s.spent > 0 || s.budgeted > 0 || s.avg3Months > 0) // Include if active this month or historically
        .sort((a, b) => b.spent - a.spent) // Sort by spending

      // Calculate category totals
      const categorySpent = monthTransactions
        .filter(t =>
          t.type === 'expense' &&
          (t.groupId === cat.id || (t.subgroupId && childCategories.some(c => c.id === t.subgroupId)))
        )
        .reduce((sum, t) => sum + t.value, 0)

      const categoryBudgeted = monthBudgets
        .filter(b =>
          b.type === 'expense' &&
          (b.groupId === cat.id || (b.subgroupId && childCategories.some(c => c.id === b.subgroupId)))
        )
        .reduce((sum, b) => sum + b.amount, 0)

      // Calculate 3-month average for this category
      const categoryLast3MonthsSpent = last3MonthsTransactions.map(monthTrans =>
        monthTrans
          .filter(t =>
            t.type === 'expense' &&
            (t.groupId === cat.id || (t.subgroupId && childCategories.some(c => c.id === t.subgroupId)))
          )
          .reduce((sum, t) => sum + t.value, 0)
      )
      const categoryAvg3Months = completedMonthsCount > 0
        ? categoryLast3MonthsSpent.reduce((sum, val) => sum + val, 0) / completedMonthsCount
        : 0

      // Determine trend
      const categoryTrend: 'up' | 'down' | 'stable' = categoryAvg3Months === 0
        ? 'stable'
        : categorySpent > categoryAvg3Months * 1.1
        ? 'up'
        : categorySpent < categoryAvg3Months * 0.9
        ? 'down'
        : 'stable'

      const percentage = categoryBudgeted > 0 ? (categorySpent / categoryBudgeted) * 100 : 0
      const impact = totalSpent > 0 ? (categorySpent / totalSpent) * 100 : 0

      return {
        id: cat.id!,
        name: cat.name,
        spent: categorySpent,
        budgeted: categoryBudgeted,
        percentage,
        isOverBudget: categoryBudgeted > 0 && categorySpent > categoryBudgeted,
        impact,
        subcategories: subcategoryImpacts,
        topSubcategory: subcategoryImpacts[0], // Highest spending subcategory
        avg3Months: categoryAvg3Months,
        trend: categoryTrend,
      }
    })
      .filter(c => c.spent > 0 || c.budgeted > 0 || c.avg3Months > 0) // Include if active this month or historically
      .sort((a, b) => b.spent - a.spent) // Sort by spending

    // Top spending categories (all that have spending)
    const topSpenders = categoryImpacts

    // Categories trending up (spending more than 3-month average)
    const trendingUp = categoryImpacts
      .filter(c => c.trend === 'up' && c.spent > 0)
      .sort((a, b) => (b.spent - b.avg3Months) - (a.spent - a.avg3Months))
      .slice(0, 5)

    // Categories trending down (spending less than 3-month average)
    const trendingDown = categoryImpacts
      .filter(c => c.trend === 'down' && c.avg3Months > 0)
      .sort((a, b) => (b.avg3Months - b.spent) - (a.avg3Months - a.spent))
      .slice(0, 5)

    return {
      totalSpent,
      categoryImpacts,
      topSpenders,
      trendingUp,
      trendingDown,
    }
  }, [transactions, budgets, categories, year, month])
}
