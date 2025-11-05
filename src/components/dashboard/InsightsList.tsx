import React from 'react'
import { TrendInsight } from '@/hooks/useTrendCalculations'

interface InsightsListProps {
  insights: TrendInsight[]
  title?: string
}

export const InsightsList: React.FC<InsightsListProps> = ({
  insights,
  title = 'Insights & Padrões',
}) => {
  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Sem insights disponíveis no momento
        </div>
      </div>
    )
  }

  const getInsightStyle = (type: TrendInsight['type']) => {
    switch (type) {
      case 'achievement':
        return {
          container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-green-900 dark:text-green-100',
        }
      case 'observation':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-900 dark:text-blue-100',
        }
      case 'recommendation':
        return {
          container:
            'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          text: 'text-amber-900 dark:text-amber-100',
        }
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-900 dark:text-gray-100',
        }
    }
  }

  const getInsightTitle = (type: TrendInsight['type']) => {
    switch (type) {
      case 'achievement':
        return 'Conquista'
      case 'observation':
        return 'Observação'
      case 'recommendation':
        return 'Recomendação'
      default:
        return 'Insight'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Análises automáticas baseadas nos seus dados financeiros
      </p>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight.type)

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${style.container} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`text-2xl flex-shrink-0 ${style.icon}`}>{insight.icon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${style.icon}`}>
                      {getInsightTitle(insight.type)}
                    </span>
                  </div>
                  <p className={`text-sm ${style.text}`}>{insight.message}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total de insights:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{insights.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-400">Conquistas:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {insights.filter((i) => i.type === 'achievement').length}
          </span>
        </div>
      </div>
    </div>
  )
}
