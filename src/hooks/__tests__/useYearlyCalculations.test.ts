import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useYearlyCalculations } from '../useYearlyCalculations'
import { Transaction, Budget, Category } from '@/types'

describe('useYearlyCalculations', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
  ]

  const mockTransactions: Transaction[] = [
    // January
    { id: 1, type: 'earning', value: 5000, date: '2024-01-15', sourceId: 1 },
    { id: 2, type: 'expense', value: 500, date: '2024-01-20', groupId: 1 },
    { id: 3, type: 'expense', value: 300, date: '2024-01-25', groupId: 2 },
    // February
    { id: 4, type: 'earning', value: 5500, date: '2024-02-15', sourceId: 1 },
    { id: 5, type: 'expense', value: 600, date: '2024-02-20', groupId: 1 },
    { id: 6, type: 'expense', value: 400, date: '2024-02-25', groupId: 2 },
    // March
    { id: 7, type: 'earning', value: 5200, date: '2024-03-15', sourceId: 1 },
    { id: 8, type: 'expense', value: 550, date: '2024-03-20', groupId: 1 },
    { id: 9, type: 'expense', value: 350, date: '2024-03-25', groupId: 2 },
  ]

  const mockBudgets: Budget[] = [
    // January
    { id: 1, year: 2024, month: 1, type: 'income', sourceId: 1, amount: 5000 },
    { id: 2, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 600 },
    { id: 3, year: 2024, month: 1, type: 'expense', groupId: 2, amount: 400 },
    // February
    { id: 4, year: 2024, month: 2, type: 'income', sourceId: 1, amount: 5000 },
    { id: 5, year: 2024, month: 2, type: 'expense', groupId: 1, amount: 600 },
    { id: 6, year: 2024, month: 2, type: 'expense', groupId: 2, amount: 400 },
    // March
    { id: 7, year: 2024, month: 3, type: 'income', sourceId: 1, amount: 5000 },
    { id: 8, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 600 },
    { id: 9, year: 2024, month: 3, type: 'expense', groupId: 2, amount: 400 },
  ]

  describe('yearlySummary', () => {
    it('calculates total income correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.totalIncome).toBe(15700) // 5000 + 5500 + 5200
    })

    it('calculates total expense correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.totalExpense).toBe(2700) // 800 + 1000 + 900
    })

    it('calculates total budgeted income correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.totalBudgetedIncome).toBe(15000) // 5000 * 3
    })

    it('calculates total budgeted expense correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.totalBudgetedExpense).toBe(3000) // 1000 * 3
    })

    it('calculates net balance correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.netBalance).toBe(13000) // 15700 - 2700
    })

    it('calculates income variance correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.totalIncomeVariance).toBe(700) // 15700 - 15000
    })

    it('calculates expense variance correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      // Positive variance means under budget (good)
      expect(result.current.yearlySummary.totalExpenseVariance).toBe(300) // 3000 - 2700
    })
  })

  describe('monthlyBreakdowns', () => {
    it('generates breakdown for all 12 months', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlySummary.monthlyBreakdowns).toHaveLength(12)
    })

    it('calculates January breakdown correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      const january = result.current.yearlySummary.monthlyBreakdowns[0]
      expect(january.month).toBe(1)
      expect(january.monthName).toBe('Janeiro')
      expect(january.income).toBe(5000)
      expect(january.expense).toBe(800)
      expect(january.budgetedIncome).toBe(5000)
      expect(january.budgetedExpense).toBe(1000)
      expect(january.netBalance).toBe(4200)
      expect(january.incomeVariance).toBe(0)
      expect(january.expenseVariance).toBe(200) // 1000 - 800
    })

    it('handles months with no data', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      const april = result.current.yearlySummary.monthlyBreakdowns[3]
      expect(april.month).toBe(4)
      expect(april.income).toBe(0)
      expect(april.expense).toBe(0)
      expect(april.budgetedIncome).toBe(0)
      expect(april.budgetedExpense).toBe(0)
    })
  })

  describe('yearlyGroupSummaries', () => {
    it('generates summaries for all categories', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      expect(result.current.yearlyGroupSummaries).toHaveLength(2)
    })

    it('calculates Alimentação category correctly', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      expect(alimentacao?.groupName).toBe('Alimentação')
      expect(alimentacao?.totalBudgeted).toBe(1800) // 600 * 3
      expect(alimentacao?.totalActual).toBe(1650) // 500 + 600 + 550
      expect(alimentacao?.totalRemaining).toBe(150)
      expect(alimentacao?.averagePercentage).toBeCloseTo(91.67, 1) // (1650 / 1800) * 100
    })

    it('includes monthly data for each category', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(alimentacao?.monthlyData).toHaveLength(12)

      // Check January
      const january = alimentacao?.monthlyData[0]
      expect(january?.month).toBe(1)
      expect(january?.budgeted).toBe(600)
      expect(january?.actual).toBe(500)
    })

    it('filters out categories with no budget and no transactions', () => {
      const categoriesWithExtra: Category[] = [
        ...mockCategories,
        { id: 3, name: 'Lazer' },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, categoriesWithExtra, 2024)
      )

      // Should only include categories with actual data
      expect(result.current.yearlyGroupSummaries).toHaveLength(2)
      expect(result.current.yearlyGroupSummaries.find(g => g.groupId === 3)).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty data gracefully', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations([], [], [], 2024)
      )

      expect(result.current.yearlySummary.totalIncome).toBe(0)
      expect(result.current.yearlySummary.totalExpense).toBe(0)
      expect(result.current.yearlyGroupSummaries).toEqual([])
    })

    it('filters transactions by year correctly', () => {
      const transactionsWithDifferentYears: Transaction[] = [
        ...mockTransactions,
        { id: 10, type: 'expense', value: 10000, date: '2023-01-15', groupId: 1 },
        { id: 11, type: 'expense', value: 10000, date: '2025-01-15', groupId: 1 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactionsWithDifferentYears, mockBudgets, mockCategories, 2024)
      )

      // Should not include 2023 or 2025 transactions
      expect(result.current.yearlySummary.totalExpense).toBe(2700)
    })

    it('handles categories with subcategories correctly', () => {
      const categoriesWithSubcategories: Category[] = [
        { id: 1, name: 'Alimentação' },
        { id: 10, name: 'Restaurantes', parentId: 1 },
        { id: 2, name: 'Transporte' },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, categoriesWithSubcategories, 2024)
      )

      // Should only include parent categories in summary
      expect(result.current.yearlyGroupSummaries).toHaveLength(2)
      expect(result.current.yearlyGroupSummaries.find(g => g.groupId === 10)).toBeUndefined()
    })

    it('calculates percentage correctly when budget is zero', () => {
      const budgetsWithZero: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 0 },
      ]

      const transactionsWithZeroBudget: Transaction[] = [
        { id: 1, type: 'expense', value: 100, date: '2024-01-15', groupId: 1 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactionsWithZeroBudget, budgetsWithZero, mockCategories, 2024)
      )

      const category = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(category?.averagePercentage).toBe(0)
    })
  })
})
