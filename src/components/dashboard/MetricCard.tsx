import React from 'react'

interface MetricCardProps {
  label: string
  value: number | string
  sublabel?: string
  status?: 'positive' | 'negative' | 'neutral'
  icon?: string
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  sublabel,
  status = 'neutral',
  icon,
  size = 'medium',
  onClick,
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'positive':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
      case 'negative':
        return 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getValueSize = () => {
    switch (size) {
      case 'small':
        return 'text-xl'
      case 'large':
        return 'text-4xl'
      default:
        return 'text-2xl'
    }
  }

  const getValueColor = () => {
    switch (status) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-900 dark:text-white'
    }
  }

  return (
    <div
      className={`card p-6 border ${getStatusColors()} transition-all ${
        onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      {/* Value */}
      <div className={`${getValueSize()} font-bold ${getValueColor()} mb-1`}>
        {value}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {sublabel}
        </p>
      )}
    </div>
  )
}
