import React, { useEffect } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { BudgetEditor } from '@/components/budget/BudgetEditor'
import { useApp } from '@/context/AppContext'
import { getMonthName } from '@/utils/date'
import { Select } from '@/components/common/Input'
import { copyRecurrentBudgets } from '@/utils/copyRecurrentBudgets'

export const BudgetPage: React.FC = () => {
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, refreshBudgets } = useApp()

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // Copy recurrent budgets when month changes
  useEffect(() => {
    const handleRecurrentCopy = async () => {
      await copyRecurrentBudgets(selectedYear, selectedMonth)
      await refreshBudgets()
    }
    handleRecurrentCopy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth])

  return (
    <PageContainer
      title="Orçamento Mensal"
      description="Defina suas receitas previstas e despesas planejadas para o mês"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
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

        <BudgetEditor year={selectedYear} month={selectedMonth} />
      </div>
    </PageContainer>
  )
}
