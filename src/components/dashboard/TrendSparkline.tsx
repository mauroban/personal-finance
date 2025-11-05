import React from 'react'

interface TrendSparklineProps {
  data: number[]
  trend: 'up' | 'down' | 'neutral'
  color?: string
  height?: number
  showLabel?: boolean
  label?: string
}

export const TrendSparkline: React.FC<TrendSparklineProps> = ({
  data,
  trend,
  color,
  height = 40,
  showLabel = true,
  label,
}) => {
  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500">
        Dados insuficientes
      </div>
    )
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  // Calculate points for the sparkline
  const width = 100
  const pointSpacing = width / (data.length - 1 || 1)

  const points = data.map((value, index) => {
    const x = index * pointSpacing
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const getTrendColor = () => {
    if (color) return color
    switch (trend) {
      case 'up':
        return '#22c55e' // green-500
      case 'down':
        return '#ef4444' // red-500
      default:
        return '#6b7280' // gray-500
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  const getTrendText = () => {
    if (trend === 'up') return 'Melhorando'
    if (trend === 'down') return 'Piorando'
    return 'Estável'
  }

  const lineColor = getTrendColor()

  return (
    <div className="flex flex-col space-y-2">
      {/* SVG Sparkline */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height: `${height}px` }}
      >
        {/* Area fill */}
        <defs>
          <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Fill area under line */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#gradient-${trend})`}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((value, index) => {
          const x = index * pointSpacing
          const y = height - ((value - min) / range) * height
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={lineColor}
            />
          )
        })}
      </svg>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            {label || 'Últimos meses'}
          </span>
          <span
            className={`font-medium flex items-center gap-1 ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {getTrendIcon()} {getTrendText()}
          </span>
        </div>
      )}
    </div>
  )
}
