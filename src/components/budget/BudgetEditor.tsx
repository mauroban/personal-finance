import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { dateToMonthNumber, monthNumberToDate } from '@/utils/date'
import { DEFAULT_INSTALLMENT_COUNT } from '@/constants/budgetModes'
import { CURRENCY_CONFIG, CENTS_PER_REAL } from '@/constants/formatting'
import { db } from '@/db'
import { logger } from '@/utils/logger'

interface BudgetEditorProps {
  year: number
  month: number
}

export const BudgetEditor: React.FC<BudgetEditorProps> = ({ year, month }) => {
  const { categories, sources, budgets, addBudget, updateBudget, refreshBudgets } = useApp()
  const [budgetValues, setBudgetValues] = useState<Record<string, number>>({})
  const [rawCentValues, setRawCentValues] = useState<Record<string, string>>({})
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [budgetModes, setBudgetModes] = useState<Record<string, 'unique' | 'recurring' | 'installment'>>({})
  const [installmentCounts, setInstallmentCounts] = useState<Record<string, number>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const parentCategories = categories.filter(c => !c.parentId)

  useEffect(() => {
    const values: Record<string, number> = {}
    const modes: Record<string, 'unique' | 'recurring' | 'installment'> = {}
    const counts: Record<string, number> = {}

    // Load expense budgets for parent categories
    parentCategories.forEach(cat => {
      const budget = budgets.find(
        b => b.year === year && b.month === month && b.groupId === cat.id && !b.subgroupId && b.type === 'expense'
      )
      if (budget) {
        values[`expense-${cat.id}`] = budget.amount
        // Handle legacy isRecurrent field
        if (budget.mode) {
          modes[`expense-${cat.id}`] = budget.mode
        } else if (budget.isRecurrent) {
          modes[`expense-${cat.id}`] = 'recurring'
        } else {
          modes[`expense-${cat.id}`] = 'unique'
        }
        if (budget.installments) {
          counts[`expense-${cat.id}`] = budget.installments
        }
      }

      // Load subcategory budgets
      const subcats = categories.filter(c => c.parentId === cat.id)
      subcats.forEach(sub => {
        const subBudget = budgets.find(
          b => b.year === year && b.month === month && b.groupId === cat.id && b.subgroupId === sub.id && b.type === 'expense'
        )
        if (subBudget) {
          values[`expense-${cat.id}-${sub.id}`] = subBudget.amount
          if (subBudget.mode) {
            modes[`expense-${cat.id}-${sub.id}`] = subBudget.mode
          } else if (subBudget.isRecurrent) {
            modes[`expense-${cat.id}-${sub.id}`] = 'recurring'
          } else {
            modes[`expense-${cat.id}-${sub.id}`] = 'unique'
          }
          if (subBudget.installments) {
            counts[`expense-${cat.id}-${sub.id}`] = subBudget.installments
          }
        }
      })
    })

    // Load income budgets
    sources.forEach(source => {
      const budget = budgets.find(
        b => b.year === year && b.month === month && b.sourceId === source.id && b.type === 'income'
      )
      if (budget) {
        values[`income-${source.id}`] = budget.amount
        if (budget.mode) {
          modes[`income-${source.id}`] = budget.mode
        } else if (budget.isRecurrent) {
          modes[`income-${source.id}`] = 'recurring'
        } else {
          modes[`income-${source.id}`] = 'unique'
        }
        if (budget.installments) {
          counts[`income-${source.id}`] = budget.installments
        }
      }
    })

    setBudgetValues(values)
    setBudgetModes(modes)
    setInstallmentCounts(counts)
  }, [budgets, year, month, parentCategories, sources, categories])

  const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString(CURRENCY_CONFIG.locale, {
      style: 'currency',
      currency: CURRENCY_CONFIG.currency,
      minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
      maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits
    })
  }

  const formatCurrency = (cents: number): string => {
    const reais = Math.floor(cents / CENTS_PER_REAL)
    const centavos = cents % CENTS_PER_REAL
    return `R$ ${reais},${centavos.toString().padStart(2, '0')}`
  }

  const getDisplayValue = (key: string): string => {
    if (focusedField === key && rawCentValues[key] !== undefined) {
      // Show raw input while focused
      const cents = parseInt(rawCentValues[key]) || 0
      return formatCurrency(cents)
    }

    // Show saved value when not focused
    const value = budgetValues[key] || 0

    // Return empty string if no value (so placeholder shows)
    if (value === 0) {
      return ''
    }

    const mode = budgetModes[key] || 'unique'
    const installmentCount = installmentCounts[key] || 1

    const displayAmount = mode === 'installment' && installmentCount > 1
      ? value / installmentCount
      : value

    const cents = Math.round(displayAmount * 100)
    return formatCurrency(cents)
  }

  const handleKeyPress = (key: string, keyValue: string) => {
    // Cash register style input - digits add to cents
    const currentRaw = rawCentValues[key] || '0'

    if (keyValue >= '0' && keyValue <= '9') {
      // Add digit to the right
      const newRaw = (currentRaw + keyValue).replace(/^0+/, '') || '0'
      setRawCentValues(prev => ({ ...prev, [key]: newRaw }))
    } else if (keyValue === 'Backspace') {
      // Remove last digit
      const newRaw = currentRaw.slice(0, -1) || '0'
      setRawCentValues(prev => ({ ...prev, [key]: newRaw }))
    }
  }

  const handleFocus = (key: string) => {
    setFocusedField(key)
    // Initialize with current value in cents
    const value = budgetValues[key] || 0
    const mode = budgetModes[key] || 'unique'
    const installmentCount = installmentCounts[key] || 1

    const displayAmount = mode === 'installment' && installmentCount > 1
      ? value / installmentCount
      : value

    const cents = Math.round(displayAmount * 100)
    setRawCentValues(prev => ({ ...prev, [key]: String(cents) }))
  }

  const handleBlur = async (
    key: string,
    type: 'expense' | 'income',
    groupId?: number,
    subgroupId?: number,
    sourceId?: number
  ) => {
    setFocusedField(null)

    // Convert cents to reais
    const cents = parseInt(rawCentValues[key]) || 0
    const value = cents / 100

    // Calculate actual value for installments
    const mode = budgetModes[key] || 'unique'
    const installmentCount = installmentCounts[key] || DEFAULT_INSTALLMENT_COUNT
    const actualValue = mode === 'installment' ? value * installmentCount : value

    // Save to database on blur
    const existingBudget = budgets.find(b => {
      if (type === 'expense') {
        return b.year === year && b.month === month &&
               b.groupId === groupId &&
               b.subgroupId === subgroupId &&
               b.type === 'expense'
      } else {
        return b.year === year && b.month === month && b.sourceId === sourceId && b.type === 'income'
      }
    })

    const budgetData = {
      year,
      month,
      type,
      amount: actualValue,
      mode,
      installments: mode === 'installment' ? installmentCount : undefined,
      ...(type === 'expense' ? { groupId, subgroupId } : { sourceId })
    }

    if (existingBudget) {
      await updateBudget(existingBudget.id!, budgetData)
    } else if (actualValue > 0) {
      await addBudget(budgetData)
    }
  }

  const handleModeChange = async (key: string, newMode: 'unique' | 'recurring' | 'installment', type: 'expense' | 'income', groupId?: number, subgroupId?: number, sourceId?: number) => {
    setBudgetModes(prev => ({ ...prev, [key]: newMode }))

    const existingBudget = budgets.find(b => {
      if (type === 'expense') {
        return b.year === year && b.month === month &&
               b.groupId === groupId &&
               b.subgroupId === subgroupId &&
               b.type === 'expense'
      } else {
        return b.year === year && b.month === month && b.sourceId === sourceId && b.type === 'income'
      }
    })

    if (existingBudget) {
      await updateBudget(existingBudget.id!, {
        year,
        month,
        type,
        amount: existingBudget.amount,
        mode: newMode,
        installments: newMode === 'installment' ? (installmentCounts[key] || 1) : undefined,
        ...(type === 'expense' ? { groupId, subgroupId } : { sourceId })
      })
    }
  }

  const handleInstallmentCountChange = async (key: string, count: number, type: 'expense' | 'income', groupId?: number, subgroupId?: number, sourceId?: number) => {
    setInstallmentCounts(prev => ({ ...prev, [key]: count }))

    const existingBudget = budgets.find(b => {
      if (type === 'expense') {
        return b.year === year && b.month === month &&
               b.groupId === groupId &&
               b.subgroupId === subgroupId &&
               b.type === 'expense'
      } else {
        return b.year === year && b.month === month && b.sourceId === sourceId && b.type === 'income'
      }
    })

    if (existingBudget) {
      await updateBudget(existingBudget.id!, {
        year,
        month,
        type,
        amount: existingBudget.amount,
        mode: budgetModes[key],
        installments: count,
        ...(type === 'expense' ? { groupId, subgroupId } : { sourceId })
      })
    }
  }

  const handleDelete = async (key: string, type: 'expense' | 'income', groupId?: number, subgroupId?: number, sourceId?: number) => {
    const existingBudget = budgets.find(b => {
      if (type === 'expense') {
        return b.year === year && b.month === month &&
               b.groupId === groupId &&
               b.subgroupId === subgroupId &&
               b.type === 'expense'
      } else {
        return b.year === year && b.month === month && b.sourceId === sourceId && b.type === 'income'
      }
    })

    if (!existingBudget || !existingBudget.id) {
      return
    }

    const mode = existingBudget.mode || (existingBudget.isRecurrent ? 'recurring' : 'unique')
    const currentDate = dateToMonthNumber(year, month)

    // If recurring or installment, we need to handle past and future instances differently
    if (mode === 'recurring' || mode === 'installment') {
      // Find all matching budgets (past and future)
      const allBudgets = await db.budgets.toArray()
      const matchingBudgets = allBudgets.filter(b => {
        if (type === 'expense') {
          return b.type === 'expense' &&
                 b.groupId === groupId &&
                 b.subgroupId === subgroupId
        } else {
          return b.type === 'income' && b.sourceId === sourceId
        }
      })

      // Find the start date (earliest occurrence)
      const startDate = matchingBudgets.length > 0
        ? Math.min(...matchingBudgets.map(b => dateToMonthNumber(b.year, b.month)))
        : currentDate

      // Determine the end date for installments
      let endDate = currentDate
      if (mode === 'installment' && existingBudget.installments) {
        endDate = startDate + existingBudget.installments
      }

      // Separate past and current/future budgets
      const pastBudgets = matchingBudgets.filter(b => {
        const budgetDate = dateToMonthNumber(b.year, b.month)
        return budgetDate < currentDate && (mode === 'recurring' || budgetDate < endDate)
      })

      const currentAndFutureBudgets = matchingBudgets.filter(b => {
        const budgetDate = dateToMonthNumber(b.year, b.month)
        return budgetDate >= currentDate && (mode === 'recurring' || budgetDate < endDate)
      })

      // Create a set of existing past months
      const existingPastMonths = new Set(
        pastBudgets.map(b => dateToMonthNumber(b.year, b.month))
      )

      // Fill in missing past months by creating them as unique budgets
      const missingMonthsToCreate: number[] = []
      for (let monthNum = startDate; monthNum < currentDate; monthNum++) {
        if (!existingPastMonths.has(monthNum) && (mode === 'recurring' || monthNum < endDate)) {
          missingMonthsToCreate.push(monthNum)
        }
      }

      // Create missing past budgets as unique
      for (const monthNum of missingMonthsToCreate) {
        const { year: actualYear, month: actualMonth } = monthNumberToDate(monthNum)

        const newBudget = {
          year: actualYear,
          month: actualMonth,
          type,
          amount: existingBudget.amount,
          mode: 'unique' as const,
          ...(type === 'expense' ? { groupId, subgroupId } : { sourceId })
        }

        await db.budgets.add(newBudget)
      }

      // Convert existing past budgets to "unique" mode
      for (const budget of pastBudgets) {
        if (budget.id) {
          await db.budgets.update(budget.id, {
            ...budget,
            mode: 'unique',
            installments: undefined,
            installmentNumber: undefined,
            isRecurrent: false
          })
        }
      }

      // Delete current and future budgets
      const idsToDelete = currentAndFutureBudgets.map(b => b.id!).filter(id => id !== undefined)
      await db.budgets.bulkDelete(idsToDelete)

      logger.debug('Budget mode change completed', {
        createdPastMonths: missingMonthsToCreate.length,
        convertedPastBudgets: pastBudgets.length,
        deletedFutureBudgets: idsToDelete.length,
      })
    } else {
      // For unique budgets, just delete the single entry
      await db.budgets.delete(existingBudget.id)
    }

    // Refresh budgets state from context
    await refreshBudgets()

    // Clear local state
    setBudgetValues(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setBudgetModes(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setInstallmentCounts(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const getSubcategories = (parentId: number) => {
    return categories.filter(c => c.parentId === parentId)
  }

  const getTotalForCategory = (categoryId: number): number => {
    const mainValue = budgetValues[`expense-${categoryId}`] || 0
    const subcats = getSubcategories(categoryId)
    const subTotal = subcats.reduce((sum, sub) => {
      return sum + (budgetValues[`expense-${categoryId}-${sub.id}`] || 0)
    }, 0)
    return mainValue + subTotal
  }

  const totalExpenseBudget = parentCategories.reduce((sum, cat) => {
    return sum + getTotalForCategory(cat.id!)
  }, 0)

  const totalIncomeBudget = sources.reduce((sum, source) => {
    return sum + (budgetValues[`income-${source.id}`] || 0)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receitas Previstas</h3>
        <div className="space-y-2">
          {sources.map(source => {
            const key = `income-${source.id}`
            const mode = budgetModes[key] || 'unique'
            const installmentCount = installmentCounts[key] || DEFAULT_INSTALLMENT_COUNT

            return (
              <div key={source.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                <span className="text-gray-700 dark:text-gray-300 font-medium md:min-w-[120px]">{source.name}</span>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={mode}
                    onChange={e => handleModeChange(key, e.target.value as any, 'income', undefined, undefined, source.id)}
                    className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unique">Único</option>
                    <option value="recurring">Recorrente</option>
                    <option value="installment">Parcelado</option>
                  </select>

                  {mode === 'installment' && (
                    <>
                      <input
                        type="number"
                        min="2"
                        value={installmentCount}
                        onChange={e => handleInstallmentCountChange(
                          key,
                          parseInt(e.target.value) || 2,
                          'income',
                          undefined,
                          undefined,
                          source.id
                        )}
                        className="w-16 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">x</span>
                    </>
                  )}

                  {budgetValues[key] && budgetValues[key] > 0 && (
                    <button
                      onClick={() => handleDelete(key, 'income', undefined, undefined, source.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                      title="Remover orçamento"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={getDisplayValue(key)}
                  onFocus={() => handleFocus(key)}
                  onKeyDown={e => {
                    if (e.key >= '0' && e.key <= '9') {
                      e.preventDefault()
                      handleKeyPress(key, e.key)
                    } else if (e.key === 'Backspace') {
                      e.preventDefault()
                      handleKeyPress(key, 'Backspace')
                    }
                  }}
                  onBlur={() => handleBlur(key, 'income', undefined, undefined, source.id)}
                  className="flex-1 md:flex-auto w-full md:w-auto text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="R$ 0,00"
                  readOnly
                />
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">Total Previsto:</span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrencyValue(totalIncomeBudget)}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Despesas Planejadas</h3>
        <div className="space-y-3">
          {parentCategories.map(cat => {
            const subcats = getSubcategories(cat.id!)
            const isExpanded = expandedCategories.has(cat.id!)
            const categoryTotal = getTotalForCategory(cat.id!)

            return (
              <div key={cat.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {subcats.length > 0 && (
                        <button
                          onClick={() => toggleCategory(cat.id!)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                      <span className="text-gray-900 dark:text-white font-semibold flex-1 md:min-w-[120px]">{cat.name}</span>
                    </div>

                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium md:min-w-[100px] md:text-right">
                      Total: {formatCurrencyValue(categoryTotal)}
                    </span>
                  </div>
                </div>

                {isExpanded && subcats.length > 0 && (
                  <div className="p-3 pl-10 space-y-2 bg-white dark:bg-gray-800">
                    {subcats.map(sub => {
                      const subKey = `expense-${cat.id}-${sub.id}`
                      const subMode = budgetModes[subKey] || 'unique'
                      const subInstallmentCount = installmentCounts[subKey] || DEFAULT_INSTALLMENT_COUNT

                      return (
                        <div key={sub.id} className="flex flex-col md:flex-row md:items-center gap-2 group/sub">
                          <span className="text-gray-600 dark:text-gray-400 text-sm md:min-w-[100px]">• {sub.name}</span>

                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={subMode}
                              onChange={e => handleModeChange(subKey, e.target.value as any, 'expense', cat.id, sub.id)}
                              className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="unique">Único</option>
                              <option value="recurring">Recorrente</option>
                              <option value="installment">Parcelado</option>
                            </select>

                            {subMode === 'installment' && (
                              <>
                                <input
                                  type="number"
                                  min="2"
                                  value={subInstallmentCount}
                                  onChange={e => handleInstallmentCountChange(
                                    subKey,
                                    parseInt(e.target.value) || 2,
                                    'expense',
                                    cat.id,
                                    sub.id
                                  )}
                                  className="w-14 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-500">x</span>
                              </>
                            )}

                            {budgetValues[subKey] && budgetValues[subKey] > 0 && (
                              <button
                                onClick={() => handleDelete(subKey, 'expense', cat.id, sub.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors ml-1"
                                title="Remover orçamento"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={getDisplayValue(subKey)}
                            onFocus={() => handleFocus(subKey)}
                            onKeyDown={e => {
                              if (e.key >= '0' && e.key <= '9') {
                                e.preventDefault()
                                handleKeyPress(subKey, e.key)
                              } else if (e.key === 'Backspace') {
                                e.preventDefault()
                                handleKeyPress(subKey, 'Backspace')
                              }
                            }}
                            onBlur={() => handleBlur(subKey, 'expense', cat.id, sub.id)}
                            className="flex-1 md:flex-auto w-full md:w-auto text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="R$ 0,00"
                            readOnly
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">Total Planejado:</span>
          <span className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrencyValue(totalExpenseBudget)}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm p-8 border border-blue-100 dark:border-blue-800">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Saldo Previsto:</span>
          <span className={`text-2xl font-bold ${totalIncomeBudget - totalExpenseBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrencyValue(totalIncomeBudget - totalExpenseBudget)}
          </span>
        </div>
      </div>
    </div>
  )
}
