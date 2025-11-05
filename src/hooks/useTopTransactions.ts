import { useMemo } from 'react'
import { Transaction, Category, Source } from '@/types'
import { isDateInMonth } from '@/utils/date'

export interface EnrichedTransaction extends Transaction {
  categoryName?: string
  subcategoryName?: string
  sourceName?: string
}

export const useTopTransactions = (
  transactions: Transaction[],
  categories: Category[],
  sources: Source[],
  year: number,
  month: number,
  type: 'expense' | 'earning',
  limit: number = 5
): EnrichedTransaction[] => {
  return useMemo(() => {
    // Filter transactions by month and type
    const monthTransactions = transactions.filter(
      t => isDateInMonth(t.date, year, month) && t.type === type
    )

    // Sort by value descending (largest first)
    const sortedTransactions = [...monthTransactions].sort((a, b) => b.value - a.value)

    // Take top N
    const topTransactions = sortedTransactions.slice(0, limit)

    // Enrich with category and source names
    return topTransactions.map(t => {
      const category = categories.find(c => c.id === t.groupId)
      const subcategory = categories.find(c => c.id === t.subgroupId)
      const source = sources.find(s => s.id === t.sourceId)

      return {
        ...t,
        categoryName: category?.name,
        subcategoryName: subcategory?.name,
        sourceName: source?.name,
      }
    })
  }, [transactions, categories, sources, year, month, type, limit])
}
