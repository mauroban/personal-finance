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

    it('marks future months correctly for past years', () => {
      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, 2020)
      )

      // All months in a past year should not be marked as future
      result.current.yearlySummary.monthlyBreakdowns.forEach(breakdown => {
        expect(breakdown.isFuture).toBe(false)
      })
    })

    it('marks future months correctly for current year', () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, currentYear)
      )

      // Past and current months should not be future
      for (let month = 1; month <= currentMonth; month++) {
        const breakdown = result.current.yearlySummary.monthlyBreakdowns[month - 1]
        expect(breakdown.isFuture).toBe(false)
      }

      // Future months should be marked as future
      for (let month = currentMonth + 1; month <= 12; month++) {
        const breakdown = result.current.yearlySummary.monthlyBreakdowns[month - 1]
        expect(breakdown.isFuture).toBe(true)
        expect(breakdown.income).toBe(0)
        expect(breakdown.expense).toBe(0)
        expect(breakdown.netBalance).toBe(0)
        expect(breakdown.incomeVariance).toBe(0)
        expect(breakdown.expenseVariance).toBe(0)
      }
    })

    it('marks all months as future for future years', () => {
      const futureYear = new Date().getFullYear() + 1

      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, mockBudgets, mockCategories, futureYear)
      )

      // All months in a future year should be marked as future
      result.current.yearlySummary.monthlyBreakdowns.forEach(breakdown => {
        expect(breakdown.isFuture).toBe(true)
        expect(breakdown.income).toBe(0)
        expect(breakdown.expense).toBe(0)
        expect(breakdown.netBalance).toBe(0)
      })
    })

    it('excludes future months from totals', () => {
      const now = new Date()
      const currentYear = now.getFullYear()

      // Add budgets for future months
      const budgetsWithFuture: Budget[] = [
        ...mockBudgets,
        { id: 100, year: currentYear, month: 12, type: 'income', sourceId: 1, amount: 10000 },
        { id: 101, year: currentYear, month: 12, type: 'expense', groupId: 1, amount: 8000 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(mockTransactions, budgetsWithFuture, mockCategories, currentYear)
      )

      // Total budgeted income should include future month budgets
      expect(result.current.yearlySummary.totalBudgetedIncome).toBeGreaterThan(0)

      // But total actual income should not include future months
      // (This will depend on the current month, but we can verify by checking the sum)
      const manualTotal = result.current.yearlySummary.monthlyBreakdowns
        .filter(b => !b.isFuture)
        .reduce((sum, b) => sum + b.income, 0)

      expect(result.current.yearlySummary.totalIncome).toBe(manualTotal)
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

    it('should only include parent categories in summary', () => {
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

  describe('subcategory consolidation', () => {
    const categoriesWithSubcategories: Category[] = [
      { id: 1, name: 'Alimentação' },
      { id: 10, name: 'Restaurantes', parentId: 1 },
      { id: 11, name: 'Supermercado', parentId: 1 },
      { id: 2, name: 'Transporte' },
      { id: 20, name: 'Combustível', parentId: 2 },
    ]

    it('consolidates subcategory transactions into parent total across the year', () => {
      const transactionsWithSubcategories: Transaction[] = [
        // January - parent and subcategories
        { id: 1, type: 'expense', value: 100, date: '2024-01-15', groupId: 1 },
        { id: 2, type: 'expense', value: 200, date: '2024-01-16', subgroupId: 10 },
        { id: 3, type: 'expense', value: 300, date: '2024-01-17', subgroupId: 11 },
        // February - only subcategories
        { id: 4, type: 'expense', value: 250, date: '2024-02-15', subgroupId: 10 },
        { id: 5, type: 'expense', value: 350, date: '2024-02-16', subgroupId: 11 },
        // March - only parent
        { id: 6, type: 'expense', value: 400, date: '2024-03-15', groupId: 1 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 800 },
        { id: 2, year: 2024, month: 2, type: 'expense', groupId: 1, amount: 700 },
        { id: 3, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 500 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactionsWithSubcategories, budgets, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      // Total actual: Jan(100+200+300) + Feb(250+350) + Mar(400) = 1600
      expect(alimentacao?.totalActual).toBe(1600)
      expect(alimentacao?.totalBudgeted).toBe(2000) // 800 + 700 + 500
      expect(alimentacao?.totalRemaining).toBe(400)
      expect(alimentacao?.averagePercentage).toBe(80) // 1600/2000 * 100
    })

    it('consolidates subcategory budgets into parent total across the year', () => {
      const transactions: Transaction[] = [
        { id: 1, type: 'expense', value: 500, date: '2024-01-15', groupId: 1 },
        { id: 2, type: 'expense', value: 600, date: '2024-02-15', groupId: 1 },
      ]

      const budgetsWithSubcategories: Budget[] = [
        // January - parent + subcategories
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 200 },
        { id: 2, year: 2024, month: 1, type: 'expense', subgroupId: 10, amount: 300 },
        { id: 3, year: 2024, month: 1, type: 'expense', subgroupId: 11, amount: 400 },
        // February - only subcategories
        { id: 4, year: 2024, month: 2, type: 'expense', subgroupId: 10, amount: 350 },
        { id: 5, year: 2024, month: 2, type: 'expense', subgroupId: 11, amount: 450 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactions, budgetsWithSubcategories, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(alimentacao).toBeDefined()
      // Total budgeted: Jan(200+300+400) + Feb(350+450) = 1700
      expect(alimentacao?.totalBudgeted).toBe(1700)
      expect(alimentacao?.totalActual).toBe(1100) // 500 + 600
    })

    it('includes correct monthly data with subcategory consolidation', () => {
      const transactions: Transaction[] = [
        // January
        { id: 1, type: 'expense', value: 100, date: '2024-01-15', groupId: 1 },
        { id: 2, type: 'expense', value: 200, date: '2024-01-16', subgroupId: 10 },
        // February
        { id: 3, type: 'expense', value: 300, date: '2024-02-15', subgroupId: 11 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 150 },
        { id: 2, year: 2024, month: 1, type: 'expense', subgroupId: 10, amount: 250 },
        { id: 3, year: 2024, month: 2, type: 'expense', subgroupId: 11, amount: 400 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactions, budgets, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      expect(alimentacao?.monthlyData).toHaveLength(12)

      // Check January
      const january = alimentacao?.monthlyData[0]
      expect(january?.month).toBe(1)
      expect(january?.actual).toBe(300) // 100 + 200
      expect(january?.budgeted).toBe(400) // 150 + 250

      // Check February
      const february = alimentacao?.monthlyData[1]
      expect(february?.month).toBe(2)
      expect(february?.actual).toBe(300)
      expect(february?.budgeted).toBe(400)

      // Check March (no data)
      const march = alimentacao?.monthlyData[2]
      expect(march?.month).toBe(3)
      expect(march?.actual).toBe(0)
      expect(march?.budgeted).toBe(0)
    })

    it('handles multiple parent categories with subcategories independently across the year', () => {
      const transactions: Transaction[] = [
        // Alimentação - January
        { id: 1, type: 'expense', value: 100, date: '2024-01-15', groupId: 1 },
        { id: 2, type: 'expense', value: 200, date: '2024-01-16', subgroupId: 10 },
        // Transporte - January
        { id: 3, type: 'expense', value: 50, date: '2024-01-17', groupId: 2 },
        { id: 4, type: 'expense', value: 150, date: '2024-01-18', subgroupId: 20 },
        // Alimentação - February
        { id: 5, type: 'expense', value: 250, date: '2024-02-15', subgroupId: 11 },
        // Transporte - February
        { id: 6, type: 'expense', value: 180, date: '2024-02-16', subgroupId: 20 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 400 },
        { id: 2, year: 2024, month: 1, type: 'expense', subgroupId: 10, amount: 100 },
        { id: 3, year: 2024, month: 1, type: 'expense', groupId: 2, amount: 300 },
        { id: 4, year: 2024, month: 2, type: 'expense', subgroupId: 11, amount: 350 },
        { id: 5, year: 2024, month: 2, type: 'expense', groupId: 2, amount: 250 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactions, budgets, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      const transporte = result.current.yearlyGroupSummaries.find(g => g.groupId === 2)

      // Alimentação yearly totals
      expect(alimentacao?.totalActual).toBe(550) // Jan(100+200) + Feb(250)
      expect(alimentacao?.totalBudgeted).toBe(850) // Jan(400+100) + Feb(350)

      // Transporte yearly totals
      expect(transporte?.totalActual).toBe(380) // Jan(50+150) + Feb(180)
      expect(transporte?.totalBudgeted).toBe(550) // Jan(300) + Feb(250)
    })

    it('does not consolidate subcategories from different parents', () => {
      const transactions: Transaction[] = [
        // Alimentação subcategory
        { id: 1, type: 'expense', value: 200, date: '2024-01-15', subgroupId: 10 },
        { id: 2, type: 'expense', value: 150, date: '2024-02-15', subgroupId: 11 },
        // Transporte subcategory
        { id: 3, type: 'expense', value: 100, date: '2024-01-16', subgroupId: 20 },
        { id: 4, type: 'expense', value: 120, date: '2024-02-16', subgroupId: 20 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 500 },
        { id: 2, year: 2024, month: 2, type: 'expense', groupId: 1, amount: 400 },
        { id: 3, year: 2024, month: 1, type: 'expense', groupId: 2, amount: 300 },
        { id: 4, year: 2024, month: 2, type: 'expense', groupId: 2, amount: 250 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactions, budgets, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)
      const transporte = result.current.yearlyGroupSummaries.find(g => g.groupId === 2)

      // Alimentação should only include its own subcategories (10, 11)
      expect(alimentacao?.totalActual).toBe(350) // 200 + 150
      expect(alimentacao?.totalBudgeted).toBe(900) // 500 + 400

      // Transporte should only include its own subcategory (20)
      expect(transporte?.totalActual).toBe(220) // 100 + 120
      expect(transporte?.totalBudgeted).toBe(550) // 300 + 250
    })

    it('consolidates mixed parent and subcategory data consistently', () => {
      const transactions: Transaction[] = [
        // Mix across multiple months
        { id: 1, type: 'expense', value: 100, date: '2024-01-15', groupId: 1 },
        { id: 2, type: 'expense', value: 150, date: '2024-01-20', subgroupId: 10 },
        { id: 3, type: 'expense', value: 200, date: '2024-02-15', subgroupId: 11 },
        { id: 4, type: 'expense', value: 120, date: '2024-03-15', groupId: 1 },
        { id: 5, type: 'expense', value: 180, date: '2024-03-20', subgroupId: 10 },
      ]

      const budgets: Budget[] = [
        { id: 1, year: 2024, month: 1, type: 'expense', groupId: 1, amount: 300 },
        { id: 2, year: 2024, month: 1, type: 'expense', subgroupId: 11, amount: 100 },
        { id: 3, year: 2024, month: 2, type: 'expense', subgroupId: 11, amount: 250 },
        { id: 4, year: 2024, month: 3, type: 'expense', groupId: 1, amount: 200 },
        { id: 5, year: 2024, month: 3, type: 'expense', subgroupId: 10, amount: 150 },
      ]

      const { result } = renderHook(() =>
        useYearlyCalculations(transactions, budgets, categoriesWithSubcategories, 2024)
      )

      const alimentacao = result.current.yearlyGroupSummaries.find(g => g.groupId === 1)

      // Total actual across all months
      expect(alimentacao?.totalActual).toBe(750) // 100+150+200+120+180
      // Total budgeted across all months
      expect(alimentacao?.totalBudgeted).toBe(1000) // 300+100+250+200+150
      expect(alimentacao?.totalRemaining).toBe(250)
      expect(alimentacao?.averagePercentage).toBe(75) // 750/1000 * 100
    })
  })
})
