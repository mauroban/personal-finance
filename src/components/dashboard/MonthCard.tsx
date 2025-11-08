import React from 'react'
import { formatCurrency } from '@/utils/format'

interface MonthCardProps {
  monthName: string
  income: number
  expense: number
  budgetedIncome: number
  budgetedExpense: number
  netBalance: number
  incomeVariance: number
  expenseVariance: number
  isFuture: boolean
  onClick: () => void
}

export const MonthCard: React.FC<MonthCardProps> = ({
  monthName,
  income,
  expense,
  budgetedIncome,
  budgetedExpense,
  netBalance,
  incomeVariance,
  expenseVariance,
  isFuture,
  onClick,
}) => {
  // Determine card background color based on balance
  const bgColor = isFuture
    ? 'bg-gray-50'
    : netBalance >= 0
    ? 'bg-green-50'
    : 'bg-red-50'

  const borderColor = isFuture
    ? 'border-gray-200'
    : netBalance >= 0
    ? 'border-green-200'
    : 'border-red-200'

  return (
    <div
      onClick={onClick}
      className={`${bgColor} ${borderColor} border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md active:scale-98 ${
        isFuture ? 'opacity-50' : ''
      }`}
    >
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
        {!isFuture && (
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              netBalance >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {netBalance >= 0 ? '✓ Positivo' : '⚠️ Negativo'}
          </div>
        )}
      </div>

      {/* Net Balance - Prominent */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Saldo Líquido</div>
        <div
          className={`text-2xl font-bold ${
            isFuture
              ? 'text-gray-400'
              : netBalance >= 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {isFuture ? '-' : formatCurrency(netBalance)}
        </div>
      </div>

      {/* Income & Expense */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Income */}
        <div>
          <div className="text-xs text-gray-600 mb-1">Receita</div>
          <div className="text-sm font-semibold text-green-600">
            {isFuture ? '-' : formatCurrency(income)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Meta: {formatCurrency(budgetedIncome)}
          </div>
          {!isFuture && (
            <div
              className={`text-xs font-medium mt-1 ${
                incomeVariance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {incomeVariance >= 0 ? '↑' : '↓'}{' '}
              {formatCurrency(Math.abs(incomeVariance))}
            </div>
          )}
        </div>

        {/* Expense */}
        <div>
          <div className="text-xs text-gray-600 mb-1">Despesa</div>
          <div className="text-sm font-semibold text-red-600">
            {isFuture ? '-' : formatCurrency(expense)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Meta: {formatCurrency(budgetedExpense)}
          </div>
          {!isFuture && (
            <div
              className={`text-xs font-medium mt-1 ${
                expenseVariance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {expenseVariance >= 0 ? '↓' : '↑'}{' '}
              {formatCurrency(Math.abs(expenseVariance))}
            </div>
          )}
        </div>
      </div>

      {/* Tap to view hint */}
      <div className="text-xs text-gray-500 text-center mt-2 pt-2 border-t border-gray-200">
        Tocar para ver detalhes →
      </div>
    </div>
  )
}
