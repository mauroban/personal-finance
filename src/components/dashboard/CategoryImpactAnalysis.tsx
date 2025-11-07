import React from 'react'
import { CategoryImpact } from '@/hooks/useCategoryImpact'
import { formatCurrency } from '@/utils/format'
import { getMonthName } from '@/utils/date'

interface CategoryImpactAnalysisProps {
  categoryImpacts: CategoryImpact[]
  topSpenders: CategoryImpact[]
  trendingUp: CategoryImpact[]
  trendingDown: CategoryImpact[]
  totalSpent: number
  selectedPeriod: 'current' | 'last1' | 'last3' | 'last6'
  onPeriodChange: (period: 'current' | 'last1' | 'last3' | 'last6') => void
  periodYear: number
  periodMonth: number
  currentYear: number
  currentMonth: number
}

export const CategoryImpactAnalysis: React.FC<CategoryImpactAnalysisProps> = ({
  categoryImpacts: _categoryImpacts,
  topSpenders,
  trendingUp,
  trendingDown,
  totalSpent: _totalSpent,
  selectedPeriod,
  onPeriodChange,
  periodYear,
  periodMonth,
  currentYear,
  currentMonth,
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
      <div className="card p-4 sm:p-6">
        {/* Period Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Análise de Categorias
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedPeriod === 'current' && `${getMonthName(currentMonth)} ${currentYear}`}
              {selectedPeriod === 'last1' && `${getMonthName(periodMonth)} ${periodYear}`}
              {selectedPeriod === 'last3' && 'Últimos 3 meses'}
              {selectedPeriod === 'last6' && 'Últimos 6 meses'}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap">
            <button
              onClick={() => onPeriodChange('current')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                selectedPeriod === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => onPeriodChange('last1')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                selectedPeriod === 'last1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mês Passado
            </button>
            <button
              onClick={() => onPeriodChange('last3')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                selectedPeriod === 'last3'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              3 Meses
            </button>
            <button
              onClick={() => onPeriodChange('last6')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                selectedPeriod === 'last6'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              6 Meses
            </button>
          </div>
        </div>

        {topSpenders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-3">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
              Nenhuma despesa registrada
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Não há dados para o período selecionado
            </p>
          </div>
        ) : (
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
                  {/* Top Row: Category Name and Amount */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {hasSubcategories && (
                        <span className="text-gray-400 dark:text-gray-600 text-sm flex-shrink-0">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                      <h5 className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {category.name}
                      </h5>
                      <span className={`text-sm flex-shrink-0 ${getTrendColor(category.trend)}`}>
                        {getTrendIcon(category.trend)}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded flex-shrink-0">
                        {category.impact.toFixed(1)}% do total
                      </span>
                    </div>

                    {/* Amount with trend */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(category.spent)}
                        {category.budgeted > 0 && (
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                            / {formatCurrency(category.budgeted)}
                          </span>
                        )}
                      </div>
                      {category.avg3Months > 0 && category.trend !== 'stable' && (
                        <div className={`text-sm font-semibold ${
                          category.trend === 'up'
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {category.trend === 'up' && `+${formatCurrency(category.spent - category.avg3Months)}`}
                          {category.trend === 'down' && `-${formatCurrency(category.avg3Months - category.spent)}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full-Width Progress Bar */}
                  {category.budgeted > 0 && (
                    <div className="mb-2">
                      <div
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 cursor-help relative group"
                        title={`${category.percentage.toFixed(0)}% do orçamento usado`}
                      >
                        <div
                          className={`h-4 rounded-full transition-all ${
                            category.percentage > 105
                              ? 'bg-red-500'
                              : category.percentage >= 85
                              ? 'bg-lime-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {category.percentage.toFixed(0)}% do orçamento ({formatCurrency(category.spent)} de {formatCurrency(category.budgeted)})
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top subcategory hint */}
                  {category.topSubcategory && !isExpanded && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Principal: {category.topSubcategory.name} ({formatCurrency(category.topSubcategory.spent)})
                    </div>
                  )}
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
        )}
      </div>
    </div>
  )
}
