import React from 'react'
import { formatCurrency } from '@/utils/format'

interface SummaryCardProps {
  title: string
  budgeted: number
  actual: number
  type: 'income' | 'expense'
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, budgeted, actual, type }) => {
  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0
  const isOverBudget = type === 'expense' && actual > budgeted
  const isUnderIncome = type === 'income' && actual < budgeted

  return (
    <div className="card p-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Previsto:</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(budgeted)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Realizado:</span>
          <span
            className={`text-2xl font-bold ${
              type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(actual)}
          </span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">
              {percentage.toFixed(1)}%
            </span>
            <span className={`text-xs font-medium ${
              (isOverBudget || isUnderIncome) ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(budgeted - actual)} restante
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (isOverBudget || isUnderIncome)
                  ? 'bg-red-500'
                  : type === 'income'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
