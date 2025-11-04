import { db } from '@/db'
import { Budget } from '@/types'

/**
 * Copies recurring and installment budgets from previous months to the current month
 * - Recurring budgets: copy to all future months
 * - Installment budgets: copy only for the specified number of months
 */
export const copyRecurrentBudgets = async (year: number, month: number): Promise<void> => {
  // Get all budgets that have mode = recurring or installment (or legacy isRecurrent)
  const allBudgets = await db.budgets.toArray()

  const recurringOrInstallmentBudgets = allBudgets.filter(b =>
    b.mode === 'recurring' ||
    b.mode === 'installment' ||
    (b.isRecurrent && !b.mode) // Legacy support
  )

  if (recurringOrInstallmentBudgets.length === 0) {
    return // No recurring/installment budgets at all
  }

  // Filter budgets that are from months BEFORE the target month
  const currentDate = year * 12 + month
  const previousBudgets = recurringOrInstallmentBudgets.filter(b => {
    const budgetDate = b.year * 12 + b.month
    return budgetDate < currentDate
  })

  if (previousBudgets.length === 0) {
    return // No recurring/installment budgets from previous months
  }

  // Group budgets by their key (type + source/category combination)
  // and keep only the most recent one for each key
  const budgetMap = new Map<string, Budget>()

  for (const budget of previousBudgets) {
    const key = `${budget.type}-${budget.sourceId || ''}-${budget.groupId || ''}-${budget.subgroupId || ''}`
    const budgetDate = budget.year * 12 + budget.month

    const existing = budgetMap.get(key)
    if (!existing) {
      budgetMap.set(key, budget)
    } else {
      const existingDate = existing.year * 12 + existing.month
      if (budgetDate > existingDate) {
        budgetMap.set(key, budget)
      }
    }
  }

  console.log(`📋 Found ${budgetMap.size} unique recurring/installment budgets from previous months`)

  // Check which budgets already exist for current month
  const existingBudgets = await db.budgets
    .where('[year+month]')
    .equals([year, month])
    .toArray()

  const existingKeys = new Set(
    existingBudgets.map(b =>
      `${b.type}-${b.sourceId || ''}-${b.groupId || ''}-${b.subgroupId || ''}`
    )
  )

  let copiedCount = 0

  // Copy each budget if it doesn't exist in current month
  for (const [key, budget] of budgetMap.entries()) {
    if (existingKeys.has(key)) {
      continue // Already exists
    }

    const mode = budget.mode || (budget.isRecurrent ? 'recurring' : 'unique')

    if (mode === 'recurring') {
      // Copy recurring budgets to all future months
      const newBudget: Omit<Budget, 'id'> = {
        year,
        month,
        type: budget.type,
        amount: budget.amount,
        mode: 'recurring',
        sourceId: budget.sourceId,
        groupId: budget.groupId,
        subgroupId: budget.subgroupId
      }

      await db.budgets.add(newBudget)
      copiedCount++
    } else if (mode === 'installment') {
      // For installments, check if we're within the installment period
      const originalDate = budget.year * 12 + budget.month
      const installments = budget.installments || 1
      const monthsSinceStart = currentDate - originalDate

      if (monthsSinceStart < installments) {
        // Still within installment period
        const newBudget: Omit<Budget, 'id'> = {
          year,
          month,
          type: budget.type,
          amount: budget.amount,
          mode: 'installment',
          installments: budget.installments,
          installmentNumber: monthsSinceStart + 1,
          sourceId: budget.sourceId,
          groupId: budget.groupId,
          subgroupId: budget.subgroupId
        }

        await db.budgets.add(newBudget)
        copiedCount++
      }
    }
  }

  if (copiedCount > 0) {
    console.log(`✅ Copied ${copiedCount} budgets to ${year}-${month}`)
  }
}
