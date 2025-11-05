import React from 'react'
import { MonthSummary } from '@/types'
import { formatCurrency } from '@/utils/format'
import { colors, shadows, transitions } from '@/constants/designSystem'

// Placeholder icons (using emoji until lucide-react is installed)
const TrendingUp = () => <span>📈</span>
const TrendingDown = () => <span>📉</span>
const DollarSign = () => <span>💰</span>

interface MonthlyHealthHeroProps {
  monthSummary: MonthSummary
  monthName: string
}

export const MonthlyHealthHero: React.FC<MonthlyHealthHeroProps> = ({ monthSummary, monthName }) => {
  const { totalIncome, totalExpense, budgetedIncome, budgetedExpense, netBalance } = monthSummary

  const incomeVariance = totalIncome - budgetedIncome
  const expenseVariance = budgetedExpense - totalExpense // Positive = under budget (good)
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0.0'

  const isIncomeOnTrack = incomeVariance >= 0
  const isExpenseOnTrack = expenseVariance >= 0
  const isBalancePositive = netBalance >= 0

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
          {monthName}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Visão geral do mês
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 transition-all hover:scale-[1.02]"
          style={{
            boxShadow: shadows.lg,
            transition: `all ${transitions.base}`,
          }}
        >
          {/* Background Gradient Accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: colors.gradients.income,
            }}
          />

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                Receita
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(totalIncome)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-success-50 dark:bg-success-900/20">
              <span className="text-2xl"><TrendingUp /></span>
            </div>
          </div>

          {/* Planned vs Actual */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Planejado: {formatCurrency(budgetedIncome)}
            </div>
            <div
              className={`text-xs font-semibold ${
                isIncomeOnTrack
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              }`}
            >
              {isIncomeOnTrack ? '+' : ''}
              {formatCurrency(incomeVariance)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalIncome / (budgetedIncome || 1)) * 100, 100)}%`,
                background: colors.gradients.income,
              }}
            />
          </div>
        </div>

        {/* Expense Card */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 transition-all hover:scale-[1.02]"
          style={{
            boxShadow: shadows.lg,
            transition: `all ${transitions.base}`,
          }}
        >
          {/* Background Gradient Accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: colors.gradients.expense,
            }}
          />

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                Despesas
              </p>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(totalExpense)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-error-50 dark:bg-error-900/20">
              <span className="text-2xl"><TrendingDown /></span>
            </div>
          </div>

          {/* Planned vs Actual */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Orçado: {formatCurrency(budgetedExpense)}
            </div>
            <div
              className={`text-xs font-semibold ${
                isExpenseOnTrack
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              }`}
            >
              {expenseVariance > 0 ? '+' : ''}
              {formatCurrency(expenseVariance)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExpenseOnTrack ? '' : 'animate-pulse'
              }`}
              style={{
                width: `${Math.min((totalExpense / (budgetedExpense || 1)) * 100, 100)}%`,
                background: isExpenseOnTrack ? colors.gradients.income : colors.gradients.expense,
              }}
            />
          </div>
        </div>

        {/* Net Balance Card */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 transition-all hover:scale-[1.02]"
          style={{
            boxShadow: shadows.lg,
            transition: `all ${transitions.base}`,
          }}
        >
          {/* Background Gradient Accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            style={{
              background: colors.gradients.balance,
            }}
          />

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                Saldo
              </p>
              <h2
                className={`text-3xl font-bold ${
                  isBalancePositive
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-error-600 dark:text-error-400'
                }`}
              >
                {formatCurrency(netBalance)}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <span className="text-2xl"><DollarSign /></span>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Taxa de Poupança
              </div>
              <div
                className={`text-xs font-semibold ${
                  parseFloat(savingsRate) > 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {savingsRate}%
              </div>
            </div>

            {/* Savings Rate Bar */}
            <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(parseFloat(savingsRate), 0), 100)}%`,
                  background: parseFloat(savingsRate) > 0 ? colors.gradients.balance : colors.neutral[300],
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      {(incomeVariance !== 0 || expenseVariance !== 0) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {incomeVariance > 0 && (
            <div className="px-4 py-2 rounded-full bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 text-sm font-medium">
              ✓ Receita {formatCurrency(incomeVariance)} acima do planejado
            </div>
          )}
          {incomeVariance < 0 && (
            <div className="px-4 py-2 rounded-full bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 text-sm font-medium">
              ⚠ Receita {formatCurrency(Math.abs(incomeVariance))} abaixo do planejado
            </div>
          )}
          {expenseVariance > 0 && (
            <div className="px-4 py-2 rounded-full bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300 text-sm font-medium">
              ✓ Economizou {formatCurrency(expenseVariance)} no orçamento
            </div>
          )}
          {expenseVariance < 0 && (
            <div className="px-4 py-2 rounded-full bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300 text-sm font-medium">
              ⚠ Gastos {formatCurrency(Math.abs(expenseVariance))} acima do orçamento
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MonthlyHealthHero
