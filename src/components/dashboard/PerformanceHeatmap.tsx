import React from 'react'
import { getMonthName } from '@/utils/date'
import { formatCurrency } from '@/utils/format'

export interface MonthPerformanceData {
  month: number
  value: number
  budgeted: number
  status: 'excellent' | 'good' | 'warning' | 'danger' | 'neutral'
}

interface PerformanceHeatmapProps {
  data: MonthPerformanceData[]
  year: number
  onMonthClick?: (month: number) => void
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  data,
  year,
  onMonthClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-600 dark:bg-green-500 border-green-700 dark:border-green-600'
      case 'good':
        return 'bg-green-400 dark:bg-green-600 border-green-500 dark:border-green-700'
      case 'warning':
        return 'bg-amber-400 dark:bg-amber-600 border-amber-500 dark:border-amber-700'
      case 'danger':
        return 'bg-red-500 dark:bg-red-600 border-red-600 dark:border-red-700'
      default:
        return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    }
  }

  const getTextColor = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
      case 'warning':
      case 'danger':
        return 'text-white'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Desempenho Mensal {year}
      </h3>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {data.map((monthData) => {
          const monthName = getMonthName(monthData.month)
          const savings = monthData.value - monthData.budgeted
          const percentage = monthData.budgeted > 0
            ? ((monthData.value - monthData.budgeted) / Math.abs(monthData.budgeted)) * 100
            : 0

          return (
            <button
              key={monthData.month}
              onClick={() => onMonthClick?.(monthData.month)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${getStatusColor(monthData.status)}
                ${onMonthClick ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : ''}
                ${getTextColor(monthData.status)}
              `}
              title={`${monthName}: ${formatCurrency(savings)} de saldo`}
            >
              {/* Month Name */}
              <div className="text-xs font-semibold mb-2 uppercase tracking-wider opacity-90">
                {monthName.substring(0, 3)}
              </div>

              {/* Value */}
              <div className="text-lg font-bold mb-1">
                {formatCurrency(monthData.value)}
              </div>

              {/* Status Badge */}
              <div className="text-xs font-medium opacity-90">
                {monthData.status === 'excellent' && '🌟 Excelente'}
                {monthData.status === 'good' && '✓ Bom'}
                {monthData.status === 'warning' && '⚠ Atenção'}
                {monthData.status === 'danger' && '⚠ Crítico'}
                {monthData.status === 'neutral' && '- Sem dados'}
              </div>

              {/* Percentage indicator */}
              {monthData.budgeted > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  {percentage >= 0 ? '+' : ''}{percentage.toFixed(0)}%
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
          Legenda
        </h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600 border-2 border-green-700" />
            <span className="text-gray-700 dark:text-gray-300">Excelente (Acima da meta)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400 border-2 border-green-500" />
            <span className="text-gray-700 dark:text-gray-300">Bom (No orçamento)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-400 border-2 border-amber-500" />
            <span className="text-gray-700 dark:text-gray-300">Atenção (Próximo ao limite)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500 border-2 border-red-600" />
            <span className="text-gray-700 dark:text-gray-300">Crítico (Acima do orçamento)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
