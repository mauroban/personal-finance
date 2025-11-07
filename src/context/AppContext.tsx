import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Category, Source, Transaction, Budget } from '@/types'
import { db } from '@/db'
import { getCurrentYear, getCurrentMonth } from '@/utils/date'
import { VIEW_MODES, ViewMode } from '@/constants/viewModes'
import { logger } from '@/utils/logger'

interface AppContextType {
  // Data
  categories: Category[]
  sources: Source[]
  transactions: Transaction[]
  budgets: Budget[]

  // UI State
  isLoading: boolean
  selectedYear: number
  selectedMonth: number
  viewMode: ViewMode

  // Actions
  setSelectedYear: (year: number) => Promise<void>
  setSelectedMonth: (month: number) => void
  setViewMode: (mode: ViewMode) => void
  refreshCategories: () => Promise<void>
  refreshSources: () => Promise<void>
  refreshTransactions: () => Promise<void>
  refreshBudgets: () => Promise<void>
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>
  updateCategory: (id: number, category: Omit<Category, 'id'>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  addSource: (source: Omit<Source, 'id'>) => Promise<void>
  updateSource: (id: number, source: Omit<Source, 'id'>) => Promise<void>
  deleteSource: (id: number) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  updateTransaction: (id: number, transaction: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>
  updateBudget: (id: number, budget: Omit<Budget, 'id'>) => Promise<void>
  deleteBudget: (id: number) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const stored = localStorage.getItem('viewMode')
    return (stored as ViewMode) || VIEW_MODES.OVERVIEW
  })

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode)
    localStorage.setItem('viewMode', mode)
  }

  const handleSetSelectedYear = async (year: number) => {
    setSelectedYear(year)

    // Ensure recurring budgets are propagated to this year
    const { ensureRecurringBudgetsForYear } = await import('@/utils/propagateRecurrentBudgets')
    const extended = await ensureRecurringBudgetsForYear(year)

    if (extended > 0) {
      // Refresh budgets if any were extended
      await refreshBudgets()
    }
  }

  const refreshCategories = async () => {
    const data = await db.categories.toArray()
    setCategories(data)
  }

  const refreshSources = async () => {
    const data = await db.sources.toArray()
    setSources(data)
  }

  const refreshTransactions = async () => {
    const data = await db.transactions.toArray()
    setTransactions(data)
  }

  const refreshBudgets = async () => {
    const data = await db.budgets.toArray()
    setBudgets(data)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)

        // Initialize default data on first load
        const { initializeDefaultData } = await import('@/utils/initializeDefaults')
        await initializeDefaultData()

        // Then load all data
        await Promise.all([
          refreshCategories(),
          refreshSources(),
          refreshTransactions(),
          refreshBudgets(),
        ])

        logger.info('Application data loaded successfully')
      } catch (error) {
        logger.error('Failed to initialize application data', { error })
      } finally {
        setIsLoading(false)
      }
    }
    initialize()
  }, [])

  const addCategory = async (category: Omit<Category, 'id'>) => {
    await db.categories.add(category)
    await refreshCategories()
  }

  const updateCategory = async (id: number, category: Omit<Category, 'id'>) => {
    await db.categories.update(id, category)
    await refreshCategories()
  }

  const deleteCategory = async (id: number) => {
    await db.categories.delete(id)
    await refreshCategories()
  }

  const addSource = async (source: Omit<Source, 'id'>) => {
    await db.sources.add(source)
    await refreshSources()
  }

  const updateSource = async (id: number, source: Omit<Source, 'id'>) => {
    await db.sources.update(id, source)
    await refreshSources()
  }

  const deleteSource = async (id: number) => {
    await db.sources.delete(id)
    await refreshSources()
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await db.transactions.add(transaction)
    await refreshTransactions()
  }

  const updateTransaction = async (id: number, transaction: Omit<Transaction, 'id'>) => {
    await db.transactions.update(id, transaction)
    await refreshTransactions()
  }

  const deleteTransaction = async (id: number) => {
    await db.transactions.delete(id)
    await refreshTransactions()
  }

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    const budgetId = await db.budgets.add(budget)

    // If it's a recurring or installment budget, propagate to future months
    if (budget.mode === 'recurring' || budget.mode === 'installment') {
      const { propagateBudget } = await import('@/utils/propagateRecurrentBudgets')
      const fullBudget = await db.budgets.get(budgetId)
      if (fullBudget) {
        await propagateBudget(fullBudget)
      }
    }

    await refreshBudgets()
  }

  const updateBudget = async (id: number, budget: Omit<Budget, 'id'>) => {
    await db.budgets.update(id, budget)

    // If it's a recurring or installment budget, propagate to future months
    if (budget.mode === 'recurring' || budget.mode === 'installment') {
      const { propagateBudget } = await import('@/utils/propagateRecurrentBudgets')
      const fullBudget = await db.budgets.get(id)
      if (fullBudget) {
        // Use indexed query to find future instances
        const futureBudgets = await db.budgets
          .where(budget.type === 'expense' && budget.subgroupId
            ? '[type+groupId+subgroupId]'
            : budget.type === 'income' && budget.sourceId
            ? '[type+sourceId]'
            : 'type')
          .equals(
            budget.type === 'expense' && budget.subgroupId
              ? [budget.type, budget.groupId || 0, budget.subgroupId]
              : budget.type === 'income' && budget.sourceId
              ? [budget.type, budget.sourceId]
              : budget.type
          )
          .filter(b =>
            b.id !== id && // Don't delete the current budget
            (b.year > fullBudget.year || (b.year === fullBudget.year && b.month > fullBudget.month))
          )
          .toArray()

        // Use bulk delete for better performance
        const idsToDelete = futureBudgets.map(fb => fb.id!).filter(fbId => fbId !== undefined)
        if (idsToDelete.length > 0) {
          await db.budgets.bulkDelete(idsToDelete)
        }

        // Then propagate the updated budget
        await propagateBudget(fullBudget)
      }
    }

    await refreshBudgets()
  }

  const deleteBudget = async (id: number) => {
    const budget = await db.budgets.get(id)

    if (budget && (budget.mode === 'recurring' || budget.mode === 'installment')) {
      // Use indexed query to find future instances
      const futureBudgets = await db.budgets
        .where(budget.type === 'expense' && budget.subgroupId
          ? '[type+groupId+subgroupId]'
          : budget.type === 'income' && budget.sourceId
          ? '[type+sourceId]'
          : 'type')
        .equals(
          budget.type === 'expense' && budget.subgroupId
            ? [budget.type, budget.groupId || 0, budget.subgroupId]
            : budget.type === 'income' && budget.sourceId
            ? [budget.type, budget.sourceId]
            : budget.type
        )
        .filter(b =>
          b.id === id || // Include the current budget
          (b.year > budget.year || (b.year === budget.year && b.month >= budget.month))
        )
        .toArray()

      // Use bulk delete for better performance
      const idsToDelete = futureBudgets.map(fb => fb.id!).filter(fbId => fbId !== undefined)
      if (idsToDelete.length > 0) {
        await db.budgets.bulkDelete(idsToDelete)
      }

      logger.info('Deleted recurring/installment budget and future instances', {
        budgetId: id,
        futureInstancesCount: idsToDelete.length - 1,
      })
    } else {
      await db.budgets.delete(id)
    }

    await refreshBudgets()
  }

  return (
    <AppContext.Provider
      value={{
        // Data
        categories,
        sources,
        transactions,
        budgets,

        // UI State
        isLoading,
        selectedYear,
        selectedMonth,
        viewMode,

        // Actions
        setSelectedYear: handleSetSelectedYear,
        setSelectedMonth,
        setViewMode,
        refreshCategories,
        refreshSources,
        refreshTransactions,
        refreshBudgets,
        addCategory,
        updateCategory,
        deleteCategory,
        addSource,
        updateSource,
        deleteSource,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
