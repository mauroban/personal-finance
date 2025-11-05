import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTrendCalculations } from '../useTrendCalculations'
import { Transaction, Budget, Category } from '@/types'

describe('useTrendCalculations', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Lazer' },
  ]

  const mockTransactions: Transaction[] = [
    // January 2024
    { id: 1, type: 'earning', value: 5000, date: '2024-01-15', sourceId: 1 },
    { id: 2, type: 'expense', value: 500, date: '2024-01-20', groupId: 1 },
    { id: 3, type: 'expense', value: 300, date: '2024-01-25', groupId: 2 },
    // February 2024
    { id: 4, type: 'earning', value: 5500, date: '2024-02-15', sourceId: 1 },
    { id: 5, type: 'expense', value: 600, date: '2024-02-20', groupId: 1 },
    { id: 6, type: 'expense', value: 400, date: '2024-02-25', groupId: 2 },
    // March 2024
    { id: 7, type: 'earning', value: 5200, date: '2024-03-15', sourceId: 1 },
    { id: 8, type: 'expense', value: 550, date: '2024-03-20', groupId: 1 },
    { id: 9, type: 'expense', value: 350, date: '2024-03-25', groupId: 2 },
    // April 2024
    { id: 10, type: 'earning', value: 5300, date: '2024-04-15', sourceId: 1 },
    { id: 11, type: 'expense', value: 650, date: '2024-04-20', groupId: 1 },
    { id: 12, type: 'expense', value: 450, date: '2024-04-25', groupId: 2 },
    // May 2024
    { id: 13, type: 'earning', value: 5400, date: '2024-05-15', sourceId: 1 },
    { id: 14, type: 'expense', value: 700, date: '2024-05-20', groupId: 1 },
    { id: 15, type: 'expense', value: 500, date: '2024-05-25', groupId: 2 },
    // June 2024
    { id: 16, type: 'earning', value: 5600, date: '2024-06-15', sourceId: 1 },
    { id: 17, type: 'expense', value: 800, date: '2024-06-20', groupId: 1 },
    { id: 18, type: 'expense', value: 600, date: '2024-06-25', groupId: 2 },
  ]

  const mockBudgets: Budget[] = [
    { id: 1, year: 2024, month: 1, type: 'income', sourceId: 1, amount: 5000 },
    { id: 2, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 600 },
    { id: 3, year: 2024, month: 1, type: 'expense', groupId: 2, amount: 400 },
    { id: 4, year: 2024, month: 2, type: 'income', sourceId: 1, amount: 5000 },
    { id: 5, year: 2024, month: 2, type: 'expense', groupId: 1, amount: 600 },
    { id: 6, year: 2024, month: 2, type: 'expense', groupId: 2, amount: 400 },
    { id: 7, year: 2024, month: 3, type: 'income', sourceId: 1, amount: 5000 },
    { id: 8, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 600 },
    { id: 9, year: 2024, month: 3, type: 'expense', groupId: 2, amount: 400 },
    { id: 10, year: 2024, month: 4, type: 'income', sourceId: 1, amount: 5000 },
    { id: 11, year: 2024, month: 4, type: 'expense', groupId: 1, amount: 600 },
    { id: 12, year: 2024, month: 4, type: 'expense', groupId: 2, amount: 400 },
    { id: 13, year: 2024, month: 5, type: 'income', sourceId: 1, amount: 5000 },
    { id: 14, year: 2024, month: 5, type: 'expense', groupId: 1, amount: 600 },
    { id: 15, year: 2024, month: 5, type: 'expense', groupId: 2, amount: 400 },
    { id: 16, year: 2024, month: 6, type: 'income', sourceId: 1, amount: 5000 },
    { id: 17, year: 2024, month: 6, type: 'expense', groupId: 1, amount: 600 },
    { id: 18, year: 2024, month: 6, type: 'expense', groupId: 2, amount: 400 },
  ]

  describe('varianceTrend', () => {
    it('calculates variance correctly for each month', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(result.current.varianceTrend).toHaveLength(6)

      // Check January (income 5000 - expense 800) vs (budget 5000 - budget 1000) = 4200 vs 4000
      const january = result.current.varianceTrend[0]
      expect(january.month).toBe(1)
      expect(january.budgeted).toBe(4000) // 5000 - 1000
      expect(january.actual).toBe(4200) // 5000 - 800
      expect(january.variance).toBe(200)
    })

    it('calculates percentage variance correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const january = result.current.varianceTrend[0]
      expect(january.percentage).toBe(5) // 200 / 4000 * 100
    })
  })

  describe('savingsTrend', () => {
    it('calculates savings for each month', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(result.current.savingsTrend).toHaveLength(6)

      // Check January
      const january = result.current.savingsTrend[0]
      expect(january.month).toBe(1)
      expect(january.savings).toBe(4200) // 5000 - 800
    })

    it('calculates savings rate correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const january = result.current.savingsTrend[0]
      expect(january.savingsRate).toBe(84) // (4200 / 5000) * 100
    })
  })

  describe('categoryTrends', () => {
    it('includes all categories with transactions', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      // Should include Alimentação and Transporte (both have transactions)
      // Should not include Lazer (no transactions)
      expect(result.current.categoryTrends.length).toBe(2)
      expect(result.current.categoryTrends.find(ct => ct.categoryId === 3)).toBeUndefined()
    })

    it('calculates category totals correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const alimentacao = result.current.categoryTrends.find(ct => ct.categoryId === 1)
      expect(alimentacao).toBeDefined()
      expect(alimentacao?.total).toBe(3800) // 500 + 600 + 550 + 650 + 700 + 800
    })

    it('calculates category average correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const alimentacao = result.current.categoryTrends.find(ct => ct.categoryId === 1)
      expect(alimentacao?.average).toBeCloseTo(633.33, 1) // 3800 / 6
    })

    it('detects upward trend correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const alimentacao = result.current.categoryTrends.find(ct => ct.categoryId === 1)
      // First half average: (500 + 600 + 550) / 3 = 550
      // Second half average: (650 + 700 + 800) / 3 = 716.67
      // Change: (716.67 - 550) / 550 * 100 = ~30%
      expect(alimentacao?.trend).toBe('up')
      expect(alimentacao?.percentageChange).toBeGreaterThan(25)
    })

    it('includes monthly data for each category', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const alimentacao = result.current.categoryTrends.find(ct => ct.categoryId === 1)
      expect(alimentacao?.data).toHaveLength(6)
      expect(alimentacao?.data[0].value).toBe(500) // January
      expect(alimentacao?.data[5].value).toBe(800) // June
    })
  })

  describe('budgetAdherence', () => {
    it('calculates budget adherence score', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(result.current.budgetAdherence).toBeGreaterThan(0)
      expect(result.current.budgetAdherence).toBeLessThanOrEqual(100)
    })

    it('returns 0 when no budgets exist', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, [], mockCategories, 2024, 6, 6)
      )

      expect(result.current.budgetAdherence).toBe(0)
    })
  })

  describe('insights', () => {
    it('generates insights array', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(Array.isArray(result.current.insights)).toBe(true)
      expect(result.current.insights.length).toBeGreaterThan(0)
    })

    it('includes insight types', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      result.current.insights.forEach(insight => {
        expect(['observation', 'recommendation', 'achievement']).toContain(insight.type)
        expect(insight.message).toBeTruthy()
        expect(insight.icon).toBeTruthy()
      })
    })

    it('identifies best month', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const bestMonthInsight = result.current.insights.find(i => i.message.includes('Melhor mês'))
      expect(bestMonthInsight).toBeDefined()
      expect(bestMonthInsight?.type).toBe('achievement')
    })

    it('identifies increasing category spending', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      const increasingInsight = result.current.insights.find(i =>
        i.message.includes('aumentaram')
      )
      expect(increasingInsight).toBeDefined()
    })
  })

  describe('periodSummary', () => {
    it('calculates period summary correctly', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(result.current.periodSummary.monthsAnalyzed).toBe(6)
      expect(result.current.periodSummary.totalIncome).toBeGreaterThan(0)
      expect(result.current.periodSummary.totalExpense).toBeGreaterThan(0)
      expect(result.current.periodSummary.totalSavings).toBeGreaterThan(0)
      expect(result.current.periodSummary.averageMonthlySavings).toBeGreaterThan(0)
    })
  })

  describe('period handling', () => {
    it('handles different month back periods', () => {
      const { result: result3 } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 3)
      )

      const { result: result12 } = renderHook(() =>
        useTrendCalculations(mockTransactions, mockBudgets, mockCategories, 2024, 6, 12)
      )

      expect(result3.current.varianceTrend).toHaveLength(3)
      expect(result12.current.varianceTrend).toHaveLength(12)
    })

    it('handles cross-year periods', () => {
      const transactionsWithPreviousYear: Transaction[] = [
        ...mockTransactions,
        { id: 100, type: 'earning', value: 5000, date: '2023-12-15', sourceId: 1 },
        { id: 101, type: 'expense', value: 800, date: '2023-12-20', groupId: 1 },
      ]

      const budgetsWithPreviousYear: Budget[] = [
        ...mockBudgets,
        { id: 100, year: 2023, month: 12, type: 'income', sourceId: 1, amount: 5000 },
        { id: 101, year: 2023, month: 12, type: 'expense', groupId: 1, amount: 1000 },
      ]

      const { result } = renderHook(() =>
        useTrendCalculations(
          transactionsWithPreviousYear,
          budgetsWithPreviousYear,
          mockCategories,
          2024,
          1,
          2 // January 2024 and December 2023
        )
      )

      expect(result.current.varianceTrend).toHaveLength(2)
      expect(result.current.varianceTrend[0].year).toBe(2023)
      expect(result.current.varianceTrend[0].month).toBe(12)
      expect(result.current.varianceTrend[1].year).toBe(2024)
      expect(result.current.varianceTrend[1].month).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('handles empty transactions', () => {
      const { result } = renderHook(() =>
        useTrendCalculations([], mockBudgets, mockCategories, 2024, 6, 6)
      )

      expect(result.current.varianceTrend).toHaveLength(6)
      expect(result.current.categoryTrends).toHaveLength(0)
    })

    it('handles empty budgets', () => {
      const { result } = renderHook(() =>
        useTrendCalculations(mockTransactions, [], mockCategories, 2024, 6, 6)
      )

      expect(result.current.varianceTrend).toHaveLength(6)
      expect(result.current.budgetAdherence).toBe(0)
    })

    it('handles categories with subcategories', () => {
      const categoriesWithSub: Category[] = [
        { id: 1, name: 'Alimentação' },
        { id: 10, name: 'Restaurantes', parentId: 1 },
        { id: 2, name: 'Transporte' },
      ]

      const transactionsWithSub: Transaction[] = [
        { id: 1, type: 'earning', value: 5000, date: '2024-01-15', sourceId: 1 },
        { id: 2, type: 'expense', value: 300, date: '2024-01-20', groupId: 1 },
        { id: 3, type: 'expense', value: 200, date: '2024-01-25', subgroupId: 10 },
      ]

      const { result } = renderHook(() =>
        useTrendCalculations(transactionsWithSub, mockBudgets, categoriesWithSub, 2024, 1, 1)
      )

      const alimentacao = result.current.categoryTrends.find(ct => ct.categoryId === 1)
      expect(alimentacao).toBeDefined()
      // Should consolidate parent + subcategory
      expect(alimentacao?.data[0].value).toBe(500) // 300 + 200
    })
  })
})
