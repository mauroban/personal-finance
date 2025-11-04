import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/format'
import { MonthSummary } from '@/types'

interface IncomeExpenseChartProps {
  monthSummary: MonthSummary
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ monthSummary }) => {
  const data = [
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.name}
          </p>
          {payload.map((entry: any, index: number) => (
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
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Comparativo: Planejado vs Real
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Planejado" fill="#93c5fd" radius={[8, 8, 8, 8]} />
          <Bar dataKey="Real" fill="#3b82f6" radius={[8, 8, 8, 8]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
