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
}

type PeriodType = 'current' | 'last1' | 'last3' | 'last6'

export const OverviewTab: React.FC<OverviewTabProps> = ({
  transactions,
  budgets,
  categories,
}) => {
  const { setViewMode } = useApp()
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodType>('current')

  // Always use current date for Overview
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  // Calculate period year/month based on selection
  const { periodYear, periodMonth } = React.useMemo(() => {
    if (selectedPeriod === 'current') {
      return { periodYear: year, periodMonth: month }
    } else if (selectedPeriod === 'last1') {
      let lastMonth = month - 1
      let lastYear = year
      if (lastMonth === 0) {
        lastMonth = 12
        lastYear -= 1
      }
      return { periodYear: lastYear, periodMonth: lastMonth }
    } else if (selectedPeriod === 'last3') {
      // For multi-month periods, use the most recent month in the range
      let lastMonth = month - 1
      let lastYear = year
      if (lastMonth === 0) {
        lastMonth = 12
        lastYear -= 1
      }
      return { periodYear: lastYear, periodMonth: lastMonth }
    } else if (selectedPeriod === 'last6') {
      // For multi-month periods, use the most recent month in the range
      let lastMonth = month - 1
      let lastYear = year
      if (lastMonth === 0) {
        lastMonth = 12
        lastYear -= 1
      }
      return { periodYear: lastYear, periodMonth: lastMonth }
    }
    return { periodYear: year, periodMonth: month }
  }, [selectedPeriod, year, month])

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

  // Get category impact analysis based on selected period
  const categoryImpact = useCategoryImpact(transactions, budgets, categories, periodYear, periodMonth)

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

  // Calculate spending insights (excluding fixed costs for better behavior analysis)
  const spendingInsights = React.useMemo(() => {
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const daysInMonth = new Date(year, month, 0).getDate()
    const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth

    // Get current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    })

    // Get current month budgets
    const currentMonthBudgets = budgets.filter(b => b.year === year && b.month === month && b.type === 'expense')

    // Calculate budgeted amounts for fixed and variable costs
    const fixedBudgeted = currentMonthBudgets
      .filter(b => b.isFixedCost)
      .reduce((sum, b) => sum + b.amount, 0)
    const variableBudgeted = currentMonthBudgets
      .filter(b => !b.isFixedCost)
      .reduce((sum, b) => sum + b.amount, 0)

    // Helper function to check if a transaction is a fixed cost based on its budget
    const isTransactionFixedCost = (transaction: Transaction): boolean => {
      if (transaction.type !== 'expense') return false

      // Find matching budget for this transaction's category
      const matchingBudget = budgets.find(b => {
        if (b.type !== 'expense') return false
        if (b.year !== year || b.month !== month) return false

        // Match by subcategory if available, otherwise by group
        if (transaction.subgroupId) {
          return b.groupId === transaction.groupId && b.subgroupId === transaction.subgroupId
        } else {
          return b.groupId === transaction.groupId && !b.subgroupId
        }
      })

      return matchingBudget?.isFixedCost || false
    }

    // Separate fixed and variable expenses for current month
    const fixedExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && isTransactionFixedCost(t))
      .reduce((sum, t) => sum + t.value, 0)
    const variableExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense' && !isTransactionFixedCost(t))
      .reduce((sum, t) => sum + t.value, 0)

    // Calculate 3-month average spending (excluding fixed costs and current month)
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

      // Exclude fixed costs from historical average for better spending pattern analysis
      const monthSpent = monthTransactions
        .filter(t => {
          if (t.type !== 'expense') return false

          // Check if this transaction is a fixed cost based on its budget
          const matchingBudget = budgets.find(b => {
            if (b.type !== 'expense') return false
            if (b.year !== targetYear || b.month !== targetMonth) return false

            if (t.subgroupId) {
              return b.groupId === t.groupId && b.subgroupId === t.subgroupId
            } else {
              return b.groupId === t.groupId && !b.subgroupId
            }
          })

          return !matchingBudget?.isFixedCost
        })
        .reduce((sum, t) => sum + t.value, 0)

      avgMonthlySpending += monthSpent
      monthsCount++
    }
    avgMonthlySpending = monthsCount > 0 ? avgMonthlySpending / monthsCount : 0

    // Project spending for rest of month based on variable expenses only
    const dailyAverage = daysElapsed > 0 ? variableExpenses / daysElapsed : 0
    const projectedVariableSpending = isCurrentMonth
      ? (dailyAverage * daysInMonth)
      : variableExpenses

    const isOnTrack = variableBudgeted > 0
      ? projectedVariableSpending <= variableBudgeted
      : true

    return {
      totalSpent: variableExpenses, // Only variable expenses for insights
      totalBudgeted: monthSummary.budgetedExpense,
      avgMonthlySpending,
      daysInMonth,
      daysElapsed,
      projectedSpending: projectedVariableSpending, // Project only variable spending
      isOnTrack,
      fixedExpenses, // Pass separately
      fixedBudgeted, // Budgeted fixed costs
      variableBudgeted, // Budgeted variable costs
      totalExpenses: monthSummary.totalExpense, // Total including fixed
    }
  }, [transactions, budgets, monthSummary, year, month])

  return (
    <div className="space-y-6">
      {/* YTD Hero Card */}
      <HeroCard
        title="Economia Acumulada"
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

      {/* Fixed vs Variable Costs Breakdown */}
      {spendingInsights.totalExpenses > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Custos Fixos vs Variáveis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📌</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Custos Fixos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(spendingInsights.fixedExpenses)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                de {formatCurrency(spendingInsights.fixedBudgeted)} orçado
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {spendingInsights.totalExpenses > 0 ? ((spendingInsights.fixedExpenses / spendingInsights.totalExpenses) * 100).toFixed(0) : 0}% do total
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💸</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Gastos Variáveis</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(spendingInsights.totalSpent)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                de {formatCurrency(spendingInsights.variableBudgeted)} orçado
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {spendingInsights.totalExpenses > 0 ? ((spendingInsights.totalSpent / spendingInsights.totalExpenses) * 100).toFixed(0) : 0}% do total
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Insights */}
        <SpendingInsights
          totalSpent={spendingInsights.totalSpent}
          totalBudgeted={spendingInsights.variableBudgeted}
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

      {/* Category Impact Analysis with Period Selector */}
      <CategoryImpactAnalysis
        categoryImpacts={categoryImpact.categoryImpacts}
        topSpenders={categoryImpact.topSpenders}
        trendingUp={categoryImpact.trendingUp}
        trendingDown={categoryImpact.trendingDown}
        totalSpent={categoryImpact.totalSpent}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        periodYear={periodYear}
        periodMonth={periodMonth}
        currentYear={year}
        currentMonth={month}
      />

    </div>
  )
}
