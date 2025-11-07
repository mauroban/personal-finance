import { db } from '@/db'
import { Budget } from '@/types'
import { dateToMonthNumber } from './date'
import { logger } from './logger'

/**
 * Propagates a recurring budget to all future months
 * Copies from the budget's month until 10 years into the future
 *
 * @param budget - The budget to propagate (must have mode='recurring')
 * @param yearsAhead - Number of years to propagate ahead (default: 10)
 */
export const propagateRecurrentBudget = async (budget: Budget, yearsAhead: number = 10): Promise<number> => {
  if (budget.mode !== 'recurring') {
    return 0 // Only propagate recurring budgets
  }

  const endYear = budget.year + yearsAhead // Propagate specified years ahead from budget creation
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

/**
 * Extends recurring budgets to cover a target year if not already propagated
 * Useful when users navigate to future years
 *
 * @param targetYear - The year that needs to have budgets propagated to
 */
export const ensureRecurringBudgetsForYear = async (targetYear: number): Promise<number> => {
  const allBudgets = await db.budgets.toArray()
  const recurringBudgets = allBudgets.filter(b => b.mode === 'recurring')

  // Group recurring budgets by their unique key (type, sourceId, groupId, subgroupId)
  const budgetsByKey = new Map<string, Budget[]>()

  recurringBudgets.forEach(budget => {
    const key = `${budget.type}-${budget.sourceId || ''}-${budget.groupId || ''}-${budget.subgroupId || ''}`
    if (!budgetsByKey.has(key)) {
      budgetsByKey.set(key, [])
    }
    budgetsByKey.get(key)!.push(budget)
  })

  let totalExtended = 0

  // For each recurring budget group, check if it needs extension
  for (const [, budgets] of budgetsByKey) {
    // Find the earliest budget (the source of the recurrence)
    const earliestBudget = budgets.reduce((earliest, current) => {
      const earliestDate = dateToMonthNumber(earliest.year, earliest.month)
      const currentDate = dateToMonthNumber(current.year, current.month)
      return currentDate < earliestDate ? current : earliest
    })

    // Find the latest propagated year for this budget
    const latestYear = Math.max(...budgets.map(b => b.year))

    // If the target year is beyond what we've propagated, extend it
    if (targetYear > latestYear) {
      const yearsToExtend = targetYear - earliestBudget.year + 2 // Add buffer of 2 years
      const extended = await propagateRecurrentBudget(earliestBudget, yearsToExtend)
      totalExtended += extended
    }
  }

  if (totalExtended > 0) {
    logger.info(`Extended recurring budgets to year ${targetYear}`, {
      budgetsExtended: totalExtended,
    })
  }

  return totalExtended
}
