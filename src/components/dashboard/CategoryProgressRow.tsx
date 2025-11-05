import React, { useState } from 'react'
import { GroupSummary } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils/format'

export interface SubcategorySummary {
  subgroupId: number
  subgroupName: string
  budgeted: number
  actual: number
  remaining: number
  percentage: number
}

interface CategoryProgressRowProps {
  category: GroupSummary
  isExpandable?: boolean
  subcategories?: SubcategorySummary[]
  icon?: string
}

export const CategoryProgressRow: React.FC<CategoryProgressRowProps> = ({
  category,
  isExpandable = false,
  subcategories = [],
  icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusInfo = (percentage: number) => {
    if (percentage >= 100) {
      return {
        label: 'Acima do orçamento',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500',
        icon: '⚠',
      }
    } else if (percentage >= 80) {
      return {
        label: 'Atenção',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500',
        icon: '⚡',
      }
    } else {
      return {
        label: 'Dentro do orçamento',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500',
        icon: '✓',
      }
    }
  }

  const mainStatus = getStatusInfo(category.percentage)
  const hasSubcategories = isExpandable && subcategories.length > 0

  return (
    <div className="space-y-2">
      {/* Main Category Row */}
      <div
        className={`p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all ${
          hasSubcategories ? 'cursor-pointer' : ''
        }`}
        onClick={() => hasSubcategories && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          {/* Category name and icon */}
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {category.groupName}
                </h4>
                {hasSubcategories && (
                  <span className="text-xs text-gray-500">
                    ({subcategories.length})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className={mainStatus.color}>{mainStatus.icon}</span>
                <span>{mainStatus.label}</span>
              </p>
            </div>
          </div>

          {/* Expand/collapse icon */}
          {hasSubcategories && (
            <div className="ml-auto mr-4">
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}

          {/* Values */}
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(category.actual)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              de {formatCurrency(category.budgeted)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${mainStatus.bgColor}`}
              style={{ width: `${Math.min(category.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${mainStatus.color}`}>
              {formatPercentage(category.percentage)}
            </span>
            <span className={`font-medium ${
              category.remaining >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {category.remaining >= 0 ? '' : '-'}
              {formatCurrency(Math.abs(category.remaining))} restante
            </span>
          </div>
        </div>
      </div>

      {/* Subcategories (Expanded) */}
      {isExpanded && subcategories.length > 0 && (
        <div className="ml-8 space-y-2 animate-fadeIn">
          {subcategories.map(sub => {
            const subStatus = getStatusInfo(sub.percentage)
            return (
              <div
                key={sub.subgroupId}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">└</span>
                    <div>
                      <h5 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {sub.subgroupName}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className={subStatus.color}>{subStatus.icon}</span>
                        {' '}{subStatus.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(sub.actual)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      / {formatCurrency(sub.budgeted)}
                    </div>
                  </div>
                </div>

                {/* Subcategory progress bar */}
                <div className="space-y-1">
                  <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${subStatus.bgColor}`}
                      style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`${subStatus.color}`}>
                      {formatPercentage(sub.percentage)}
                    </span>
                    <span className={
                      sub.remaining >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }>
                      {formatCurrency(Math.abs(sub.remaining))}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
