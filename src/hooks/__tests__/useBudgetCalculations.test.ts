import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBudgetCalculations } from '../useBudgetCalculations'
import { Transaction, Budget, Category } from '@/types'

describe('useBudgetCalculations', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
  ]

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      type: 'earning',
      value: 5000,
      date: '2024-03-15',
      sourceId: 1,
    },
    {
      id: 2,
      type: 'expense',
      value: 500,
      date: '2024-03-20',
      groupId: 1,
    },
    {
      id: 3,
      type: 'expense',
      value: 300,
      date: '2024-03-25',
      groupId: 2,
    },
  ]

  const mockBudgets: Budget[] = [
    {
      id: 1,
      year: 2024,
      month: 3,
      type: 'income',
      sourceId: 1,
      amount: 5000,
    },
    {
      id: 2,
      year: 2024,
      month: 3,
      type: 'expense',
      groupId: 1,
      amount: 600,
    },
    {
      id: 3,
      year: 2024,
      month: 3,
      type: 'expense',
      groupId: 2,
      amount: 400,
    },
  ]

  it('calculates monthly summary correctly', () => {
    const { result } = renderHook(() =>
      useBudgetCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 3)
    )

    expect(result.current.monthSummary.totalIncome).toBe(5000)
    expect(result.current.monthSummary.totalExpense).toBe(800)
    expect(result.current.monthSummary.budgetedIncome).toBe(5000)
    expect(result.current.monthSummary.budgetedExpense).toBe(1000)
    expect(result.current.monthSummary.netBalance).toBe(4200)
  })

  it('calculates group summaries correctly', () => {
    const { result } = renderHook(() =>
      useBudgetCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 3)
    )

    const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
    expect(alimentacao).toBeDefined()
    expect(alimentacao?.actual).toBe(500)
    expect(alimentacao?.budgeted).toBe(600)
    expect(alimentacao?.remaining).toBe(100)
  })

  it('handles empty data gracefully', () => {
    const { result } = renderHook(() =>
      useBudgetCalculations([], [], [], 2024, 3)
    )

    expect(result.current.monthSummary.totalIncome).toBe(0)
    expect(result.current.monthSummary.totalExpense).toBe(0)
    expect(result.current.groupSummaries).toEqual([])
  })

  it('filters transactions by month correctly', () => {
    const transactionsWithDifferentMonths: Transaction[] = [
      ...mockTransactions,
      {
        id: 4,
        type: 'expense',
        value: 1000,
        date: '2024-04-15', // Different month
        groupId: 1,
      },
    ]

    const { result } = renderHook(() =>
      useBudgetCalculations(transactionsWithDifferentMonths, mockBudgets, mockCategories, 2024, 3)
    )

    // Should not include April transaction
    expect(result.current.monthSummary.totalExpense).toBe(800)
  })
})
