import React from 'react'
import { Transaction, Budget, Category } from '@/types'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { TrendSparkline } from '@/components/dashboard/TrendSparkline'
import { CategoryImpactAnalysis } from '@/components/dashboard/CategoryImpactAnalysis'
import { SpendingInsights } from '@/components/dashboard/SpendingInsights'
import { useYTDCalculations } from '@/hooks/useYTDCalculations'
import { useCategoryImpact } from '@/hooks/useCategoryImpact'
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations'
import { formatCurrency } from '@/utils/format'
import { VIEW_MODES } from '@/constants/viewModes'
import { useApp } from '@/context/AppContext'

interface OverviewTabProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
  month: number
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  transactions,
  budgets,
  categories,
  year,
  month,
}) => {
  const { setViewMode } = useApp()

  // Get YTD calculations
  const ytdSummary = useYTDCalculations(transactions, budgets, year, month)

  // Get current month summary
  const { monthSummary, groupSummaries: _groupSummaries } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    year,
    month
  )

  // Get category impact analysis
  const categoryImpact = useCategoryImpact(transactions, budgets, categories, year, month)

  // Calculate last 3 months trend (only months with activity)
  const last3MonthsBalance = React.useMemo(() => {
    const balances: number[] = []
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    for (let i = 1; i <= 10 && balances.length < 3; i++) {
      let targetMonth = month - i
      let targetYear = year

      if (targetMonth <= 0) {
        targetMonth += 12
        targetYear -= 1
      }

      // Skip future months
      if (targetYear > currentYear || (targetYear === currentYear && targetMonth >= currentMonth)) {
        continue
      }

      const monthTrans = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getFullYear() === targetYear && date.getMonth() + 1 === targetMonth
      })

      const monthBuds = budgets.filter(b => b.year === targetYear && b.month === targetMonth)

      // Skip empty months
      if (monthTrans.length === 0 && monthBuds.length === 0) {
        continue
      }

      const income = monthTrans.filter(t => t.type === 'earning').reduce((sum, t) => sum + t.value, 0)
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0)
      balances.unshift(income - expense) // Add to beginning to maintain chronological order
    }
    return balances
  }, [transactions, budgets, year, month])

  // Determine trend
  const trend = React.useMemo(() => {
    if (last3MonthsBalance.length < 2) return 'neutral'
    const lastMonth = last3MonthsBalance[last3MonthsBalance.length - 1]
    const previousMonth = last3MonthsBalance[last3MonthsBalance.length - 2]
    if (lastMonth > previousMonth) return 'up'
    if (lastMonth < previousMonth) return 'down'
    return 'neutral'
  }, [last3MonthsBalance])

  // Calculate spending insights
  const spendingInsights = React.useMemo(() => {
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth

    // Calculate 3-month average spending (excluding current month and empty months)
    let avgMonthlySpending = 0
    let monthsCount = 0
    for (let i = 1; i <= 10 && monthsCount < 3; i++) { // Look back up to 10 months to find 3 with activity
      let targetMonth = month - i
      let targetYear = year

      if (targetMonth <= 0) {
        targetMonth += 12
        targetYear -= 1
      }

      // Only include completed months
      if (targetYear > today.getFullYear() ||
          (targetYear === today.getFullYear() && targetMonth >= today.getMonth() + 1)) {
        continue
      }

      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getFullYear() === targetYear && date.getMonth() + 1 === targetMonth
      })

      const monthBudgets = budgets.filter(b => b.year === targetYear && b.month === targetMonth)

      // Only include months that have expenses or budgets
      const hasExpenses = monthTransactions.some(t => t.type === 'expense')
      const hasBudgets = monthBudgets.some(b => b.type === 'expense')

      if (!hasExpenses && !hasBudgets) {
        continue
      }

      const monthSpent = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0)

      avgMonthlySpending += monthSpent
      monthsCount++
    }
    avgMonthlySpending = monthsCount > 0 ? avgMonthlySpending / monthsCount : 0

    // Project spending for rest of month based on current daily average
    const dailyAverage = daysElapsed > 0 ? monthSummary.totalExpense / daysElapsed : 0
    const projectedSpending = isCurrentMonth
      ? (dailyAverage * daysInMonth)
      : monthSummary.totalExpense

    const isOnTrack = monthSummary.budgetedExpense > 0
      ? projectedSpending <= monthSummary.budgetedExpense
      : true

    return {
      totalSpent: monthSummary.totalExpense,
      totalBudgeted: monthSummary.budgetedExpense,
      avgMonthlySpending,
      daysInMonth,
      daysElapsed,
      projectedSpending,
      isOnTrack,
    }
  }, [transactions, monthSummary, year, month])

  return (
    <div className="space-y-6">
      {/* YTD Hero Card */}
      <HeroCard
        title="Economia Acumulada no Ano"
        value={ytdSummary.totalSavings}
        target={ytdSummary.budgetedSavings}
        percentage={ytdSummary.savingsPercentage}
        trend={ytdSummary.totalSavings > 0 ? 'up' : ytdSummary.totalSavings < 0 ? 'down' : 'neutral'}
        subtitle={`${ytdSummary.monthsCompleted} ${ytdSummary.monthsCompleted === 1 ? 'mês' : 'meses'} completo${ytdSummary.monthsCompleted === 1 ? '' : 's'}`}
      />

      {/* Current Month Snapshot */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mês Atual
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Receitas"
            value={formatCurrency(monthSummary.totalIncome)}
            sublabel={`${monthSummary.budgetedIncome > 0 ? ((monthSummary.totalIncome / monthSummary.budgetedIncome) * 100).toFixed(0) : 0}% do planejado`}
            status={monthSummary.totalIncome >= monthSummary.budgetedIncome ? 'positive' : 'neutral'}
            icon="💵"
            onClick={() => setViewMode(VIEW_MODES.MONTH)}
          />
          <MetricCard
            label="Despesas"
            value={formatCurrency(monthSummary.totalExpense)}
            sublabel={`${monthSummary.budgetedExpense > 0 ? ((monthSummary.totalExpense / monthSummary.budgetedExpense) * 100).toFixed(0) : 0}% do orçamento`}
            status={monthSummary.totalExpense <= monthSummary.budgetedExpense ? 'positive' : 'negative'}
            icon="💳"
            onClick={() => setViewMode(VIEW_MODES.MONTH)}
          />
          <MetricCard
            label="Saldo"
            value={formatCurrency(monthSummary.netBalance)}
            sublabel={monthSummary.netBalance >= 0 ? 'Economizando!' : 'Déficit'}
            status={monthSummary.netBalance >= 0 ? 'positive' : 'negative'}
            icon="💰"
            onClick={() => setViewMode(VIEW_MODES.MONTH)}
          />
        </div>
      </div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Insights */}
        <SpendingInsights
          totalSpent={spendingInsights.totalSpent}
          totalBudgeted={spendingInsights.totalBudgeted}
          avgMonthlySpending={spendingInsights.avgMonthlySpending}
          daysInMonth={spendingInsights.daysInMonth}
          daysElapsed={spendingInsights.daysElapsed}
          projectedSpending={spendingInsights.projectedSpending}
          isOnTrack={spendingInsights.isOnTrack}
        />

        {/* Recent Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendência Recente
          </h3>
          <TrendSparkline
            data={last3MonthsBalance}
            trend={trend}
            label="Últimos 3 meses"
            height={80}
          />
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Taxa de Poupança</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {ytdSummary.savingsRate.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Média Mensal</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(ytdSummary.averageMonthlySavings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Impact Analysis */}
      <CategoryImpactAnalysis
        categoryImpacts={categoryImpact.categoryImpacts}
        topSpenders={categoryImpact.topSpenders}
        trendingUp={categoryImpact.trendingUp}
        trendingDown={categoryImpact.trendingDown}
        totalSpent={categoryImpact.totalSpent}
      />

      {/* Quick Action */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Ver Análise Detalhada
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore gráficos e relatórios completos do mês atual
            </p>
          </div>
          <button
            onClick={() => setViewMode(VIEW_MODES.MONTH)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Ver Detalhes →
          </button>
        </div>
      </div>
    </div>
  )
}
