import React from 'react'
import { formatCurrency, formatPercentage } from '@/utils/format'

interface SummaryCardProps {
  title: string
  budgeted: number
  actual: number
  type: 'income' | 'expense' | 'balance'
  icon?: string
  onClick?: () => void
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  budgeted,
  actual,
  type,
  icon,
  onClick
}) => {
  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0

  // 5% tolerance: expenses up to 105% of budget are considered "within budget"
  const isOverBudget = type === 'expense' && percentage > 105

  // For income: under 95% is bad (warning), over 105% is celebrated
  const isUnderIncome = type === 'income' && percentage < 95
  const isOverIncome = type === 'income' && percentage > 105

  const hasIssue = isOverBudget || isUnderIncome

  const getCardColors = () => {
    if (type === 'balance') {
      return 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
    }
    if (hasIssue) {
      return 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
    }
    if (type === 'income') {
      return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
    }
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }

  const getActualValueColor = () => {
    if (type === 'balance') {
      return actual >= 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400'
    }
    if (type === 'income') {
      return 'text-green-600 dark:text-green-400'
    }
    return 'text-gray-900 dark:text-white'
  }

  const getProgressBarColor = () => {
    if (hasIssue) {
      return 'bg-gradient-to-r from-red-500 to-rose-600'
    }
    if (type === 'income') {
      return 'bg-gradient-to-r from-green-500 to-emerald-600'
    }
    if (type === 'balance') {
      return 'bg-gradient-to-r from-blue-500 to-indigo-600'
    }
    return 'bg-gradient-to-r from-blue-500 to-indigo-600'
  }

  const getStatusIcon = () => {
    if (type === 'balance') {
      return actual >= 0 ? '✓' : '⚠'
    }
    if (isOverIncome) {
      return '🎉' // Celebrating extra income!
    }
    if (hasIssue) {
      return '⚠'
    }
    return '✓'
  }

  const getStatusLabel = () => {
    if (type === 'balance') {
      return actual >= 0 ? 'Positivo' : 'Negativo'
    }
    if (isOverIncome) {
      return 'Acima do esperado' // This is good!
    }
    if (isUnderIncome) {
      return 'Abaixo do esperado'
    }
    if (isOverBudget) {
      return 'Acima do orçamento'
    }
    return 'No orçamento'
  }

  return (
    <div
      className={`card p-6 border ${getCardColors()} transition-all duration-300 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        {icon && <span className="text-3xl opacity-80">{icon}</span>}
      </div>

      {/* Main values */}
      <div className="space-y-3">
        {type !== 'balance' && (
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Previsto</span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(budgeted)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {type === 'balance' ? 'Saldo' : 'Realizado'}
          </span>
          <span className={`text-3xl font-bold ${getActualValueColor()} transition-colors`}>
            {formatCurrency(actual)}
          </span>
        </div>

        {type !== 'balance' && (
          <>
            {/* Status badge */}
            <div className="flex items-center gap-2 pt-2">
              <span className={`text-sm ${
                isOverIncome
                  ? 'text-green-600 dark:text-green-400'
                  : hasIssue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {getStatusIcon()}
              </span>
              <span className={`text-xs font-medium ${
                isOverIncome
                  ? 'text-green-600 dark:text-green-400'
                  : hasIssue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {getStatusLabel()}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {formatPercentage(percentage)}
              </span>
            </div>

            {/* Enhanced progress bar */}
            <div className="pt-1">
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {type === 'income' ? 'Recebido' : 'Gasto'}
                </span>
                <span className={`text-xs font-semibold ${
                  type === 'income'
                    ? (actual >= budgeted ? 'text-green-600 dark:text-green-400' : 'text-lime-600 dark:text-lime-400')
                    : (actual <= budgeted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
                }`}>
                  {type === 'income'
                    ? (actual >= budgeted
                        ? `+${formatCurrency(Math.abs(actual - budgeted))} a mais`
                        : `${formatCurrency(Math.abs(budgeted - actual))} falta receber`)
                    : (actual <= budgeted
                        ? `${formatCurrency(Math.abs(budgeted - actual))} restante`
                        : `+${formatCurrency(Math.abs(actual - budgeted))} acima`)
                  }
                </span>
              </div>
            </div>
          </>
        )}

        {/* Balance type specific info */}
        {type === 'balance' && budgeted > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Meta de economia
              </span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatCurrency(budgeted)}
              </span>
            </div>
            {budgeted > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {actual >= budgeted ? 'Acima da meta' : 'Falta economizar'}
                </span>
                <span className={`text-xs font-semibold ${
                  actual >= budgeted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-lime-600 dark:text-lime-400'
                }`}>
                  {formatCurrency(Math.abs(actual - budgeted))}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
