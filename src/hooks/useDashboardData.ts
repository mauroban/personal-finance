/**
 * Dashboard Data Hook
 *
 * Centralized hook that provides all dashboard-related data and calculations.
 * This reduces prop drilling and ensures consistent data across dashboard components.
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const dashboardData = useDashboardData()
 *
 *   return (
 *     <div>
 *       <MonthSummaryCard data={dashboardData.monthSummary} />
 *       <CategoryChart data={dashboardData.categoryImpact} />
 *     </div>
 *   )
 * }
 * ```
 */

import { useApp } from '@/context/AppContext'
import { useBudgetCalculations } from './useBudgetCalculations'
import { useCategoryImpact } from './useCategoryImpact'
import { useYTDCalculations } from './useYTDCalculations'
import { useYearlyCalculations } from './useYearlyCalculations'
import { useTrendCalculations } from './useTrendCalculations'

export interface DashboardData {
  // Raw data from context
  transactions: ReturnType<typeof useApp>['transactions']
  budgets: ReturnType<typeof useApp>['budgets']
  categories: ReturnType<typeof useApp>['categories']
  sources: ReturnType<typeof useApp>['sources']
  year: number
  month: number

  // Calculated data
  monthSummary: ReturnType<typeof useBudgetCalculations>['monthSummary']
  groupSummaries: ReturnType<typeof useBudgetCalculations>['groupSummaries']
  categoryImpact: ReturnType<typeof useCategoryImpact>
  ytdSummary: ReturnType<typeof useYTDCalculations>
  yearlySummary: ReturnType<typeof useYearlyCalculations>['yearlySummary']
  categoryTrends: ReturnType<typeof useTrendCalculations>['categoryTrends']
  varianceTrend: ReturnType<typeof useTrendCalculations>['varianceTrend']

  // View mode controls
  viewMode: ReturnType<typeof useApp>['viewMode']
  setViewMode: ReturnType<typeof useApp>['setViewMode']
}

/**
 * Hook that provides all dashboard data in one place
 *
 * @returns Dashboard data object containing all calculations and raw data
 */
export const useDashboardData = (): DashboardData => {
  const {
    transactions,
    budgets,
    categories,
    sources,
    selectedYear: year,
    selectedMonth: month,
    viewMode,
    setViewMode,
  } = useApp()

  // Calculate month summary and group summaries
  const { monthSummary, groupSummaries } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    year,
    month
  )

  // Calculate category impact analysis
  const categoryImpact = useCategoryImpact(transactions, budgets, categories, year, month)

  // Calculate YTD summary
  const ytdSummary = useYTDCalculations(transactions, budgets, year, month)

  // Calculate yearly summary
  const { yearlySummary } = useYearlyCalculations(transactions, budgets, categories, year)

  // Calculate trend data
  const { categoryTrends, varianceTrend } = useTrendCalculations(
    transactions,
    budgets,
    categories,
    year,
    month
  )

  return {
    // Raw data
    transactions,
    budgets,
    categories,
    sources,
    year,
    month,

    // Calculated data
    monthSummary,
    groupSummaries,
    categoryImpact,
    ytdSummary,
    yearlySummary,
    categoryTrends,
    varianceTrend,

    // View mode
    viewMode,
    setViewMode,
  }
}
