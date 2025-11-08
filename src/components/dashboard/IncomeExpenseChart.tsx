import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { MonthSummary } from '@/types'
import { TooltipProps } from '@/types/recharts'
import { useDeviceType } from '@/hooks/useMediaQuery'
import { getResponsiveChartHeight, getResponsiveFontSize, getResponsiveLegendConfig, getResponsiveMargin, getResponsiveAxisConfig, shouldShowGrid } from '@/utils/chartConfig'

interface IncomeExpenseChartProps {
  monthSummary: MonthSummary
}

interface ChartData {
  name: string
  Planejado: number
  Real: number
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ monthSummary }) => {
  const { isMobile } = useDeviceType()

  const data: ChartData[] = [
    {
      name: 'Receitas',
      Planejado: monthSummary.budgetedIncome,
      Real: monthSummary.totalIncome,
    },
    {
      name: 'Despesas',
      Planejado: monthSummary.budgetedExpense,
      Real: monthSummary.totalExpense,
    },
  ]

  const CustomTooltip = ({ active, payload }: TooltipProps<ChartData>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.name}
          </p>
          {payload.map((entry, index) => (
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
        Comparativo: Planejado vs Real
      </h3>
      <ResponsiveContainer width="100%" height={getResponsiveChartHeight(isMobile, 300)}>
        <BarChart data={data} layout="horizontal" margin={getResponsiveMargin(isMobile)}>
          {shouldShowGrid(isMobile) && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            {...getResponsiveAxisConfig(isMobile)}
          />
          <YAxis
            type="number"
            stroke="#6b7280"
            tick={{ fontSize: getResponsiveFontSize(isMobile) }}
            tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend {...getResponsiveLegendConfig(isMobile)} />
          <Bar dataKey="Planejado" fill="#93c5fd" radius={isMobile ? [4, 4, 4, 4] : [8, 8, 8, 8]} />
          <Bar dataKey="Real" fill="#3b82f6" radius={isMobile ? [4, 4, 4, 4] : [8, 8, 8, 8]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
