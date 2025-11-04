import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useYearlyCalculations } from '@/hooks/useYearlyCalculations'
import { Transaction, Budget, Category } from '@/types'
import { formatCurrency } from '@/utils/format'

interface MonthlyTrendChartProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  transactions,
  budgets,
  categories,
  year,
}) => {
  const { yearlySummary } = useYearlyCalculations(transactions, budgets, categories, year)

  const chartData = yearlySummary.monthlyBreakdowns.map(breakdown => ({
    month: breakdown.monthName.substring(0, 3),
    'Receita Planejada': breakdown.budgetedIncome,
    'Receita Real': breakdown.income,
    'Despesa Planejada': breakdown.budgetedExpense,
    'Despesa Real': breakdown.expense,
    'Saldo': breakdown.netBalance,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {payload[0].payload.month}
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tendência Mensal {year}
      </h2>

      <div className="space-y-8">
        {/* Income vs Expense Line Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Receitas e Despesas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Receita Planejada"
                stroke="#86efac"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#86efac', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Receita Real"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Despesa Planejada"
                stroke="#fca5a5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#fca5a5', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Despesa Real"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Net Balance Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Saldo Mensal
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="Saldo"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
