import React from 'react'
import { formatCurrency } from '@/utils/format'

interface HeroCardProps {
  title: string
  value: number
  target: number
  percentage: number
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export const HeroCard: React.FC<HeroCardProps> = ({
  title,
  value,
  target,
  percentage,
  trend = 'neutral',
  subtitle,
}) => {
  const isOnTrack = percentage >= 50
  const isExceeding = percentage >= 100

  const getTrendEmoji = () => {
    if (trend === 'up') return '📈'
    if (trend === 'down') return '📉'
    return '💰'
  }

  const getStatusColor = () => {
    if (isExceeding) return 'from-green-500 to-emerald-600'
    if (isOnTrack) return 'from-blue-500 to-indigo-600'
    return 'from-amber-500 to-orange-600'
  }

  const getStatusText = () => {
    if (isExceeding) return 'Parabéns! Meta superada!'
    if (isOnTrack) return 'Você está no caminho certo!'
    return 'Continue se esforçando!'
  }

  return (
    <div className="card p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {subtitle || 'Progresso no ano'}
          </p>
        </div>
        <span className="text-4xl">{getTrendEmoji()}</span>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
          {formatCurrency(value)}
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-400">
          de {formatCurrency(target)} meta anual
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span className={`text-sm font-bold ${
            isExceeding
              ? 'text-green-600 dark:text-green-400'
              : isOnTrack
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Exceed marker if over 100% */}
          {percentage > 100 && (
            <div
              className="absolute top-0 h-full w-1 bg-white/50"
              style={{ left: '100%', transform: 'translateX(-50%)' }}
            />
          )}
        </div>

        {/* Status Message */}
        <div className={`text-center py-2 rounded-lg font-medium text-sm ${
          isExceeding
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : isOnTrack
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
        }`}>
          {getStatusText()}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Falta atingir</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {target > value ? formatCurrency(target - value) : 'Meta atingida! 🎉'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Média mensal</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(value / new Date().getMonth() || 1)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Add shimmer animation to global CSS or Tailwind config
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
