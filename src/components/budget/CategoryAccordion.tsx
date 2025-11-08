import React, { useState } from 'react'
import { Budget, Category } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getMonthName } from '@/utils/date'

interface CategoryAccordionProps {
  categories: Category[]
  budgets: Budget[]
  year: number
  onMonthClick: (month: number) => void
}

export const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  categories,
  budgets,
  year,
  onMonthClick,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<number | 'income' | 'expenses' | null>(null)

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const parentCategories = categories.filter(c => !c.parentId)

  const getMonthBudget = (month: number, categoryId?: number, type: 'income' | 'expense' = 'expense') => {
    if (type === 'income') {
      return budgets
        .filter(b => b.year === year && b.month === month && b.type === 'income')
        .reduce((sum, b) => sum + b.amount, 0)
    }

    return budgets.find(
      b => b.year === year && b.month === month && b.groupId === categoryId && b.type === 'expense'
    )?.amount || 0
  }

  const getYearTotal = (categoryId?: number, type: 'income' | 'expense' = 'expense') => {
    return months.reduce((sum, month) => sum + getMonthBudget(month, categoryId, type), 0)
  }

  const totalExpenses = getYearTotal(undefined, 'expense')
  const totalIncome = getYearTotal(undefined, 'income')

  return (
    <div className="space-y-2">
      {/* Income Accordion */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setExpandedCategory(expandedCategory === 'income' ? null : 'income')}
          className="w-full p-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-green-900 dark:text-green-100">Receitas</div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {formatCurrency(totalIncome)}
              </div>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-green-700 dark:text-green-300 transition-transform ${
              expandedCategory === 'income' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedCategory === 'income' && (
          <div className="p-4 bg-white dark:bg-gray-800 space-y-2">
            {months.map(month => {
              const amount = getMonthBudget(month, undefined, 'income')
              if (amount === 0) return null

              return (
                <div
                  key={month}
                  onClick={() => onMonthClick(month)}
                  className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getMonthName(month)}
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(amount)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Accordions */}
      {parentCategories.map(category => {
        const yearTotal = getYearTotal(category.id)
        if (yearTotal === 0) return null

        return (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : (category.id ?? null))}
              className="w-full p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{category.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatCurrency(yearTotal)}
                  </div>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                  expandedCategory === category.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedCategory === category.id && (
              <div className="p-4 bg-white dark:bg-gray-800">
                {/* Monthly breakdown as horizontal scroll chips */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {months.map(month => {
                    const amount = getMonthBudget(month, category.id)

                    return (
                      <div
                        key={month}
                        onClick={() => onMonthClick(month)}
                        className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-all min-w-[100px] ${
                          amount > 0
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                            : 'bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 opacity-40'
                        }`}
                      >
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {getMonthName(month).substring(0, 3)}
                        </div>
                        <div className={`text-sm font-bold ${
                          amount > 0 ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {amount > 0 ? formatCurrency(amount) : '-'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Total Expenses Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setExpandedCategory(expandedCategory === 'expenses' ? null : 'expenses')}
          className="w-full p-4 flex items-center justify-between bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-red-900 dark:text-red-100">Total Despesas</div>
              <div className="text-xs text-red-700 dark:text-red-300">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-red-700 dark:text-red-300 transition-transform ${
              expandedCategory === 'expenses' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedCategory === 'expenses' && (
          <div className="p-4 bg-white dark:bg-gray-800 space-y-2">
            {months.map(month => {
              const monthExpense = budgets
                .filter(b => b.year === year && b.month === month && b.type === 'expense')
                .reduce((s, b) => s + b.amount, 0)

              if (monthExpense === 0) return null

              return (
                <div
                  key={month}
                  onClick={() => onMonthClick(month)}
                  className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getMonthName(month)}
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(monthExpense)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Balance Total */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
              Saldo Planejado Anual
            </div>
            <div className={`text-2xl font-bold ${
              totalIncome - totalExpenses >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </div>
          </div>
          <div className={`p-3 rounded-full ${
            totalIncome - totalExpenses >= 0
              ? 'bg-blue-600'
              : 'bg-red-600'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {totalIncome - totalExpenses >= 0 ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
