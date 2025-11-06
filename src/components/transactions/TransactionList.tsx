import React, { useMemo, useState, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCurrency } from '@/utils/format'
import { parseDate } from '@/utils/date'
import { Button } from '@/components/common/Button'
import { ConfirmModal } from '@/components/common/ConfirmModal'

type SortField = 'date' | 'type' | 'category' | 'amount' | 'paymentMethod'
type SortOrder = 'asc' | 'desc'

export const TransactionList: React.FC = () => {
  const { transactions, categories, sources, deleteTransaction } = useApp()

  // Filters state
  const [typeFilter, setTypeFilter] = useState<'all' | 'earning' | 'expense'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [searchNote, setSearchNote] = useState('')

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })

  const getCategoryName = useCallback((groupId?: number, subgroupId?: number) => {
    if (subgroupId) {
      const sub = categories.find(c => c.id === subgroupId)
      return sub?.name || ''
    }
    if (groupId) {
      const group = categories.find(c => c.id === groupId)
      return group?.name || ''
    }
    return ''
  }, [categories])

  const getSourceName = useCallback((sourceId?: number) => {
    const source = sources.find(s => s.id === sourceId)
    return source?.name || ''
  }, [sources])

  // Get unique payment methods
  const paymentMethods = useMemo(() => {
    const methods = new Set(transactions.map(t => t.paymentMethod).filter(Boolean))
    return Array.from(methods).sort()
  }, [transactions])

  // Get unique categories and sources
  const categoryOptions = useMemo(() => {
    const expenseCategories = categories.filter(c => !c.parentId).map(c => ({
      value: `category-${c.id}`,
      label: c.name || '',
      type: 'expense' as const
    }))
    const sourceOptions = sources.map(s => ({
      value: `source-${s.id}`,
      label: s.name || '',
      type: 'earning' as const
    }))
    return [...expenseCategories, ...sourceOptions]
  }, [categories, sources])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(t => parseDate(t.date) >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(t => parseDate(t.date) <= toDate)
    }

    // Category/Source filter
    if (categoryFilter !== 'all') {
      if (categoryFilter.startsWith('category-')) {
        const categoryId = parseInt(categoryFilter.replace('category-', ''))
        filtered = filtered.filter(t => t.type === 'expense' && t.groupId === categoryId)
      } else if (categoryFilter.startsWith('source-')) {
        const sourceId = parseInt(categoryFilter.replace('source-', ''))
        filtered = filtered.filter(t => t.type === 'earning' && t.sourceId === sourceId)
      }
    }

    // Payment method filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === paymentFilter)
    }

    // Search in notes
    if (searchNote.trim()) {
      const search = searchNote.toLowerCase()
      filtered = filtered.filter(t => t.note?.toLowerCase().includes(search))
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date':
          comparison = parseDate(a.date).getTime() - parseDate(b.date).getTime()
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'category':
          const aName = a.type === 'earning'
            ? getSourceName(a.sourceId)
            : getCategoryName(a.groupId, a.subgroupId)
          const bName = b.type === 'earning'
            ? getSourceName(b.sourceId)
            : getCategoryName(b.groupId, b.subgroupId)
          comparison = aName.localeCompare(bName)
          break
        case 'amount':
          comparison = a.value - b.value
          break
        case 'paymentMethod':
          comparison = (a.paymentMethod || '').localeCompare(b.paymentMethod || '')
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [transactions, typeFilter, dateFrom, dateTo, categoryFilter, paymentFilter, searchNote, sortField, sortOrder, getCategoryName, getSourceName])

  // Paginate
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedTransactions.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedTransactions, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / pageSize)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, dateFrom, dateTo, categoryFilter, paymentFilter, searchNote])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteTransaction(deleteConfirm.id)
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setCategoryFilter('all')
    setPaymentFilter('all')
    setSearchNote('')
    setCurrentPage(1)
  }

  const hasActiveFilters = typeFilter !== 'all' || dateFrom || dateTo || categoryFilter !== 'all' || paymentFilter !== 'all' || searchNote

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400 ml-1">⇅</span>
    }
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos</option>
              <option value="earning">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data até
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category/Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria/Fonte
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.type === 'earning' ? 'Receita' : 'Despesa'})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forma de Pagamento
            </label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Search Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar em Notas
            </label>
            <input
              type="text"
              value={searchNote}
              onChange={e => setSearchNote(e.target.value)}
              placeholder="Digite para buscar..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {paginatedTransactions.length} de {filteredAndSortedTransactions.length} transações
            {filteredAndSortedTransactions.length !== transactions.length && (
              <span className="ml-1">
                (filtradas de {transactions.length} total)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Data
                    <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Tipo
                    <SortIcon field="type" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Categoria/Fonte
                    <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('paymentMethod')}
                >
                  <div className="flex items-center">
                    Pagamento
                    <SortIcon field="paymentMethod" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Valor
                    <SortIcon field="amount" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nota
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {parseDate(transaction.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'earning'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {transaction.type === 'earning' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {transaction.type === 'earning'
                      ? getSourceName(transaction.sourceId)
                      : getCategoryName(transaction.groupId, transaction.subgroupId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {transaction.paymentMethod || '-'}
                    {transaction.installments && transaction.installments > 1 && (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-500">
                        ({transaction.installmentNumber}/{transaction.installments})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                    <span className={transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {formatCurrency(transaction.value)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
                      aria-label={`Excluir transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedTransactions.map(transaction => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'earning'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {transaction.type === 'earning' ? 'Receita' : 'Despesa'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {parseDate(transaction.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.type === 'earning'
                      ? getSourceName(transaction.sourceId)
                      : getCategoryName(transaction.groupId, transaction.subgroupId)}
                  </div>
                </div>
                <div className={`text-lg font-semibold ${transaction.type === 'earning' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(transaction.value)}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {transaction.paymentMethod && (
                  <div>
                    <span className="font-medium">Pagamento:</span> {transaction.paymentMethod}
                    {transaction.installments && transaction.installments > 1 && (
                      <span className="ml-1 text-xs">
                        ({transaction.installmentNumber}/{transaction.installments})
                      </span>
                    )}
                  </div>
                )}
                {transaction.note && (
                  <div>
                    <span className="font-medium">Nota:</span> {transaction.note}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(transaction.id!)}
                  aria-label={`Excluir transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? 'Nenhuma transação encontrada com os filtros aplicados.'
                : 'Nenhuma transação registrada. Adicione sua primeira transação!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedTransactions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Itens por página:
              </label>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                «
              </button>
              <span className="px-4 py-1 text-sm text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
