import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { GroupBreakdown } from '@/components/dashboard/GroupBreakdown'
import { useApp } from '@/context/AppContext'
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations'
import { getMonthName } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { Select } from '@/components/common/Input'

export const DashboardPage: React.FC = () => {
  const {
    categories,
    transactions,
    budgets,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
  } = useApp()

  const { monthSummary, groupSummaries } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    selectedYear,
    selectedMonth
  )

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const netBalance = monthSummary.netBalance
  const isPositive = netBalance >= 0

  return (
    <PageContainer
      title="Dashboard"
      description={`Visão geral de ${getMonthName(selectedMonth)} ${selectedYear}`}
    >
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex gap-4 items-end">
            <Select
              label="Ano"
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <Select
              label="Mês"
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryCard
            title="Receitas"
            budgeted={monthSummary.budgetedIncome}
            actual={monthSummary.totalIncome}
            type="income"
          />
          <SummaryCard
            title="Despesas"
            budgeted={monthSummary.budgetedExpense}
            actual={monthSummary.totalExpense}
            type="expense"
          />
        </div>

        <div className={`card p-8 ${isPositive ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Saldo do Mês</h3>
              <p className="text-sm text-gray-600">
                {isPositive
                  ? 'Você está economizando!'
                  : 'Atenção: despesas acima das receitas'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(netBalance))}
              </div>
              <div className="text-sm text-gray-600">
                {monthSummary.totalIncome > 0
                  ? `${((netBalance / monthSummary.totalIncome) * 100).toFixed(1)}% da receita`
                  : ''}
              </div>
            </div>
          </div>
        </div>

        <GroupBreakdown summaries={groupSummaries} />
      </div>
    </PageContainer>
  )
}
