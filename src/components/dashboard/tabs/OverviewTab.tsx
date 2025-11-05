import React from 'react'
import { Transaction, Budget, Category } from '@/types'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { TrendSparkline } from '@/components/dashboard/TrendSparkline'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { useYTDCalculations } from '@/hooks/useYTDCalculations'
import { useAlerts } from '@/hooks/useAlerts'
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
  const { monthSummary, groupSummaries } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    year,
    month
  )

  // Get alerts
  const alerts = useAlerts(transactions, budgets, categories, year, month)

  // Calculate last 3 months trend
  const last3MonthsBalance = React.useMemo(() => {
    const balances: number[] = []
    for (let i = 2; i >= 0; i--) {
      let targetMonth = month - i
      let targetYear = year

      if (targetMonth <= 0) {
        targetMonth += 12
        targetYear -= 1
      }

      const monthTrans = transactions.filter(t => {
        const date = new Date(t.date)
        return date.getFullYear() === targetYear && date.getMonth() + 1 === targetMonth
      })

      const income = monthTrans.filter(t => t.type === 'earning').reduce((sum, t) => sum + t.value, 0)
      const expense = monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0)
      balances.push(income - expense)
    }
    return balances
  }, [transactions, year, month])

  // Determine trend
  const trend = React.useMemo(() => {
    if (last3MonthsBalance.length < 2) return 'neutral'
    const lastMonth = last3MonthsBalance[last3MonthsBalance.length - 1]
    const previousMonth = last3MonthsBalance[last3MonthsBalance.length - 2]
    if (lastMonth > previousMonth) return 'up'
    if (lastMonth < previousMonth) return 'down'
    return 'neutral'
  }, [last3MonthsBalance])

  // Top 5 spending categories
  const topCategories = React.useMemo(() => {
    return groupSummaries
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5)
  }, [groupSummaries])

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
        {/* Top Categories */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Principais Categorias
          </h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((category) => {
                const percentage = category.budgeted > 0
                  ? (category.actual / category.budgeted) * 100
                  : 0
                const isOverBudget = percentage > 100

                return (
                  <div key={category.groupId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category.groupName}
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(category.actual)}
                        </span>
                      </div>
                      {category.budgeted > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhuma despesa registrada este mês
            </p>
          )}
        </div>

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

      {/* Alerts & Recommendations */}
      {alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Alertas & Recomendações
          </h3>
          <AlertBanner alerts={alerts} maxVisible={5} />
        </div>
      )}

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
