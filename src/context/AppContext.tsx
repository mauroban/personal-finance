import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Category, Source, Transaction, Budget } from '@/types'
import { db } from '@/db'
import { getCurrentYear, getCurrentMonth } from '@/utils/date'

interface AppContextType {
  categories: Category[]
  sources: Source[]
  transactions: Transaction[]
  budgets: Budget[]
  selectedYear: number
  selectedMonth: number
  setSelectedYear: (year: number) => void
  setSelectedMonth: (month: number) => void
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
  const [categories, setCategories] = useState<Category[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

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
      // Initialize default data on first load
      const { initializeDefaultData } = await import('@/utils/initializeDefaults')
      await initializeDefaultData()

      // Then load all data
      await refreshCategories()
      await refreshSources()
      await refreshTransactions()
      await refreshBudgets()
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
    await db.budgets.add(budget)
    await refreshBudgets()
  }

  const updateBudget = async (id: number, budget: Omit<Budget, 'id'>) => {
    await db.budgets.update(id, budget)
    await refreshBudgets()
  }

  const deleteBudget = async (id: number) => {
    await db.budgets.delete(id)
    await refreshBudgets()
  }

  return (
    <AppContext.Provider
      value={{
        categories,
        sources,
        transactions,
        budgets,
        selectedYear,
        selectedMonth,
        setSelectedYear,
        setSelectedMonth,
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
