import React from 'react'
import { Budget, Category, Source } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getMonthName } from '@/utils/date'

interface YearlyBudgetOverviewProps {
  budgets: Budget[]
  categories: Category[]
  sources: Source[] // Not used yet but reserved for future income breakdown by source
  year: number
  onMonthClick: (month: number) => void
}

export const YearlyBudgetOverview: React.FC<YearlyBudgetOverviewProps> = ({
  budgets,
  categories,
  sources: _sources, // Reserved for future use
  year,
  onMonthClick,
}) => {
  const parentCategories = categories.filter(c => !c.parentId)

  const getMonthBudgets = (month: number) => {
    const monthBudgets = budgets.filter(b => b.year === year && b.month === month)

    const income = monthBudgets
      .filter(b => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0)

    const expense = monthBudgets
      .filter(b => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0)

    return { income, expense, balance: income - expense, hasData: monthBudgets.length > 0 }
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Visão Geral do Orçamento {year}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Clique em qualquer mês para editar o orçamento detalhado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month) => {
            const monthData = getMonthBudgets(month)
            const isPositive = monthData.balance >= 0

            return (
              <div
                key={month}
                onClick={() => onMonthClick(month)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  monthData.hasData
                    ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-500'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 hover:border-gray-400'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {getMonthName(month)}
                </h3>

                {monthData.hasData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-600 dark:text-green-400">Receitas:</span>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {formatCurrency(monthData.income)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600 dark:text-red-400">Despesas:</span>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {formatCurrency(monthData.expense)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Saldo:</span>
                        <span className={`text-sm font-bold ${
                          isPositive
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {formatCurrency(monthData.balance)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sem orçamento
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Clique para criar
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Overview Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Orçamento por Categoria
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Categoria
                </th>
                {months.map((month) => (
                  <th
                    key={month}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"
                  >
                    {getMonthName(month).substring(0, 3)}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Total Ano
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Income Row */}
              <tr className="bg-green-50 dark:bg-green-900/20">
                <td className="px-4 py-3 text-sm font-semibold text-green-900 dark:text-green-100">
                  Receitas
                </td>
                {months.map((month) => {
                  const monthData = getMonthBudgets(month)
                  return (
                    <td
                      key={month}
                      onClick={() => onMonthClick(month)}
                      className="px-2 py-3 text-center text-xs text-green-700 dark:text-green-300 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/40"
                    >
                      {monthData.income > 0 ? formatCurrency(monthData.income) : '-'}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right text-sm font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(
                    months.reduce((sum, m) => sum + getMonthBudgets(m).income, 0)
                  )}
                </td>
              </tr>

              {/* Expense Categories */}
              {parentCategories.map((category) => {
                const yearTotal = months.reduce((sum, month) => {
                  const budget = budgets.find(
                    b => b.year === year && b.month === month && b.groupId === category.id && b.type === 'expense'
                  )
                  return sum + (budget?.amount || 0)
                }, 0)

                if (yearTotal === 0) return null

                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </td>
                    {months.map((month) => {
                      const budget = budgets.find(
                        b => b.year === year && b.month === month && b.groupId === category.id && b.type === 'expense'
                      )
                      return (
                        <td
                          key={month}
                          onClick={() => onMonthClick(month)}
                          className="px-2 py-3 text-center text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {budget ? formatCurrency(budget.amount) : '-'}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(yearTotal)}
                    </td>
                  </tr>
                )
              })}

              {/* Total Expenses Row */}
              <tr className="bg-red-50 dark:bg-red-900/20">
                <td className="px-4 py-3 text-sm font-semibold text-red-900 dark:text-red-100">
                  Total Despesas
                </td>
                {months.map((month) => {
                  const monthData = getMonthBudgets(month)
                  return (
                    <td
                      key={month}
                      onClick={() => onMonthClick(month)}
                      className="px-2 py-3 text-center text-xs text-red-700 dark:text-red-300 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40"
                    >
                      {monthData.expense > 0 ? formatCurrency(monthData.expense) : '-'}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right text-sm font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(
                    months.reduce((sum, m) => sum + getMonthBudgets(m).expense, 0)
                  )}
                </td>
              </tr>

              {/* Balance Row */}
              <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                <td className="px-4 py-3 text-sm text-blue-900 dark:text-blue-100">
                  Saldo Planejado
                </td>
                {months.map((month) => {
                  const monthData = getMonthBudgets(month)
                  return (
                    <td
                      key={month}
                      className={`px-2 py-3 text-center text-xs ${
                        monthData.balance >= 0
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {monthData.hasData ? formatCurrency(monthData.balance) : '-'}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right text-sm text-blue-700 dark:text-blue-300">
                  {formatCurrency(
                    months.reduce((sum, m) => sum + getMonthBudgets(m).balance, 0)
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
