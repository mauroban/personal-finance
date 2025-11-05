import React, { useMemo } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { PeriodSelector } from '@/components/common/PeriodSelector'
import { YearlySummary } from '@/components/dashboard/YearlySummary'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { MonthlyBreakdownTable } from '@/components/dashboard/MonthlyBreakdownTable'
import { YearlyCategoryTrends } from '@/components/dashboard/YearlyCategoryTrends'
import { PerformanceHeatmap, MonthPerformanceData } from '@/components/dashboard/PerformanceHeatmap'
import { useYearlyCalculations } from '@/hooks/useYearlyCalculations'

interface YearTabProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
  onYearChange: (year: number) => void
  onMonthClick: (month: number) => void
}

export const YearTab: React.FC<YearTabProps> = ({
  transactions,
  budgets,
  categories,
  year,
  onYearChange,
  onMonthClick,
}) => {
  const { yearlySummary } = useYearlyCalculations(transactions, budgets, categories, year)

  // Prepare data for performance heatmap (only for past/current months)
  const heatmapData: MonthPerformanceData[] = useMemo(() => {
    return yearlySummary.monthlyBreakdowns
      .filter(breakdown => !breakdown.isFuture) // Only show past/current months
      .map(breakdown => {
        const budgetedBalance = breakdown.budgetedIncome - breakdown.budgetedExpense
        const actualBalance = breakdown.netBalance
        const variance = actualBalance - budgetedBalance

        let status: MonthPerformanceData['status'] = 'neutral'

        if (budgetedBalance > 0) {
          const percentageOfBudget = (actualBalance / budgetedBalance) * 100

          if (percentageOfBudget >= 110) {
            status = 'excellent' // Saved 10% more than planned
          } else if (percentageOfBudget >= 90) {
            status = 'good' // Within 10% of target
          } else if (percentageOfBudget >= 70) {
            status = 'warning' // 70-90% of target
          } else {
            status = 'danger' // Below 70%
          }
        } else if (actualBalance >= 0) {
          status = 'good' // Any positive balance is good when no savings planned
        } else {
          status = 'danger' // Negative balance
        }

        return {
          month: breakdown.month,
          value: actualBalance,
          budgeted: budgetedBalance,
          status,
        }
      })
  }, [yearlySummary.monthlyBreakdowns])

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="card p-6">
        <PeriodSelector
          selectedYear={year}
          onYearChange={onYearChange}
          showMonths={false}
          showNavigation={false}
          showTodayButton={false}
        />
      </div>

      <YearlySummary
        transactions={transactions}
        budgets={budgets}
        categories={categories}
        year={year}
      />

      <PerformanceHeatmap
        data={heatmapData}
        year={year}
        onMonthClick={onMonthClick}
      />
      <MonthlyTrendChart
        transactions={transactions}
        budgets={budgets}
        categories={categories}
        year={year}
      />
      <MonthlyBreakdownTable
        transactions={transactions}
        budgets={budgets}
        categories={categories}
        year={year}
        onMonthClick={onMonthClick}
      />
      <YearlyCategoryTrends
        transactions={transactions}
        budgets={budgets}
        categories={categories}
        year={year}
      />
    </div>
  )
}
