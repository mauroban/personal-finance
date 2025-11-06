import React from 'react'
import { Transaction, Budget, Category, Source } from '@/types'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { GroupBreakdown } from '@/components/dashboard/GroupBreakdown'
import { TopTransactions } from '@/components/dashboard/TopTransactions'
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations'
import { useTopTransactions } from '@/hooks/useTopTransactions'

interface MonthTabProps {
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  sources: Source[]
  selectedYear: number
  selectedMonth: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
}

export const MonthTab: React.FC<MonthTabProps> = ({
  transactions,
  budgets,
  categories,
  sources,
  selectedYear,
  selectedMonth,
}) => {
  const { monthSummary, groupSummariesWithSubcategories } = useBudgetCalculations(
    transactions,
    budgets,
    categories,
    selectedYear,
    selectedMonth
  )

  const topExpenses = useTopTransactions(
    transactions,
    categories,
    sources,
    selectedYear,
    selectedMonth,
    'expense',
    5
  )

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Receitas"
          budgeted={monthSummary.budgetedIncome}
          actual={monthSummary.totalIncome}
          type="income"
          icon="💰"
        />
        <SummaryCard
          title="Despesas"
          budgeted={monthSummary.budgetedExpense}
          actual={monthSummary.totalExpense}
          type="expense"
          icon="💸"
        />
        <SummaryCard
          title="Saldo Mensal"
          budgeted={monthSummary.budgetedIncome - monthSummary.budgetedExpense}
          actual={monthSummary.netBalance}
          type="balance"
          icon="📊"
        />
      </div>

      {/* Category Breakdown with Subcategories */}
      <GroupBreakdown
        summaries={groupSummariesWithSubcategories}
        summariesWithSubcategories={groupSummariesWithSubcategories}
        showSubcategories={true}
      />

      {/* Top Transactions */}
      <TopTransactions
        transactions={topExpenses}
        title="Maiores Despesas do Mês"
        emptyMessage="Nenhuma despesa registrada neste mês"
      />
    </div>
  )
}
