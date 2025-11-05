import React, { useState } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { SegmentedControl, SegmentedControlOption } from '@/components/common/SegmentedControl'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { CategoryTrendChart } from '@/components/dashboard/CategoryTrendChart'
import { VarianceAreaChart } from '@/components/dashboard/VarianceAreaChart'
import { InsightsList } from '@/components/dashboard/InsightsList'
import { useTrendCalculations } from '@/hooks/useTrendCalculations'
import { formatCurrency } from '@/utils/format'

interface TrendsTabProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
  month: number
}

export const TrendsTab: React.FC<TrendsTabProps> = ({
  transactions,
  budgets,
  categories,
  year,
  month,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6')

  const handlePeriodChange = (newPeriod: string) => {
    // Save current scroll position
    const scrollY = window.scrollY
    setSelectedPeriod(newPeriod)
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY)
    })
  }

  const periodOptions: SegmentedControlOption<string>[] = [
    { value: '3', label: '3 Meses' },
    { value: '6', label: '6 Meses' },
    { value: '12', label: '12 Meses' },
  ]

  const monthsBack = parseInt(selectedPeriod) as 3 | 6 | 12

  const trendData = useTrendCalculations(
    transactions,
    budgets,
    categories,
    year,
    month,
    monthsBack
  )

  // Get top spending categories
  const topCategories = [...trendData.categoryTrends]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Calculate month-over-month change for last period
  const recentSavings = trendData.savingsTrend.slice(-2)
  const savingsMoM = recentSavings.length === 2
    ? ((recentSavings[1].savings - recentSavings[0].savings) / Math.abs(recentSavings[0].savings || 1)) * 100
    : 0

  const adherenceStatus = trendData.budgetAdherence >= 70 ? 'positive' : trendData.budgetAdherence >= 50 ? 'neutral' : 'negative'

  return (
    <div className="space-y-6">
      {/* Period Selector and Metrics */}
      <div className="space-y-4">
        <div className="flex justify-center sm:justify-end">
          <SegmentedControl
            options={periodOptions}
            value={selectedPeriod}
            onChange={handlePeriodChange}
            size="md"
          />
        </div>

        {/* Trend Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Economia Média Mensal"
          value={formatCurrency(trendData.periodSummary.averageMonthlySavings)}
          sublabel={`${savingsMoM >= 0 ? '+' : ''}${savingsMoM.toFixed(1)}% vs mês anterior`}
          status={savingsMoM >= 0 ? 'positive' : 'negative'}
          icon="💰"
          size="medium"
        />
        <MetricCard
          label="Aderência ao Orçamento"
          value={`${trendData.budgetAdherence.toFixed(0)}%`}
          sublabel={
            trendData.budgetAdherence >= 70
              ? 'Excelente controle'
              : trendData.budgetAdherence >= 50
              ? 'Bom controle'
              : 'Precisa melhorar'
          }
          status={adherenceStatus}
          icon="🎯"
          size="medium"
        />
        <MetricCard
          label="Total Economizado"
          value={formatCurrency(trendData.periodSummary.totalSavings)}
          sublabel={`Nos últimos ${monthsBack} meses`}
          status={trendData.periodSummary.totalSavings >= 0 ? 'positive' : 'negative'}
          icon="📊"
          size="medium"
        />
        </div>
      </div>

      {/* Category Trend Chart */}
      {topCategories.length > 0 && (
        <CategoryTrendChart categoryTrends={topCategories} />
      )}

      {/* Variance Area Chart */}
      <VarianceAreaChart varianceTrend={trendData.varianceTrend} />

      {/* Insights & Patterns */}
      <InsightsList insights={trendData.insights} />

      {/* Summary Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumo do Período
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meses Analisados</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {trendData.periodSummary.monthsAnalyzed}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Receitas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(trendData.periodSummary.totalIncome)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Despesas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(trendData.periodSummary.totalExpense)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Saldo Acumulado</p>
            <p className={`text-2xl font-bold ${
              trendData.periodSummary.totalSavings >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(trendData.periodSummary.totalSavings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
