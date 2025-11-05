import { useMemo } from 'react'
import { Transaction, Budget, Category } from '@/types'
import { isDateInMonth } from '@/utils/date'
import { formatCurrency } from '@/utils/format'

export interface Alert {
  type: 'warning' | 'success' | 'info'
  message: string
  category?: string
  action?: {
    label: string
    route: string
  }
}

export const useAlerts = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  year: number,
  month: number
): Alert[] => {
  return useMemo(() => {
    const alerts: Alert[] = []

    // Get month transactions and budgets
    const monthTransactions = transactions.filter(t => isDateInMonth(t.date, year, month))
    const monthBudgets = budgets.filter(b => b.year === year && b.month === month)

    // Get parent categories
    const parentCategories = categories.filter(c => !c.parentId)

    // Check each category for budget adherence
    parentCategories.forEach(cat => {
      const childCategoryIds = categories
        .filter(c => c.parentId === cat.id)
        .map(c => c.id!)

      // Sum budgets for this category
      const budgeted = monthBudgets
        .filter(b =>
          b.type === 'expense' &&
          (b.groupId === cat.id || (b.subgroupId && childCategoryIds.includes(b.subgroupId)))
        )
        .reduce((sum, b) => sum + b.amount, 0)

      // Sum actuals for this category
      const actual = monthTransactions
        .filter(t =>
          t.type === 'expense' &&
          (t.groupId === cat.id || (t.subgroupId && childCategoryIds.includes(t.subgroupId)))
        )
        .reduce((sum, t) => sum + t.value, 0)

      if (budgeted > 0) {
        const percentage = (actual / budgeted) * 100

        // Over budget (over 100%)
        if (percentage > 100) {
          alerts.push({
            type: 'warning',
            message: `${cat.name}: Orçamento excedido em ${formatCurrency(actual - budgeted)} (${percentage.toFixed(0)}%)`,
            category: cat.name,
          })
        }
        // Approaching budget (80-100%)
        else if (percentage >= 80) {
          const daysInMonth = new Date(year, month, 0).getDate()
          const today = new Date().getDate()
          const daysRemaining = month === new Date().getMonth() + 1
            ? daysInMonth - today
            : 0

          if (daysRemaining > 0) {
            alerts.push({
              type: 'warning',
              message: `${cat.name}: ${percentage.toFixed(0)}% do orçamento usado (${daysRemaining} dias restantes)`,
              category: cat.name,
            })
          }
        }
        // Well under budget (under 50% and past mid-month)
        else if (percentage < 50) {
          const today = new Date()
          const currentDay = today.getDate()
          const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

          if (isCurrentMonth && currentDay >= 15) {
            alerts.push({
              type: 'success',
              message: `${cat.name}: Ótimo controle! Apenas ${percentage.toFixed(0)}% do orçamento usado`,
              category: cat.name,
            })
          }
        }
      }
    })

    // Check overall budget performance
    const totalBudgetedExpense = monthBudgets
      .filter(b => b.type === 'expense')
      .reduce((sum, b) => sum + b.amount, 0)

    const totalActualExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.value, 0)

    const totalBudgetedIncome = monthBudgets
      .filter(b => b.type === 'income')
      .reduce((sum, b) => sum + b.amount, 0)

    const totalActualIncome = monthTransactions
      .filter(t => t.type === 'earning')
      .reduce((sum, t) => sum + t.value, 0)

    // Overall expense check
    if (totalBudgetedExpense > 0) {
      const expensePercentage = (totalActualExpense / totalBudgetedExpense) * 100

      if (expensePercentage < 90 && totalActualExpense > 0) {
        const categoriesUnderBudget = parentCategories.filter(cat => {
          const childCategoryIds = categories
            .filter(c => c.parentId === cat.id)
            .map(c => c.id!)

          const budgeted = monthBudgets
            .filter(b =>
              b.type === 'expense' &&
              (b.groupId === cat.id || (b.subgroupId && childCategoryIds.includes(b.subgroupId)))
            )
            .reduce((sum, b) => sum + b.amount, 0)

          const actual = monthTransactions
            .filter(t =>
              t.type === 'expense' &&
              (t.groupId === cat.id || (t.subgroupId && childCategoryIds.includes(t.subgroupId)))
            )
            .reduce((sum, t) => sum + t.value, 0)

          return budgeted > 0 && actual < budgeted
        }).length

        alerts.push({
          type: 'success',
          message: `Parabéns! Você está dentro do orçamento em ${categoriesUnderBudget}/${parentCategories.length} categorias`,
        })
      }
    }

    // Income check
    if (totalBudgetedIncome > 0 && totalActualIncome > totalBudgetedIncome) {
      alerts.push({
        type: 'success',
        message: `Receita ${formatCurrency(totalActualIncome - totalBudgetedIncome)} acima do planejado! 🎉`,
      })
    }

    // Savings check
    const netBalance = totalActualIncome - totalActualExpense
    const budgetedBalance = totalBudgetedIncome - totalBudgetedExpense

    if (netBalance > budgetedBalance && budgetedBalance > 0) {
      alerts.push({
        type: 'success',
        message: `Você está economizando ${formatCurrency(netBalance - budgetedBalance)} a mais que o planejado!`,
      })
    }

    // No budget warning
    if (monthBudgets.length === 0 && monthTransactions.length > 0) {
      alerts.push({
        type: 'info',
        message: 'Você tem transações mas nenhum orçamento definido para este mês',
        action: {
          label: 'Criar Orçamento',
          route: '/budget',
        },
      })
    }

    // Sort alerts: warnings first, then info, then success
    const order = { warning: 0, info: 1, success: 2 }
    return alerts.sort((a, b) => order[a.type] - order[b.type])
  }, [transactions, budgets, categories, year, month])
}
