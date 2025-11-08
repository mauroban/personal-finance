import React from 'react'
import { Budget, Category, Source } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getMonthName } from '@/utils/date'
import { useDeviceType } from '@/hooks/useMediaQuery'
import { CategoryAccordion } from './CategoryAccordion'

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
  const { isMobile } = useDeviceType()
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Visão Geral do Orçamento {year}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Clique em qualquer mês para editar o orçamento detalhado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month) => {
            const monthData = getMonthBudgets(month)
            const isPositive = monthData.balance >= 0

            return (
              <div
                key={month}
                onClick={() => onMonthClick(month)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                  monthData.hasData
                    ? 'border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:border-blue-500 dark:hover:border-blue-600'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {getMonthName(month)}
                </h3>

                {monthData.hasData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Receitas</span>
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(monthData.income)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Despesas</span>
                      <span className="text-sm font-bold text-red-700 dark:text-red-300">
                        {formatCurrency(monthData.expense)}
                      </span>
                    </div>
                    <div className="pt-2 border-t-2 border-blue-200 dark:border-blue-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Saldo</span>
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
                  <div className="text-center py-6">
                    <div className="mb-2">
                      <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Sem orçamento
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Orçamento por Categoria
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isMobile ? 'Toque para expandir categorias' : 'Distribuição mensal das categorias ao longo do ano'}
            </p>
          </div>
        </div>

        {/* Mobile: Accordion View */}
        {isMobile ? (
          <CategoryAccordion
            categories={categories}
            budgets={budgets}
            year={year}
            onMonthClick={onMonthClick}
          />
        ) : (
          /* Desktop: Table View */
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
        )}
      </div>
    </div>
  )
}
