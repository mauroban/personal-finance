import React, { useMemo, useState, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { formatCurrency } from '@/utils/format'
import { parseDate } from '@/utils/date'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { TransactionForm } from '@/components/transactions/TransactionForm'

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

  // Edit state
  const [editingTransaction, setEditingTransaction] = useState<typeof transactions[0] | undefined>(undefined)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  const handleEdit = (transaction: typeof transactions[0]) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(undefined)
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {hasActiveFilters ? 'Filtros ativos aplicados' : 'Nenhum filtro aplicado'}
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 w-full sm:w-auto"
            >
              Limpar Tudo
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              <option value="all">Todos os tipos</option>
              <option value="earning">💵 Receitas</option>
              <option value="expense">💳 Despesas</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Data Inicial
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              onFocus={e => !dateFrom && (e.target.style.color = '')}
              onBlur={e => !dateFrom && (e.target.style.color = 'transparent')}
              className={`w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 ${dateFrom ? 'bg-white dark:bg-gray-800' : 'bg-transparent'} text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium`}
              style={!dateFrom ? { color: 'transparent' } : undefined}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Data Final
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              onFocus={e => !dateTo && (e.target.style.color = '')}
              onBlur={e => !dateTo && (e.target.style.color = 'transparent')}
              className={`w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 ${dateTo ? 'bg-white dark:bg-gray-800' : 'bg-transparent'} text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium`}
              style={!dateTo ? { color: 'transparent' } : undefined}
            />
          </div>

          {/* Category/Source Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Categoria/Fonte
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              <option value="all">Todas as categorias</option>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.type === 'earning' ? 'Receita' : 'Despesa'})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Pagamento
            </label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
            >
              <option value="all">Todos os métodos</option>
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Search Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Buscar Notas
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchNote}
                onChange={e => setSearchNote(e.target.value)}
                placeholder="Digite para buscar..."
                className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium"
              />
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-5 pt-5 border-t border-blue-200 dark:border-blue-800/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {paginatedTransactions.length}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">visíveis</span>
              </div>
              <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {filteredAndSortedTransactions.length}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">filtradas</span>
              </div>
              {filteredAndSortedTransactions.length !== transactions.length && (
                <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {transactions.length}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">total</span>
                </div>
              )}
            </div>
          </div>
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        aria-label={`Editar transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id!)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label={`Excluir transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                        title="Excluir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(transaction)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  aria-label={`Editar transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(transaction.id!)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label={`Excluir transação de ${formatCurrency(transaction.value)} do dia ${parseDate(transaction.date).toLocaleDateString('pt-BR')}`}
                  title="Excluir"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />
    </div>
  )
}
