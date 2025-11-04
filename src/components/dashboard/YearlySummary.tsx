import React from 'react'
import { useYearlyCalculations } from '@/hooks/useYearlyCalculations'
import { Transaction, Budget, Category } from '@/types'
import { formatCurrency } from '@/utils/format'

interface YearlySummaryProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  year: number
}

export const YearlySummary: React.FC<YearlySummaryProps> = ({
  transactions,
  budgets,
  categories,
  year,
}) => {
  const { yearlySummary } = useYearlyCalculations(transactions, budgets, categories, year)

  const incomePerformance = yearlySummary.totalBudgetedIncome > 0
    ? (yearlySummary.totalIncome / yearlySummary.totalBudgetedIncome) * 100
    : 0

  const expensePerformance = yearlySummary.totalBudgetedExpense > 0
    ? (yearlySummary.totalExpense / yearlySummary.totalBudgetedExpense) * 100
    : 0

  const savingsRate = yearlySummary.totalIncome > 0
    ? ((yearlySummary.totalIncome - yearlySummary.totalExpense) / yearlySummary.totalIncome) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Resumo Anual {year}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Income Card */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
              Receitas
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Realizado</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(yearlySummary.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600 dark:text-green-400">Planejado</p>
                <p className="text-lg text-green-800 dark:text-green-200">
                  {formatCurrency(yearlySummary.totalBudgetedIncome)}
                </p>
              </div>
              <div className="pt-2 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-green-600 dark:text-green-400">Variação</p>
                <p className={`text-lg font-semibold ${
                  yearlySummary.totalIncomeVariance >= 0
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {yearlySummary.totalIncomeVariance >= 0 ? '+' : ''}
                  {formatCurrency(yearlySummary.totalIncomeVariance)}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {incomePerformance.toFixed(1)}% do planejado
                </p>
              </div>
            </div>
          </div>

          {/* Expense Card */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
              Despesas
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400">Realizado</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {formatCurrency(yearlySummary.totalExpense)}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-600 dark:text-red-400">Planejado</p>
                <p className="text-lg text-red-800 dark:text-red-200">
                  {formatCurrency(yearlySummary.totalBudgetedExpense)}
                </p>
              </div>
              <div className="pt-2 border-t border-red-200 dark:border-red-700">
                <p className="text-xs text-red-600 dark:text-red-400">Variação</p>
                <p className={`text-lg font-semibold ${
                  yearlySummary.totalExpenseVariance >= 0
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {yearlySummary.totalExpenseVariance >= 0 ? '+' : ''}
                  {formatCurrency(yearlySummary.totalExpenseVariance)}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {expensePerformance.toFixed(1)}% do planejado
                </p>
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              Saldo Anual
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${
                  yearlySummary.netBalance >= 0
                    ? 'text-blue-900 dark:text-blue-100'
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {formatCurrency(yearlySummary.netBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Taxa de Poupança</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400">Média Mensal</p>
                <p className="text-lg text-blue-800 dark:text-blue-200">
                  {formatCurrency(yearlySummary.netBalance / 12)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Análise Anual
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Receita Média Mensal:</span>{' '}
                {formatCurrency(yearlySummary.totalIncome / 12)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Despesa Média Mensal:</span>{' '}
                {formatCurrency(yearlySummary.totalExpense / 12)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Melhor Mês:</span>{' '}
                {yearlySummary.monthlyBreakdowns.reduce((best, current) =>
                  current.netBalance > best.netBalance ? current : best
                ).monthName}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Pior Mês:</span>{' '}
                {yearlySummary.monthlyBreakdowns.reduce((worst, current) =>
                  current.netBalance < worst.netBalance ? current : worst
                ).monthName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
