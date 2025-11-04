import React, { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { BudgetEditor } from '@/components/budget/BudgetEditor'
import { YearlyBudgetOverview } from '@/components/budget/YearlyBudgetOverview'
import { PeriodSelector } from '@/components/common/PeriodSelector'
import { useApp } from '@/context/AppContext'
import { copyRecurrentBudgets } from '@/utils/copyRecurrentBudgets'
import { VIEW_MODES } from '@/constants/viewModes'

export const BudgetPage: React.FC = () => {
  const {
    categories,
    sources,
    budgets,
    selectedYear,
    selectedMonth,
    viewMode,
    setSelectedYear,
    setSelectedMonth,
    setViewMode,
    refreshBudgets,
  } = useApp()

  const handleMonthDrillDown = (month: number) => {
    setSelectedMonth(month)
    setViewMode(VIEW_MODES.MONTHLY)
  }

  // Copy recurrent budgets when month changes (only in monthly mode)
  useEffect(() => {
    if (viewMode === VIEW_MODES.MONTHLY) {
      const handleRecurrentCopy = async () => {
        await copyRecurrentBudgets(selectedYear, selectedMonth)
        await refreshBudgets()
      }
      handleRecurrentCopy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, viewMode])

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
      title="Orçamento"
      description={
        viewMode === VIEW_MODES.MONTHLY
          ? 'Defina suas receitas previstas e despesas planejadas para o mês'
          : 'Visão geral do orçamento anual e planejamento mensal'
      }
      action={viewModeToggle}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <PeriodSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            showMonths={viewMode === VIEW_MODES.MONTHLY}
          />
        </div>

        {viewMode === VIEW_MODES.MONTHLY ? (
          <BudgetEditor year={selectedYear} month={selectedMonth} />
        ) : (
          <YearlyBudgetOverview
            budgets={budgets}
            categories={categories}
            sources={sources}
            year={selectedYear}
            onMonthClick={handleMonthDrillDown}
          />
        )}
      </div>
    </PageContainer>
  )
}
