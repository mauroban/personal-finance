import { useMemo } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { isDateInMonth, getMonthName, dateToMonthNumber, monthNumberToDate } from '@/utils/date'
import { TREND_THRESHOLDS, BUDGET_ADHERENCE } from '@/constants/formatting'

export interface MonthDataPoint {
  month: number
  year: number
  monthName: string
  value: number
}

export interface CategoryTrend {
  categoryId: number
  categoryName: string
  data: MonthDataPoint[]
  total: number
  average: number
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
}

export interface VariancePoint {
  month: number
  year: number
  monthName: string
  variance: number
  budgeted: number
  actual: number
  percentage: number
}

export interface SavingsPoint {
  month: number
  year: number
  monthName: string
  savings: number
  savingsRate: number
}

export interface TrendInsight {
  type: 'observation' | 'recommendation' | 'achievement'
  message: string
  icon: string
}

export interface TrendData {
  categoryTrends: CategoryTrend[]
  varianceTrend: VariancePoint[]
  savingsTrend: SavingsPoint[]
  budgetAdherence: number
  insights: TrendInsight[]
  periodSummary: {
    totalIncome: number
    totalExpense: number
    totalSavings: number
    averageMonthlySavings: number
    monthsAnalyzed: number
  }
}

export const useTrendCalculations = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  currentYear: number,
  currentMonth: number,
  monthsBack: number = 6
): TrendData => {
  return useMemo(() => {
    // Calculate the date range
    const currentMonthNum = dateToMonthNumber(currentYear, currentMonth)
    const startMonthNum = currentMonthNum - monthsBack + 1

    // Build periods array for all months in range (including empty months)
    const periods: { year: number; month: number }[] = []
    for (let i = 0; i < monthsBack; i++) {
      const { year, month } = monthNumberToDate(startMonthNum + i)
      periods.push({ year, month })
    }

    // Calculate variance trend
    const varianceTrend: VariancePoint[] = periods.map(({ year, month }) => {
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

      const budgeted = budgetedIncome - budgetedExpense
      const actual = income - expense
      const variance = actual - budgeted
      const percentage = budgeted !== 0 ? (variance / Math.abs(budgeted)) * 100 : 0

      return {
        month,
        year,
        monthName: getMonthName(month),
        variance,
        budgeted,
        actual,
        percentage,
      }
    })

    // Calculate savings trend
    const savingsTrend: SavingsPoint[] = periods.map(({ year, month }) => {
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))

      const income = monthTransactions
        .filter(t => t.type === 'earning')
        .reduce((sum, t) => sum + t.value, 0)

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0)

      const savings = income - expense
      const savingsRate = income > 0 ? (savings / income) * 100 : 0

      return {
        month,
        year,
        monthName: getMonthName(month),
        savings,
        savingsRate,
      }
    })

    // Calculate category trends
    const parentCategories = categories.filter(c => !c.parentId)
    const categoryTrends: CategoryTrend[] = parentCategories.map(cat => {
      const childCategoryIds = categories
        .filter(c => c.parentId === cat.id)
        .map(c => c.id!)

      const data: MonthDataPoint[] = periods.map(({ year, month }) => {
        const monthTransactions = transactions.filter(t =>
          isDateInMonth(t.date, year, month) && t.type === 'expense'
        )

        const value = monthTransactions
          .filter(t =>
            t.groupId === cat.id ||
            (t.subgroupId && childCategoryIds.includes(t.subgroupId))
          )
          .reduce((sum, t) => sum + t.value, 0)

        return {
          month,
          year,
          monthName: getMonthName(month),
          value,
        }
      })

      const total = data.reduce((sum, d) => sum + d.value, 0)
      const average = total / data.length

      // Calculate trend (compare first half vs second half)
      const halfPoint = Math.floor(data.length / 2)
      const firstHalfAvg = data.slice(0, halfPoint).reduce((sum, d) => sum + d.value, 0) / halfPoint
      const secondHalfAvg = data.slice(halfPoint).reduce((sum, d) => sum + d.value, 0) / (data.length - halfPoint)

      const percentageChange = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0

      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (Math.abs(percentageChange) > TREND_THRESHOLDS.significantChange) {
        trend = percentageChange > 0 ? 'up' : 'down'
      }

      return {
        categoryId: cat.id!,
        categoryName: cat.name,
        data,
        total,
        average,
        trend,
        percentageChange,
      }
    }).filter(ct => ct.total > 0)

    // Calculate budget adherence score
    let adherenceScore = 0
    let monthsWithBudget = 0

    periods.forEach(({ year, month }) => {
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0)
      const budgetedExpense = budgets
        .filter(b => b.year === year && b.month === month && b.type === 'expense')
        .reduce((sum, b) => sum + b.amount, 0)

      if (budgetedExpense > 0) {
        const percentage = (expense / budgetedExpense) * 100
        if (percentage <= 100) {
          adherenceScore += (BUDGET_ADHERENCE.maxScore - percentage) + BUDGET_ADHERENCE.baseScore
        } else {
          adherenceScore += Math.max(0, BUDGET_ADHERENCE.baseScore - (percentage - 100)) // Penalize overspending
        }
        monthsWithBudget++
      }
    })

    const budgetAdherence = monthsWithBudget > 0 ? adherenceScore / monthsWithBudget : 0

    // Calculate period summary by summing transactions across all periods
    const totalIncome = periods.reduce((sum, { year, month }) => {
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))
      return sum + monthTransactions
        .filter(t => t.type === 'earning')
        .reduce((acc, t) => acc + t.value, 0)
    }, 0)

    const totalExpense = periods.reduce((sum, { year, month }) => {
      const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))
      return sum + monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.value, 0)
    }, 0)

    const totalSavings = savingsTrend.reduce((sum, s) => sum + s.savings, 0)
    const averageMonthlySavings = periods.length > 0 ? totalSavings / periods.length : 0

    // Generate insights
    const insights: TrendInsight[] = []

    // Best month insight
    const bestMonth = savingsTrend.reduce((best, current) =>
      current.savings > best.savings ? current : best
    )

    if (bestMonth.savings > 0) {
      insights.push({
        type: 'achievement',
        message: `Melhor mês: ${bestMonth.monthName} com R$ ${bestMonth.savings.toFixed(2)} economizados`,
        icon: '🏆',
      })
    }

    // Category trend insights
    const increasingCategories = categoryTrends.filter(ct => ct.trend === 'up' && ct.percentageChange > 15)
    if (increasingCategories.length > 0) {
      const topIncrease = increasingCategories.reduce((max, ct) =>
        ct.percentageChange > max.percentageChange ? ct : max
      )
      insights.push({
        type: 'observation',
        message: `Gastos com "${topIncrease.categoryName}" aumentaram ${topIncrease.percentageChange.toFixed(0)}% no período`,
        icon: '📈',
      })
    }

    const decreasingCategories = categoryTrends.filter(ct => ct.trend === 'down')
    if (decreasingCategories.length > 0) {
      const topDecrease = decreasingCategories.reduce((max, ct) =>
        Math.abs(ct.percentageChange) > Math.abs(max.percentageChange) ? ct : max
      )
      insights.push({
        type: 'achievement',
        message: `Ótimo! Você reduziu gastos com "${topDecrease.categoryName}" em ${Math.abs(topDecrease.percentageChange).toFixed(0)}%`,
        icon: '✅',
      })
    }

    // Budget adherence insight
    if (budgetAdherence >= BUDGET_ADHERENCE.goodThreshold) {
      insights.push({
        type: 'achievement',
        message: `Excelente! Você manteve ${budgetAdherence.toFixed(0)}% de aderência ao orçamento`,
        icon: '🎯',
      })
    } else if (budgetAdherence < BUDGET_ADHERENCE.poorThreshold) {
      insights.push({
        type: 'recommendation',
        message: 'Revise seus orçamentos para melhorar o controle financeiro',
        icon: '💡',
      })
    }

    // Savings trend insight
    const savingsImproving = savingsTrend.length >= 2 &&
      savingsTrend[savingsTrend.length - 1].savings > savingsTrend[0].savings

    if (savingsImproving) {
      insights.push({
        type: 'achievement',
        message: 'Suas economias estão aumentando mês a mês!',
        icon: '📊',
      })
    }

    return {
      categoryTrends,
      varianceTrend,
      savingsTrend,
      budgetAdherence,
      insights,
      periodSummary: {
        totalIncome,
        totalExpense,
        totalSavings,
        averageMonthlySavings,
        monthsAnalyzed: periods.length,
      },
    }
  }, [transactions, budgets, categories, currentYear, currentMonth, monthsBack])
}
