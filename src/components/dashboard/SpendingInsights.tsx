import React from 'react'
import { formatCurrency } from '@/utils/format'

interface SpendingInsightsProps {
  totalSpent: number
  totalBudgeted: number
  avgMonthlySpending: number
  daysInMonth: number
  daysElapsed: number
  projectedSpending: number
  isOnTrack: boolean
}

export const SpendingInsights: React.FC<SpendingInsightsProps> = ({
  totalSpent,
  totalBudgeted,
  avgMonthlySpending,
  daysInMonth,
  daysElapsed,
  projectedSpending,
  isOnTrack: _isOnTrack,
}) => {
  const dailyAverage = daysElapsed > 0 ? totalSpent / daysElapsed : 0
  const remainingBudget = totalBudgeted - totalSpent
  const daysRemaining = daysInMonth - daysElapsed
  const recommendedDailySpend = daysRemaining > 0 && remainingBudget > 0
    ? remainingBudget / daysRemaining
    : 0

  const insights: Array<{
    icon: string
    label: string
    value: string
    sublabel?: string
    color: string
  }> = []

  // Daily spending average
  insights.push({
    icon: '📊',
    label: 'Gasto Médio Diário',
    value: formatCurrency(dailyAverage),
    sublabel: avgMonthlySpending > 0
      ? `Média histórica: ${formatCurrency(avgMonthlySpending / 30)}/dia`
      : undefined,
    color: 'text-blue-600 dark:text-blue-400',
  })

  // Budget pace
  if (totalBudgeted > 0) {
    const budgetUsageRate = (totalSpent / totalBudgeted) * 100
    const timeElapsedRate = (daysElapsed / daysInMonth) * 100
    const paceComparison = budgetUsageRate - timeElapsedRate

    if (Math.abs(paceComparison) <= 5) {
      insights.push({
        icon: '✓',
        label: 'Ritmo de Gastos',
        value: 'No alvo!',
        sublabel: `${budgetUsageRate.toFixed(0)}% usado em ${timeElapsedRate.toFixed(0)}% do mês`,
        color: 'text-green-600 dark:text-green-400',
      })
    } else if (paceComparison > 5) {
      insights.push({
        icon: '⚡',
        label: 'Ritmo de Gastos',
        value: 'Acelerado',
        sublabel: `${budgetUsageRate.toFixed(0)}% usado em ${timeElapsedRate.toFixed(0)}% do mês`,
        color: 'text-orange-600 dark:text-orange-400',
      })
    } else {
      insights.push({
        icon: '🐢',
        label: 'Ritmo de Gastos',
        value: 'Controlado',
        sublabel: `${budgetUsageRate.toFixed(0)}% usado em ${timeElapsedRate.toFixed(0)}% do mês`,
        color: 'text-blue-600 dark:text-blue-400',
      })
    }
  }

  // Projection
  if (daysElapsed > 0) {
    const projectionDiff = projectedSpending - totalBudgeted

    insights.push({
      icon: '🔮',
      label: 'Projeção do Mês',
      value: formatCurrency(projectedSpending),
      sublabel: totalBudgeted > 0
        ? projectionDiff > 0
          ? `${formatCurrency(Math.abs(projectionDiff))} acima do orçamento`
          : `${formatCurrency(Math.abs(projectionDiff))} abaixo do orçamento`
        : undefined,
      color: projectionDiff > totalBudgeted * 0.1
        ? 'text-red-600 dark:text-red-400'
        : projectionDiff < -totalBudgeted * 0.1
        ? 'text-green-600 dark:text-green-400'
        : 'text-blue-600 dark:text-blue-400',
    })
  }

  // Recommended daily spend
  if (recommendedDailySpend > 0 && daysRemaining > 0) {
    const comparison = dailyAverage - recommendedDailySpend

    insights.push({
      icon: '🎯',
      label: 'Meta Diária Recomendada',
      value: formatCurrency(recommendedDailySpend),
      sublabel: comparison > 0
        ? `Você está gastando ${formatCurrency(comparison)}/dia a mais`
        : `Continue gastando até ${formatCurrency(recommendedDailySpend)}/dia`,
      color: comparison > recommendedDailySpend * 0.2
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-blue-600 dark:text-blue-400',
    })
  }

  // Days remaining
  if (daysRemaining > 0) {
    insights.push({
      icon: '📅',
      label: 'Restam',
      value: `${daysRemaining} dias`,
      sublabel: remainingBudget > 0
        ? `${formatCurrency(remainingBudget)} de orçamento disponível`
        : totalBudgeted > 0
        ? 'Orçamento esgotado'
        : undefined,
      color: remainingBudget > 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400',
    })
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Insights de Custos Variáveis
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-3xl flex-shrink-0 w-10 text-center">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                {insight.label}
              </div>
              <div className={`text-base font-bold ${insight.color}`}>
                {insight.value}
              </div>
              {insight.sublabel && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {insight.sublabel}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
