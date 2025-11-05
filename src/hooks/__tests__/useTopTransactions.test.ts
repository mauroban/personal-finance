import { renderHook } from '@testing-library/react'
import { useTopTransactions } from '../useTopTransactions'
import { Transaction, Category, Source } from '@/types'

describe('useTopTransactions', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Moradia' },
    { id: 2, name: 'Alimentação' },
    { id: 3, name: 'Transporte' },
    { id: 4, name: 'Supermercado', parentId: 2 },
  ]

  const mockSources: Source[] = [
    { id: 1, name: 'Salário' },
    { id: 2, name: 'Freelance' },
  ]

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      type: 'expense',
      value: 1500,
      date: '2025-01-15',
      groupId: 1,
      note: 'Aluguel',
    },
    {
      id: 2,
      type: 'expense',
      value: 450,
      date: '2025-01-10',
      groupId: 2,
      subgroupId: 4,
      note: 'Supermercado',
    },
    {
      id: 3,
      type: 'expense',
      value: 300,
      date: '2025-01-05',
      groupId: 3,
      note: 'Gasolina',
    },
    {
      id: 4,
      type: 'expense',
      value: 200,
      date: '2025-01-20',
      groupId: 2,
      note: 'Restaurante',
    },
    {
      id: 5,
      type: 'expense',
      value: 100,
      date: '2025-01-25',
      groupId: 3,
      note: 'Uber',
    },
    {
      id: 6,
      type: 'expense',
      value: 50,
      date: '2025-01-28',
      groupId: 2,
      note: 'Café',
    },
    {
      id: 7,
      type: 'earning',
      value: 5000,
      date: '2025-01-01',
      sourceId: 1,
      note: 'Salário',
    },
    {
      id: 8,
      type: 'expense',
      value: 800,
      date: '2024-12-15',
      groupId: 1,
      note: 'Aluguel Dezembro',
    },
  ]

  it('should return top 5 expense transactions for a month', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'expense', 5)
    )

    expect(result.current).toHaveLength(5)
    expect(result.current[0].value).toBe(1500) // Largest
    expect(result.current[1].value).toBe(450)
    expect(result.current[2].value).toBe(300)
    expect(result.current[3].value).toBe(200)
    expect(result.current[4].value).toBe(100)
  })

  it('should return top 3 transactions when limit is 3', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'expense', 3)
    )

    expect(result.current).toHaveLength(3)
    expect(result.current[0].value).toBe(1500)
    expect(result.current[1].value).toBe(450)
    expect(result.current[2].value).toBe(300)
  })

  it('should enrich transactions with category names', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'expense', 3)
    )

    expect(result.current[0].categoryName).toBe('Moradia')
    expect(result.current[1].categoryName).toBe('Alimentação')
    expect(result.current[1].subcategoryName).toBe('Supermercado')
    expect(result.current[2].categoryName).toBe('Transporte')
  })

  it('should filter by month correctly', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2024, 12, 'expense', 5)
    )

    expect(result.current).toHaveLength(1)
    expect(result.current[0].note).toBe('Aluguel Dezembro')
  })

  it('should filter by type correctly', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'earning', 5)
    )

    expect(result.current).toHaveLength(1)
    expect(result.current[0].type).toBe('earning')
    expect(result.current[0].value).toBe(5000)
    expect(result.current[0].sourceName).toBe('Salário')
  })

  it('should return empty array when no transactions match', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2026, 1, 'expense', 5)
    )

    expect(result.current).toHaveLength(0)
  })

  it('should handle limit greater than available transactions', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'expense', 100)
    )

    expect(result.current).toHaveLength(6) // Only 6 expense transactions in January 2025
  })

  it('should enrich with source names for earnings', () => {
    const { result } = renderHook(() =>
      useTopTransactions(mockTransactions, mockCategories, mockSources, 2025, 1, 'earning', 5)
    )

    expect(result.current[0].sourceName).toBe('Salário')
  })
})
