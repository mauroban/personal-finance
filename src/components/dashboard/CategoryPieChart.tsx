import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { TooltipProps } from '@/types/recharts'

interface CategoryPieChartProps {
  data: { name: string; value: number; color: string }[]
  title: string
}

interface ChartDataWithTotal {
  name: string
  value: number
  color: string
  total: number
}

const RADIAN = Math.PI / 180

/**
 * Custom label renderer for pie chart
 * Using Record for props to maintain compatibility with Recharts' PieLabel type
 */
const renderCustomizedLabel = (props: Record<string, unknown>) => {
  const cx = props.cx as number
  const cy = props.cy as number
  const midAngle = props.midAngle as number
  const innerRadius = props.innerRadius as number
  const outerRadius = props.outerRadius as number
  const percent = props.percent as number

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Don't show label if less than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  const CustomTooltip = ({ active, payload }: TooltipProps<ChartDataWithTotal>) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{dataPoint.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(dataPoint.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {((dataPoint.value / dataPoint.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const chartData = data.map(item => ({ ...item, total }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const payload = (entry as unknown as Record<string, unknown>).payload as
                  | ChartDataWithTotal
                  | undefined
                return (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {value}: {formatCurrency(payload?.value || 0)}
                  </span>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          Sem dados disponíveis
        </div>
      )}
    </div>
  )
}
