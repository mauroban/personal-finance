import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { GroupBreakdown } from '@/components/dashboard/GroupBreakdown'
import { YearlySummary } from '@/components/dashboard/YearlySummary'
import { MonthlyBreakdownTable } from '@/components/dashboard/MonthlyBreakdownTable'
import { YearlyCategoryTrends } from '@/components/dashboard/YearlyCategoryTrends'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { PeriodSelector } from '@/components/common/PeriodSelector'
import { useApp } from '@/context/AppContext'
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations'
import { getMonthName } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { VIEW_MODES } from '@/constants/viewModes'

export const DashboardPage: React.FC = () => {
  const {
    categories,
    transactions,
    budgets,
    selectedYear,
    selectedMonth,
    viewMode,
    setSelectedYear,
    setSelectedMonth,
    setViewMode,
  } = useApp()

  const handleMonthDrillDown = (month: number) => {
    setSelectedMonth(month)
    setViewMode(VIEW_MODES.MONTHLY)
  }

  const { monthSummary, groupSummaries } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    selectedYear,
    selectedMonth
  )

  const netBalance = monthSummary.netBalance
  const isPositive = netBalance >= 0

  // Prepare category pie chart data
  const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ]

  const categoryChartData = groupSummaries.map((summary, index) => ({
    name: summary.groupName,
    value: summary.actual,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0)

  const viewModeToggle = (
    <div className="flex gap-2">
      <button
        onClick={() => setViewMode(VIEW_MODES.MONTHLY)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          viewMode === VIEW_MODES.MONTHLY
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Mensal
      </button>
      <button
        onClick={() => setViewMode(VIEW_MODES.YEARLY)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          viewMode === VIEW_MODES.YEARLY
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Anual
      </button>
    </div>
  )

  return (
    <PageContainer
      title="Dashboard"
      description={
        viewMode === VIEW_MODES.MONTHLY
          ? `Visão geral de ${getMonthName(selectedMonth)} ${selectedYear}`
          : `Visão anual de ${selectedYear}`
      }
      action={viewModeToggle}
    >
      <div className="space-y-6">
        <div className="card p-6">
          <PeriodSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            showMonths={viewMode === VIEW_MODES.MONTHLY}
          />
        </div>

        {viewMode === VIEW_MODES.MONTHLY ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className={`card p-6 ${isPositive ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-rose-50'}`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Saldo do Mês</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {isPositive
                        ? 'Você está economizando!'
                        : 'Atenção: déficit'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className={`text-3xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(netBalance))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {monthSummary.totalIncome > 0
                        ? `${((netBalance / monthSummary.totalIncome) * 100).toFixed(1)}% da receita`
                        : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IncomeExpenseChart monthSummary={monthSummary} />
              <CategoryPieChart
                data={categoryChartData}
                title="Distribuição de Despesas"
              />
            </div>

            {/* Category Breakdown */}
            <GroupBreakdown summaries={groupSummaries} />
          </>
        ) : (
          <>
            <YearlySummary
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
            />
            <MonthlyTrendChart
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
            />
            <MonthlyBreakdownTable
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
              onMonthClick={handleMonthDrillDown}
            />
            <YearlyCategoryTrends
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
            />
          </>
        )}
      </div>
    </PageContainer>
  )
}
