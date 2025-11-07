import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/db'
import { propagateBudget, propagateRecurrentBudget, propagateInstallmentBudget, ensureRecurringBudgetsForYear } from '../propagateRecurrentBudgets'
import { Budget } from '@/types'

describe('propagateRecurrentBudgets', () => {
  beforeEach(async () => {
    await db.budgets.clear()
  })

  describe('propagateRecurrentBudget', () => {
    it('should propagate recurring budget to future months', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      await db.budgets.add(budget)
      const count = await propagateRecurrentBudget(budget)

      expect(count).toBeGreaterThan(0)

      // Check that budgets were created for future months
      const allBudgets = await db.budgets.toArray()
      const futureBudgets = allBudgets.filter(b =>
        b.year === 2024 && b.month > 1 && b.groupId === 1
      )

      expect(futureBudgets.length).toBeGreaterThan(0)
      expect(futureBudgets[0].amount).toBe(1000)
      expect(futureBudgets[0].mode).toBe('recurring')
    })

    it('should not propagate if mode is not recurring', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'unique',
      }

      await db.budgets.add(budget)
      const count = await propagateRecurrentBudget(budget)

      expect(count).toBe(0)
    })

    it('should not create duplicates if budget already exists', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      // Create the original budget
      await db.budgets.add(budget)

      // Manually create a budget for February
      await db.budgets.add({
        year: 2024,
        month: 2,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      })

      await propagateRecurrentBudget(budget)

      // Should skip February since it already exists
      const februaryBudgets = await db.budgets
        .where({ year: 2024, month: 2, groupId: 1 })
        .toArray()

      expect(februaryBudgets.length).toBe(1)
    })
  })

  describe('propagateInstallmentBudget', () => {
    it('should propagate installment budget for specified months', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 300,
        mode: 'installment',
        installments: 3,
        installmentNumber: 1,
      }

      await db.budgets.add(budget)
      const count = await propagateInstallmentBudget(budget)

      expect(count).toBe(2) // Should create 2 more (total 3)

      const allBudgets = await db.budgets.toArray()
      const installmentBudgets = allBudgets.filter(b => b.groupId === 1)

      expect(installmentBudgets.length).toBe(3)
      expect(installmentBudgets[1].installmentNumber).toBe(2)
      expect(installmentBudgets[2].installmentNumber).toBe(3)
    })

    it('should handle year overflow for installments', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 11,
        type: 'expense',
        groupId: 1,
        amount: 500,
        mode: 'installment',
        installments: 4,
        installmentNumber: 1,
      }

      await db.budgets.add(budget)
      const count = await propagateInstallmentBudget(budget)

      expect(count).toBe(3)

      const allBudgets = await db.budgets.toArray()

      // Should have budgets in November, December 2024, and January, February 2025
      const dec2024 = allBudgets.find(b => b.year === 2024 && b.month === 12)
      const jan2025 = allBudgets.find(b => b.year === 2025 && b.month === 1)
      const feb2025 = allBudgets.find(b => b.year === 2025 && b.month === 2)

      expect(dec2024).toBeDefined()
      expect(jan2025).toBeDefined()
      expect(feb2025).toBeDefined()
    })

    it('should not propagate if mode is not installment', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      await db.budgets.add(budget)
      const count = await propagateInstallmentBudget(budget)

      expect(count).toBe(0)
    })
  })

  describe('propagateBudget', () => {
    it('should call propagateRecurrentBudget for recurring budgets', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      await db.budgets.add(budget)
      const count = await propagateBudget(budget)

      expect(count).toBeGreaterThan(0)
    })

    it('should call propagateInstallmentBudget for installment budgets', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 300,
        mode: 'installment',
        installments: 3,
        installmentNumber: 1,
      }

      await db.budgets.add(budget)
      const count = await propagateBudget(budget)

      expect(count).toBe(2)
    })

    it('should return 0 for unique budgets', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'unique',
      }

      await db.budgets.add(budget)
      const count = await propagateBudget(budget)

      expect(count).toBe(0)
    })
  })

  describe('ensureRecurringBudgetsForYear', () => {
    it('should extend recurring budgets to target year', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      await db.budgets.add(budget)
      await propagateRecurrentBudget(budget, 2) // Only propagate 2 years initially

      // Now ensure budgets exist for 2030
      const extended = await ensureRecurringBudgetsForYear(2030)

      expect(extended).toBeGreaterThan(0)

      // Check that budgets were created for 2030
      const budgets2030 = await db.budgets
        .where({ year: 2030, groupId: 1 })
        .toArray()

      expect(budgets2030.length).toBeGreaterThan(0)
    })

    it('should not extend if target year is already covered', async () => {
      const budget: Budget = {
        id: 1,
        year: 2024,
        month: 1,
        type: 'expense',
        groupId: 1,
        amount: 1000,
        mode: 'recurring',
      }

      await db.budgets.add(budget)
      await propagateRecurrentBudget(budget, 10) // Propagate 10 years

      // Try to ensure budgets for 2026 (already covered)
      const extended = await ensureRecurringBudgetsForYear(2026)

      expect(extended).toBe(0)
    })
  })
})
