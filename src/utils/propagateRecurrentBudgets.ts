import { db } from '@/db'
import { Budget } from '@/types'
import { dateToMonthNumber, getCurrentYear } from './date'
import { logger } from './logger'

/**
 * Propagates a recurring budget to all future months
 * Copies from the budget's month until the end of next year
 *
 * @param budget - The budget to propagate (must have mode='recurring')
 */
export const propagateRecurrentBudget = async (budget: Budget): Promise<number> => {
  if (budget.mode !== 'recurring') {
    return 0 // Only propagate recurring budgets
  }

  const currentYear = getCurrentYear()
  const endYear = currentYear + 2 // Propagate until end of next year
  let copiedCount = 0

  const budgetKey = `${budget.type}-${budget.sourceId || ''}-${budget.groupId || ''}-${budget.subgroupId || ''}`
  const startDate = dateToMonthNumber(budget.year, budget.month)

  // Get all existing budgets to avoid duplicates
  const existingBudgets = await db.budgets.toArray()
  const existingByMonthKey = new Map<string, Budget>()

  existingBudgets.forEach(b => {
    const key = `${b.year}-${b.month}-${b.type}-${b.sourceId || ''}-${b.groupId || ''}-${b.subgroupId || ''}`
    existingByMonthKey.set(key, b)
  })

  // Loop through all future months
  for (let year = budget.year; year <= endYear; year++) {
    const startMonth = year === budget.year ? budget.month + 1 : 1
    const endMonth = 12

    for (let month = startMonth; month <= endMonth; month++) {
      const targetDate = dateToMonthNumber(year, month)

      if (targetDate <= startDate) {
        continue // Skip months before or equal to the budget's month
      }

      const monthKey = `${year}-${month}-${budgetKey}`

      // Check if budget already exists for this month
      if (existingByMonthKey.has(monthKey)) {
        continue // Skip if already exists
      }

      // Create new budget for this month
      const newBudget: Omit<Budget, 'id'> = {
        year,
        month,
        type: budget.type,
        amount: budget.amount,
        mode: 'recurring',
        sourceId: budget.sourceId,
        groupId: budget.groupId,
        subgroupId: budget.subgroupId,
      }

      await db.budgets.add(newBudget)
      copiedCount++
    }
  }

  if (copiedCount > 0) {
    logger.info(`Propagated recurring budget to ${copiedCount} future months`, {
      budgetId: budget.id,
      copiedCount,
    })
  }

  return copiedCount
}

/**
 * Propagates an installment budget to all its installment months
 *
 * @param budget - The installment budget to propagate
 */
export const propagateInstallmentBudget = async (budget: Budget): Promise<number> => {
  if (budget.mode !== 'installment' || !budget.installments) {
    return 0
  }

  const installments = budget.installments
  let copiedCount = 0

  const budgetKey = `${budget.type}-${budget.sourceId || ''}-${budget.groupId || ''}-${budget.subgroupId || ''}`

  // Get existing budgets to avoid duplicates
  const existingBudgets = await db.budgets.toArray()
  const existingByMonthKey = new Map<string, Budget>()

  existingBudgets.forEach(b => {
    const key = `${b.year}-${b.month}-${b.type}-${b.sourceId || ''}-${b.groupId || ''}-${b.subgroupId || ''}`
    existingByMonthKey.set(key, b)
  })

  // Create installments for future months
  for (let i = 1; i < installments; i++) {
    let targetYear = budget.year
    let targetMonth = budget.month + i

    // Handle year overflow
    while (targetMonth > 12) {
      targetMonth -= 12
      targetYear++
    }

    const monthKey = `${targetYear}-${targetMonth}-${budgetKey}`

    if (existingByMonthKey.has(monthKey)) {
      continue // Skip if already exists
    }

    const newBudget: Omit<Budget, 'id'> = {
      year: targetYear,
      month: targetMonth,
      type: budget.type,
      amount: budget.amount,
      mode: 'installment',
      installments: budget.installments,
      installmentNumber: i + 1,
      sourceId: budget.sourceId,
      groupId: budget.groupId,
      subgroupId: budget.subgroupId,
    }

    await db.budgets.add(newBudget)
    copiedCount++
  }

  if (copiedCount > 0) {
    logger.info(`Propagated installment budget to ${copiedCount} months`, {
      budgetId: budget.id,
      copiedCount,
      totalInstallments: installments,
    })
  }

  return copiedCount
}

/**
 * Propagates a budget to future months based on its mode
 * Automatically determines if it's recurring or installment
 */
export const propagateBudget = async (budget: Budget): Promise<number> => {
  if (budget.mode === 'recurring') {
    return await propagateRecurrentBudget(budget)
  } else if (budget.mode === 'installment') {
    return await propagateInstallmentBudget(budget)
  }
  return 0
}
