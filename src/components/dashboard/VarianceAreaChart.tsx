import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { VariancePoint } from '@/hooks/useTrendCalculations'
import { formatCurrency } from '@/utils/format'
import { TooltipProps, AreaChartEntry } from '@/types/recharts'

interface VarianceAreaChartProps {
  varianceTrend: VariancePoint[]
  title?: string
}

export const VarianceAreaChart: React.FC<VarianceAreaChartProps> = ({
  varianceTrend,
  title = 'Variação: Orçado vs. Realizado',
}) => {
  if (varianceTrend.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Sem dados de variação para exibir
        </div>
      </div>
    )
  }

  // Transform data for chart with separate positive/negative values
  const chartData: AreaChartEntry[] = varianceTrend.map((point) => ({
    month: `${point.monthName.substring(0, 3)}/${point.year}`,
    variance: point.variance,
    positiveVariance: point.variance >= 0 ? point.variance : 0,
    negativeVariance: point.variance < 0 ? point.variance : 0,
    budgeted: point.budgeted,
    actual: point.actual,
  }))

  const CustomTooltip = ({ active, payload }: TooltipProps<AreaChartEntry>) => {
    if (active && payload && payload.length) {
      const variance = payload[0].value
      const isPositive = variance >= 0

      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.month}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Orçado: {formatCurrency(payload[0].payload.budgeted)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Realizado: {formatCurrency(payload[0].payload.actual)}
            </p>
            <p
              className={`font-semibold ${
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              Variação: {isPositive ? '+' : ''}
              {formatCurrency(variance)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Calculate summary stats
  const totalVariance = varianceTrend.reduce((sum, point) => sum + point.variance, 0)
  const positiveMonths = varianceTrend.filter((point) => point.variance >= 0).length
  const totalMonths = varianceTrend.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Área positiva = economia além do orçado | Área negativa = gasto acima do orçado
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Reference line at 0 */}
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

          {/* Area for variance - split into positive and negative */}
          <Area
            type="monotone"
            dataKey="positiveVariance"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorPositive)"
            name="Variação Positiva"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="negativeVariance"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorNegative)"
            name="Variação Negativa"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Variação Total
          </div>
          <div
            className={`text-xl font-bold ${
              totalVariance >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {totalVariance >= 0 ? '+' : ''}
            {formatCurrency(totalVariance)}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Meses Positivos</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {positiveMonths}/{totalMonths}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {((positiveMonths / totalMonths) * 100).toFixed(0)}% dos meses
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Variação Média</div>
          <div
            className={`text-xl font-bold ${
              totalVariance / totalMonths >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {totalVariance / totalMonths >= 0 ? '+' : ''}
            {formatCurrency(totalVariance / totalMonths)}
          </div>
        </div>
      </div>
    </div>
  )
}
