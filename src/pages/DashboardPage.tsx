import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { TabNavigation } from '@/components/dashboard/TabNavigation'
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab'
import { MonthTab } from '@/components/dashboard/tabs/MonthTab'
import { YearTab } from '@/components/dashboard/tabs/YearTab'
import { TrendsTab } from '@/components/dashboard/tabs/TrendsTab'
import { useApp } from '@/context/AppContext'
import { VIEW_MODES } from '@/constants/viewModes'
import { getMonthName } from '@/utils/date'

export const DashboardPage: React.FC = () => {
  const {
    categories,
    sources,
    transactions,
    budgets,
    selectedYear,
    selectedMonth,
    viewMode,
    setSelectedYear,
    setSelectedMonth,
    setViewMode,
  } = useApp()

  // Handle backward compatibility: map old view modes to new ones
  const normalizeViewMode = (mode: string) => {
    if (mode === 'monthly') return VIEW_MODES.MONTH
    if (mode === 'yearly') return VIEW_MODES.YEAR
    return mode
  }

  const activeTab = normalizeViewMode(viewMode) as typeof VIEW_MODES[keyof typeof VIEW_MODES]

  // If viewMode is not one of the 4 tabs, default to Overview
  const validTabs = [VIEW_MODES.OVERVIEW, VIEW_MODES.MONTH, VIEW_MODES.YEAR, VIEW_MODES.TRENDS] as const
  const currentTab = validTabs.includes(activeTab as any)
    ? activeTab
    : VIEW_MODES.OVERVIEW

  const handleMonthDrillDown = (month: number) => {
    setSelectedMonth(month)
    setViewMode(VIEW_MODES.MONTH)
  }

  // Get description based on active tab
  const getDescription = () => {
    switch (currentTab) {
      case VIEW_MODES.OVERVIEW:
        return 'Visão geral da sua saúde financeira'
      case VIEW_MODES.MONTH:
        return `Análise detalhada de ${getMonthName(selectedMonth)} ${selectedYear}`
      case VIEW_MODES.YEAR:
        return `Visão anual de ${selectedYear}`
      case VIEW_MODES.TRENDS:
        return 'Análise de tendências e padrões'
      default:
        return 'Dashboard financeiro'
    }
  }

  return (
    <PageContainer
      title="Dashboard"
      description={getDescription()}
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="card">
          <div className="px-6 pt-6">
            <TabNavigation
              activeTab={currentTab}
              onTabChange={setViewMode}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {currentTab === VIEW_MODES.OVERVIEW && (
            <OverviewTab
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
              month={selectedMonth}
            />
          )}

          {currentTab === VIEW_MODES.MONTH && (
            <MonthTab
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              sources={sources}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />
          )}

          {currentTab === VIEW_MODES.YEAR && (
            <YearTab
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
              onYearChange={setSelectedYear}
              onMonthClick={handleMonthDrillDown}
            />
          )}

          {currentTab === VIEW_MODES.TRENDS && (
            <TrendsTab
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              year={selectedYear}
              month={selectedMonth}
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
