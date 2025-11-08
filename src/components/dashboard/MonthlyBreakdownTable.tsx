import React from 'react'
import { useYearlyCalculations } from '@/hooks/useYearlyCalculations'
import { Transaction, Budget, Category } from '@/types'
import { formatCurrency } from '@/utils/format'
import { useDeviceType } from '@/hooks/useMediaQuery'
import { MonthCard } from './MonthCard'

interface MonthlyBreakdownTableProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
  onMonthClick: (month: number) => void
}

export const MonthlyBreakdownTable: React.FC<MonthlyBreakdownTableProps> = ({
  transactions,
  budgets,
  categories,
  year,
  onMonthClick,
}) => {
  const { yearlySummary } = useYearlyCalculations(transactions, budgets, categories, year)
  const { isMobile } = useDeviceType()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
          Breakdown Mensal {year}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
          {isMobile ? 'Toque' : 'Clique'} em qualquer mês para ver detalhes
        </p>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="p-4 space-y-3">
          {yearlySummary.monthlyBreakdowns.map((breakdown) => (
            <MonthCard
              key={breakdown.month}
              monthName={breakdown.monthName}
              income={breakdown.income}
              expense={breakdown.expense}
              budgetedIncome={breakdown.budgetedIncome}
              budgetedExpense={breakdown.budgetedExpense}
              netBalance={breakdown.netBalance}
              incomeVariance={breakdown.incomeVariance}
              expenseVariance={breakdown.expenseVariance}
              isFuture={breakdown.isFuture}
              onClick={() => onMonthClick(breakdown.month)}
            />
          ))}

          {/* Total Card */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              TOTAL {year}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Saldo Líquido:</span>
                <span
                  className={`text-lg font-bold ${
                    yearlySummary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(yearlySummary.netBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Receita Total:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(yearlySummary.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Despesa Total:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(yearlySummary.totalExpense)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mês
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Receita<br />Planejada
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Receita<br />Real
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Despesa<br />Planejada
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Despesa<br />Real
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Saldo<br />Líquido
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Var. Receita
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Var. Despesa
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {yearlySummary.monthlyBreakdowns.map((breakdown) => (
              <tr
                key={breakdown.month}
                onClick={() => onMonthClick(breakdown.month)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  breakdown.isFuture ? 'opacity-40' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {breakdown.monthName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                  {formatCurrency(breakdown.budgetedIncome)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                  {breakdown.isFuture ? '-' : formatCurrency(breakdown.income)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                  {formatCurrency(breakdown.budgetedExpense)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600 dark:text-red-400">
                  {breakdown.isFuture ? '-' : formatCurrency(breakdown.expense)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                  breakdown.isFuture
                    ? 'text-gray-400 dark:text-gray-500'
                    : breakdown.netBalance >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {breakdown.isFuture ? '-' : formatCurrency(breakdown.netBalance)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  breakdown.isFuture
                    ? 'text-gray-400 dark:text-gray-500'
                    : breakdown.incomeVariance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {breakdown.isFuture ? '-' : `${breakdown.incomeVariance >= 0 ? '+' : ''}${formatCurrency(breakdown.incomeVariance)}`}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                  breakdown.isFuture
                    ? 'text-gray-400 dark:text-gray-500'
                    : breakdown.expenseVariance >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {breakdown.isFuture ? '-' : `${breakdown.expenseVariance >= 0 ? '+' : ''}${formatCurrency(breakdown.expenseVariance)}`}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                TOTAL
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                {formatCurrency(yearlySummary.totalBudgetedIncome)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                {formatCurrency(yearlySummary.totalIncome)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                {formatCurrency(yearlySummary.totalBudgetedExpense)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                {formatCurrency(yearlySummary.totalExpense)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                yearlySummary.netBalance >= 0
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(yearlySummary.netBalance)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                yearlySummary.totalIncomeVariance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {yearlySummary.totalIncomeVariance >= 0 ? '+' : ''}
                {formatCurrency(yearlySummary.totalIncomeVariance)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                yearlySummary.totalExpenseVariance >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {yearlySummary.totalExpenseVariance >= 0 ? '+' : ''}
                {formatCurrency(yearlySummary.totalExpenseVariance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
