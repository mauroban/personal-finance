import React, { useState } from 'react'
import { useYearlyCalculations } from '@/hooks/useYearlyCalculations'
import { Transaction, Budget, Category } from '@/types'
import { formatCurrency } from '@/utils/format'
import { getMonthName } from '@/utils/date'

interface YearlyCategoryTrendsProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
}

export const YearlyCategoryTrends: React.FC<YearlyCategoryTrendsProps> = ({
  transactions,
  budgets,
  categories,
  year,
}) => {
  const { yearlyGroupSummaries } = useYearlyCalculations(transactions, budgets, categories, year)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)

  const toggleCategory = (groupId: number) => {
    setExpandedCategory(expandedCategory === groupId ? null : groupId)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Análise por Categoria {year}
      </h2>

      <div className="space-y-4">
        {yearlyGroupSummaries.map((group) => {
          const isExpanded = expandedCategory === group.groupId
          const percentage = group.totalBudgeted > 0 ? (group.totalActual / group.totalBudgeted) * 100 : 0
          const isOverBudget = percentage > 105 // 5% tolerance

          return (
            <div
              key={group.groupId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Category Summary */}
              <div
                onClick={() => toggleCategory(group.groupId)}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {group.groupName}
                  </h3>
                  <button className="text-gray-500 dark:text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Planejado Anual</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(group.totalBudgeted)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Gasto Anual</p>
                    <p className={`text-sm font-medium ${
                      isOverBudget
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatCurrency(group.totalActual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Restante</p>
                    <p className={`text-sm font-medium ${
                      group.totalRemaining >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(group.totalRemaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Execução</p>
                    <p className={`text-sm font-medium ${
                      group.averagePercentage > 105
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {group.averagePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      group.averagePercentage > 105
                        ? 'bg-red-600 dark:bg-red-500'
                        : 'bg-green-600 dark:bg-green-500'
                    }`}
                    style={{ width: `${Math.min(group.averagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Monthly Details */}
              {isExpanded && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Detalhamento Mensal
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            Mês
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                            Planejado
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                            Gasto
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                            Variação
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {group.monthlyData.map((month) => {
                          const variance = month.budgeted - month.actual
                          const percentage = month.budgeted > 0 ? (month.actual / month.budgeted) * 100 : 0

                          return (
                            <tr key={month.month} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                {getMonthName(month.month)}
                              </td>
                              <td className="px-4 py-2 text-sm text-right text-gray-600 dark:text-gray-400">
                                {formatCurrency(month.budgeted)}
                              </td>
                              <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white">
                                {formatCurrency(month.actual)}
                              </td>
                              <td className={`px-4 py-2 text-sm text-right ${
                                variance >= 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {variance >= 0 ? '+' : ''}
                                {formatCurrency(variance)}
                              </td>
                              <td className={`px-4 py-2 text-sm text-right ${
                                percentage > 105
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {percentage.toFixed(1)}%
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {yearlyGroupSummaries.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma categoria com orçamento definido para {year}
          </div>
        )}
      </div>
    </div>
  )
}
