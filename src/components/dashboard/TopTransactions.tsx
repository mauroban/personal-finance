import React from 'react'
import { EnrichedTransaction } from '@/hooks/useTopTransactions'
import { formatCurrency } from '@/utils/format'

interface TopTransactionsProps {
  transactions: EnrichedTransaction[]
  title?: string
  emptyMessage?: string
}

export const TopTransactions: React.FC<TopTransactionsProps> = ({
  transactions,
  title = 'Top Transações',
  emptyMessage = 'Nenhuma transação encontrada',
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T12:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  const getCategoryDisplay = (transaction: EnrichedTransaction): string => {
    if (transaction.subcategoryName) {
      return `${transaction.categoryName} › ${transaction.subcategoryName}`
    }
    return transaction.categoryName || transaction.sourceName || 'Sem categoria'
  }

  if (transactions.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {title}
      </h3>

      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id || index}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {/* Left side: Rank and details */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Rank badge */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>

              {/* Transaction details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {transaction.note || 'Sem descrição'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate">{getCategoryDisplay(transaction)}</span>
                  <span>•</span>
                  <span className="flex-shrink-0">{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            {/* Right side: Value */}
            <div className="flex-shrink-0 ml-3">
              <p className={`text-sm font-semibold ${
                transaction.type === 'earning'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {formatCurrency(transaction.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total ({transactions.length} transações)
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(
                transactions.reduce((sum, t) => sum + t.value, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
