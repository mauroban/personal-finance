import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { copyRecurrentBudgets } from '../copyRecurrentBudgets'
import { db } from '@/db'

describe('copyRecurrentBudgets', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.budgets.clear()
  })

  afterEach(async () => {
    // Clean up after each test
    await db.budgets.clear()
  })

  it('should copy recurring budgets to future months', async () => {
    // Arrange: Create a recurring budget in January
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      mode: 'recurring'
    })

    // Act: Copy to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: Budget should exist in February
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(1)
    expect(febBudgets[0].amount).toBe(1500)
    expect(febBudgets[0].mode).toBe('recurring')
    expect(febBudgets[0].groupId).toBe(1)
    expect(febBudgets[0].subgroupId).toBe(2)
  })

  it('should copy installment budgets within period only', async () => {
    // Arrange: Create a 3-month installment budget in January
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1000,
      mode: 'installment',
      installments: 3,
      installmentNumber: 1
    })

    // Act: Copy to February (within period)
    await copyRecurrentBudgets(2024, 2)

    // Assert: Budget should exist in February
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(1)
    expect(febBudgets[0].mode).toBe('installment')
    expect(febBudgets[0].installmentNumber).toBe(2)
    expect(febBudgets[0].installments).toBe(3)
  })

  it('should stop installment budgets after period ends', async () => {
    // Arrange: Create a 2-month installment budget in January
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1000,
      mode: 'installment',
      installments: 2,
      installmentNumber: 1
    })

    // Act: Try to copy to March (beyond 2-month period)
    await copyRecurrentBudgets(2024, 3)

    // Assert: No budget should be created in March
    const marchBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 3])
      .toArray()

    expect(marchBudgets).toHaveLength(0)
  })

  it('should use most recent budget values when multiple exist', async () => {
    // Arrange: Create two recurring budgets for same category in different months
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1000,
      mode: 'recurring'
    })

    await db.budgets.add({
      year: 2024,
      month: 2,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500, // Updated amount
      mode: 'recurring'
    })

    // Act: Copy to March
    await copyRecurrentBudgets(2024, 3)

    // Assert: Should use the most recent value (1500)
    const marchBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 3])
      .toArray()

    expect(marchBudgets).toHaveLength(1)
    expect(marchBudgets[0].amount).toBe(1500)
  })

  it('should skip months that already have budgets', async () => {
    // Arrange: Create recurring budget in January
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1000,
      mode: 'recurring'
    })

    // Create existing budget in February
    await db.budgets.add({
      year: 2024,
      month: 2,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 2000, // Different amount
      mode: 'unique'
    })

    // Act: Try to copy to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: Should not overwrite existing budget
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(1)
    expect(febBudgets[0].amount).toBe(2000) // Original value preserved
    expect(febBudgets[0].mode).toBe('unique')
  })

  it('should handle year rollover correctly', async () => {
    // Arrange: Create recurring budget in December 2024
    await db.budgets.add({
      year: 2024,
      month: 12,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      mode: 'recurring'
    })

    // Act: Copy to January 2025
    await copyRecurrentBudgets(2025, 1)

    // Assert: Budget should exist in January 2025
    const jan2025Budgets = await db.budgets
      .where('[year+month]')
      .equals([2025, 1])
      .toArray()

    expect(jan2025Budgets).toHaveLength(1)
    expect(jan2025Budgets[0].amount).toBe(1500)
    expect(jan2025Budgets[0].mode).toBe('recurring')
  })

  it('should handle legacy isRecurrent field', async () => {
    // Arrange: Create budget with legacy isRecurrent field (no mode)
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      isRecurrent: true
      // No mode field
    } as any)

    // Act: Copy to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: Should treat as recurring
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(1)
    expect(febBudgets[0].amount).toBe(1500)
  })

  it('should handle empty budget arrays gracefully', async () => {
    // Arrange: No budgets in database

    // Act: Try to copy (should not throw)
    await copyRecurrentBudgets(2024, 2)

    // Assert: No budgets created
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(0)
  })

  it('should not copy unique budgets', async () => {
    // Arrange: Create unique budget in January
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      mode: 'unique'
    })

    // Act: Try to copy to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: No budget should be created in February
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(0)
  })

  it('should handle budgets from distant past', async () => {
    // Arrange: Create recurring budget from 6 months ago
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1500,
      mode: 'recurring'
    })

    // Act: Copy to July (6 months later)
    await copyRecurrentBudgets(2024, 7)

    // Assert: Should still copy the budget
    const julyBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 7])
      .toArray()

    expect(julyBudgets).toHaveLength(1)
    expect(julyBudgets[0].amount).toBe(1500)
  })

  it('should handle income budgets (sourceId) correctly', async () => {
    // Arrange: Create recurring income budget
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'income',
      sourceId: 5,
      amount: 5000,
      mode: 'recurring'
    })

    // Act: Copy to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: Income budget should be copied
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(1)
    expect(febBudgets[0].type).toBe('income')
    expect(febBudgets[0].sourceId).toBe(5)
    expect(febBudgets[0].amount).toBe(5000)
  })

  it('should copy multiple different budgets in one call', async () => {
    // Arrange: Create multiple recurring budgets
    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 1,
      subgroupId: 2,
      amount: 1000,
      mode: 'recurring'
    })

    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'expense',
      groupId: 3,
      subgroupId: 4,
      amount: 500,
      mode: 'recurring'
    })

    await db.budgets.add({
      year: 2024,
      month: 1,
      type: 'income',
      sourceId: 1,
      amount: 5000,
      mode: 'recurring'
    })

    // Act: Copy all to February
    await copyRecurrentBudgets(2024, 2)

    // Assert: All three should be copied
    const febBudgets = await db.budgets
      .where('[year+month]')
      .equals([2024, 2])
      .toArray()

    expect(febBudgets).toHaveLength(3)
    expect(febBudgets.map(b => b.amount).sort((a, b) => a - b)).toEqual([500, 1000, 5000])
  })
})
