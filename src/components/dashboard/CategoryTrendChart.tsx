import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CategoryTrend } from '@/hooks/useTrendCalculations'
import { formatCurrency } from '@/utils/format'

interface CategoryTrendChartProps {
  categoryTrends: CategoryTrend[]
  title?: string
}

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
]

export const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({
  categoryTrends,
  title = 'Tendência de Gastos por Categoria',
}) => {
  if (categoryTrends.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Sem dados de categorias para exibir
        </div>
      </div>
    )
  }

  // Transform data for chart
  // Get all unique months from the first category (all categories should have the same months)
  const months = categoryTrends[0].data.map((d) => `${d.monthName.substring(0, 3)}/${d.year}`)

  // Create chart data structure
  const chartData = categoryTrends[0].data.map((_, index) => {
    const dataPoint: any = {
      month: months[index],
    }

    categoryTrends.forEach((trend) => {
      dataPoint[trend.categoryName] = trend.data[index].value
    })

    return dataPoint
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.month}
          </p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Evolução dos gastos nas principais categorias
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {categoryTrends.map((trend, index) => (
            <Line
              key={trend.categoryId}
              type="monotone"
              dataKey={trend.categoryName}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Category Summary */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTrends.map((trend, index) => {
          const trendIcon =
            trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'
          const trendColor =
            trend.trend === 'up'
              ? 'text-red-600 dark:text-red-400'
              : trend.trend === 'down'
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'

          return (
            <div
              key={trend.categoryId}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {trend.categoryName}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Média: {formatCurrency(trend.average)}</div>
                <div className={`flex items-center gap-1 ${trendColor}`}>
                  <span>{trendIcon}</span>
                  <span>
                    {trend.trend === 'stable'
                      ? 'Estável'
                      : `${Math.abs(trend.percentageChange).toFixed(0)}% ${
                          trend.trend === 'up' ? 'aumento' : 'redução'
                        }`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
