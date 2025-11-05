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

  describe('subcategory consolidation', () => {
    const categoriesWithSubcategories: Category[] = [
      { id: 1, name: 'Alimentação' },
      { id: 10, name: 'Restaurantes', parentId: 1 },
      { id: 11, name: 'Supermercado', parentId: 1 },
      { id: 2, name: 'Transporte' },
      { id: 20, name: 'Combustível', parentId: 2 },
    ]

    it('consolidates subcategory transactions into parent total', () => {
      const transactionsWithSubcategories: Transaction[] = [
        // Parent level transaction
        { id: 1, type: 'expense', value: 100, date: '2024-03-15', groupId: 1 },
        // Subcategory transactions
        { id: 2, type: 'expense', value: 200, date: '2024-03-16', subgroupId: 10 },
        { id: 3, type: 'expense', value: 300, date: '2024-03-17', subgroupId: 11 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 800 },
      ]

      const { result } = renderHook(() =>
        useBudgetCalculations(transactionsWithSubcategories, budgets, categoriesWithSubcategories, 2024, 3)
      )

      const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      // Should consolidate: 100 (parent) + 200 (subcategory 10) + 300 (subcategory 11) = 600
      expect(alimentacao?.actual).toBe(600)
      expect(alimentacao?.budgeted).toBe(800)
      expect(alimentacao?.remaining).toBe(200)
      expect(alimentacao?.percentage).toBe(75) // 600/800 * 100
    })

    it('consolidates subcategory budgets into parent total', () => {
      const transactions: Transaction[] = [
        { id: 1, type: 'expense', value: 500, date: '2024-03-15', groupId: 1 },
      ]

      const budgetsWithSubcategories: Budget[] = [
        // Parent level budget
        { id: 1, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 200 },
        // Subcategory budgets
        { id: 2, year: 2024, month: 3, type: 'expense', subgroupId: 10, amount: 300 },
        { id: 3, year: 2024, month: 3, type: 'expense', subgroupId: 11, amount: 400 },
      ]

      const { result } = renderHook(() =>
        useBudgetCalculations(transactions, budgetsWithSubcategories, categoriesWithSubcategories, 2024, 3)
      )

      const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      // Should consolidate: 200 (parent) + 300 (subcategory 10) + 400 (subcategory 11) = 900
      expect(alimentacao?.budgeted).toBe(900)
      expect(alimentacao?.actual).toBe(500)
      expect(alimentacao?.remaining).toBe(400)
    })

    it('consolidates both subcategory transactions and budgets together', () => {
      const transactionsWithSubcategories: Transaction[] = [
        { id: 1, type: 'expense', value: 100, date: '2024-03-15', groupId: 1 },
        { id: 2, type: 'expense', value: 250, date: '2024-03-16', subgroupId: 10 },
        { id: 3, type: 'expense', value: 350, date: '2024-03-17', subgroupId: 11 },
      ]

      const budgetsWithSubcategories: Budget[] = [
        { id: 1, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 150 },
        { id: 2, year: 2024, month: 3, type: 'expense', subgroupId: 10, amount: 300 },
        { id: 3, year: 2024, month: 3, type: 'expense', subgroupId: 11, amount: 400 },
      ]

      const { result } = renderHook(() =>
        useBudgetCalculations(transactionsWithSubcategories, budgetsWithSubcategories, categoriesWithSubcategories, 2024, 3)
      )

      const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      expect(alimentacao?.actual).toBe(700) // 100 + 250 + 350
      expect(alimentacao?.budgeted).toBe(850) // 150 + 300 + 400
      expect(alimentacao?.remaining).toBe(150)
      expect(alimentacao?.percentage).toBeCloseTo(82.35, 1) // 700/850 * 100
    })

    it('handles multiple parent categories with subcategories independently', () => {
      const transactions: Transaction[] = [
        // Alimentação
        { id: 1, type: 'expense', value: 100, date: '2024-03-15', groupId: 1 },
        { id: 2, type: 'expense', value: 200, date: '2024-03-16', subgroupId: 10 },
        // Transporte
        { id: 3, type: 'expense', value: 50, date: '2024-03-17', groupId: 2 },
        { id: 4, type: 'expense', value: 150, date: '2024-03-18', subgroupId: 20 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 400 },
        { id: 2, year: 2024, month: 3, type: 'expense', subgroupId: 10, amount: 100 },
        { id: 3, year: 2024, month: 3, type: 'expense', groupId: 2, amount: 300 },
      ]

      const { result } = renderHook(() =>
        useBudgetCalculations(transactions, budgets, categoriesWithSubcategories, 2024, 3)
      )

      const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
      const transporte = result.current.groupSummaries.find(g => g.groupId === 2)

      // Alimentação should consolidate parent + subcategory
      expect(alimentacao?.actual).toBe(300) // 100 + 200
      expect(alimentacao?.budgeted).toBe(500) // 400 + 100

      // Transporte should consolidate parent + subcategory
      expect(transporte?.actual).toBe(200) // 50 + 150
      expect(transporte?.budgeted).toBe(300) // 300 (only parent budget)
    })

    it('does not consolidate subcategories from different parents', () => {
      const transactions: Transaction[] = [
        // Alimentação subcategory
        { id: 1, type: 'expense', value: 200, date: '2024-03-15', subgroupId: 10 },
        // Transporte subcategory
        { id: 2, type: 'expense', value: 150, date: '2024-03-16', subgroupId: 20 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 500 },
        { id: 2, year: 2024, month: 3, type: 'expense', groupId: 2, amount: 300 },
      ]

      const { result } = renderHook(() =>
        useBudgetCalculations(transactions, budgets, categoriesWithSubcategories, 2024, 3)
      )

      const alimentacao = result.current.groupSummaries.find(g => g.groupId === 1)
      const transporte = result.current.groupSummaries.find(g => g.groupId === 2)

      // Alimentação should only include its own subcategory (10)
      expect(alimentacao?.actual).toBe(200)
      // Transporte should only include its own subcategory (20)
      expect(transporte?.actual).toBe(150)
    })
  })
})
