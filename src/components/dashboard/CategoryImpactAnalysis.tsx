import React from 'react'
import { CategoryImpact } from '@/hooks/useCategoryImpact'
import { formatCurrency } from '@/utils/format'

interface CategoryImpactAnalysisProps {
  categoryImpacts: CategoryImpact[]
  topSpenders: CategoryImpact[]
  trendingUp: CategoryImpact[]
  trendingDown: CategoryImpact[]
  totalSpent: number
}

export const CategoryImpactAnalysis: React.FC<CategoryImpactAnalysisProps> = ({
  categoryImpacts,
  topSpenders,
  trendingUp,
  trendingDown,
  totalSpent: _totalSpent,
}) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<number>>(new Set())

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  if (categoryImpacts.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Nenhuma despesa registrada este mês
        </p>
      </div>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-red-600 dark:text-red-400'
      case 'down': return 'text-green-600 dark:text-green-400'
      case 'stable': return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Para Onde Está Indo Seu Dinheiro
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Análise detalhada de gastos por categoria (mês atual vs. média de 3 meses)
        </p>
      </div>

      {/* Trend Insights */}
      {(trendingUp.length > 0 || trendingDown.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Up */}
          {trendingUp.length > 0 && (
            <div className="card p-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📈</span>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Gastando Mais que o Normal
                </h4>
              </div>
              <div className="space-y-3">
                {trendingUp.map(category => {
                  const increase = category.spent - category.avg3Months
                  const increasePercent = category.avg3Months > 0
                    ? ((increase / category.avg3Months) * 100)
                    : 0
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.name}
                          </span>
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                            +{increasePercent.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Média 3 meses: {formatCurrency(category.avg3Months)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(category.spent)}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          +{formatCurrency(increase)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trending Down */}
          {trendingDown.length > 0 && (
            <div className="card p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📉</span>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  Gastando Menos que o Normal
                </h4>
              </div>
              <div className="space-y-3">
                {trendingDown.map(category => {
                  const decrease = category.avg3Months - category.spent
                  const decreasePercent = category.avg3Months > 0
                    ? ((decrease / category.avg3Months) * 100)
                    : 0
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.name}
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                            -{decreasePercent.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Média 3 meses: {formatCurrency(category.avg3Months)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(category.spent)}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          -{formatCurrency(decrease)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Category Breakdown */}
      <div className="card p-6">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Todas as Categorias - Detalhamento Completo
        </h4>
        <div className="space-y-3">
          {topSpenders.map(category => {
            const isExpanded = expandedCategories.has(category.id)
            const hasSubcategories = category.subcategories.length > 0

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div
                  className={`p-4 ${hasSubcategories ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} transition-colors`}
                  onClick={() => hasSubcategories && toggleCategory(category.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {hasSubcategories && (
                          <span className="text-gray-400 dark:text-gray-600 text-sm">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        )}
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h5>
                        <span className={`text-sm ${getTrendColor(category.trend)}`}>
                          {getTrendIcon(category.trend)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {category.impact.toFixed(1)}% do total
                        </span>
                      </div>

                      {/* Spending comparison */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>
                            <strong className="text-gray-900 dark:text-white">{formatCurrency(category.spent)}</strong> este mês
                          </span>
                          <span>
                            Média 3 meses: <strong className="text-gray-900 dark:text-white">{formatCurrency(category.avg3Months)}</strong>
                          </span>
                        </div>
                        {category.budgeted > 0 && (
                          <>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  category.percentage > 105
                                    ? 'bg-red-500'
                                    : category.percentage >= 85
                                    ? 'bg-lime-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(category.percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Orçamento: {formatCurrency(category.budgeted)} ({category.percentage.toFixed(0)}% usado)
                            </div>
                          </>
                        )}
                      </div>

                      {/* Top subcategory hint */}
                      {category.topSubcategory && !isExpanded && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          Principal: {category.topSubcategory.name} ({formatCurrency(category.topSubcategory.spent)})
                        </div>
                      )}
                    </div>

                    {/* Amount with trend */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(category.spent)}
                      </div>
                      {category.avg3Months > 0 && (
                        <div className={`text-sm font-medium ${
                          category.trend === 'up'
                            ? 'text-orange-600 dark:text-orange-400'
                            : category.trend === 'down'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {category.trend === 'up' && `+${formatCurrency(category.spent - category.avg3Months)}`}
                          {category.trend === 'down' && `-${formatCurrency(category.avg3Months - category.spent)}`}
                          {category.trend === 'stable' && 'estável'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && hasSubcategories && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="p-4 space-y-2">
                      {category.subcategories.map(subcat => (
                        <div
                          key={subcat.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {subcat.name}
                              </span>
                              <span className={`text-xs ${getTrendColor(subcat.trend)}`}>
                                {getTrendIcon(subcat.trend)}
                              </span>
                              {subcat.isOverBudget && (
                                <span className="text-xs text-red-600 dark:text-red-400">⚠</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
                              <span>{subcat.impact.toFixed(1)}% do total</span>
                              <span>•</span>
                              <span>Média 3m: {formatCurrency(subcat.avg3Months)}</span>
                              {subcat.budgeted > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{subcat.percentage.toFixed(0)}% do orçamento</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(subcat.spent)}
                            </div>
                            {subcat.avg3Months > 0 && subcat.trend !== 'stable' && (
                              <div className={`text-xs ${
                                subcat.trend === 'up'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                {subcat.trend === 'up' ? '+' : '-'}{formatCurrency(Math.abs(subcat.spent - subcat.avg3Months))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
