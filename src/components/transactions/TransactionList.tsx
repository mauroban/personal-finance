import React, { useMemo } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCurrency } from '@/utils/format'
import { parseDate } from '@/utils/date'
import { Button } from '@/components/common/Button'

export const TransactionList: React.FC = () => {
  const { transactions, categories, sources, deleteTransaction } = useApp()

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      return parseDate(b.date).getTime() - parseDate(a.date).getTime()
    })
  }, [transactions])

  const getCategoryName = (groupId?: number, subgroupId?: number) => {
    if (subgroupId) {
      const sub = categories.find(c => c.id === subgroupId)
      return sub?.name || ''
    }
    if (groupId) {
      const group = categories.find(c => c.id === groupId)
      return group?.name || ''
    }
    return ''
  }

  const getSourceName = (sourceId?: number) => {
    const source = sources.find(s => s.id === sourceId)
    return source?.name || ''
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria/Fonte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagamento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map(transaction => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'earning'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.type === 'earning' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.type === 'earning'
                    ? getSourceName(transaction.sourceId)
                    : getCategoryName(transaction.groupId, transaction.subgroupId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.paymentMethod || '-'}
                  {transaction.installments && transaction.installments > 1 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({transaction.installmentNumber}/{transaction.installments})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <span className={transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.value)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {transaction.note ? (
                    <span className="truncate max-w-xs inline-block" title={transaction.note}>
                      {transaction.note}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(transaction.id!)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Nenhuma transação registrada. Adicione sua primeira transação!
          </p>
        </div>
      )}
    </div>
  )
}
