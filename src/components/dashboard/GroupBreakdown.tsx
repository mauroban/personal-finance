import React from 'react'
import { CategoryProgressRow, SubcategorySummary } from './CategoryProgressRow'
import { GroupSummary } from '@/types'

interface GroupBreakdownProps {
  summaries: GroupSummary[]
  summariesWithSubcategories?: Array<GroupSummary & { subcategories?: SubcategorySummary[] }>
  showSubcategories?: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  'Moradia': '🏠',
  'Alimentação': '🍔',
  'Transporte': '🚗',
  'Saúde': '🏥',
  'Educação': '📚',
  'Lazer': '🎮',
  'Vestuário': '👔',
  'Serviços': '🔧',
  'Outros': '💼',
}

export const GroupBreakdown: React.FC<GroupBreakdownProps> = ({
  summaries,
  summariesWithSubcategories,
  showSubcategories = false
}) => {
  const dataToDisplay = showSubcategories && summariesWithSubcategories
    ? summariesWithSubcategories
    : summaries

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Despesas por Categoria
      </h3>

      <div className="space-y-4">
        {dataToDisplay.map(summary => {
          const subcategories = 'subcategories' in summary ? (summary.subcategories as SubcategorySummary[] | undefined) : undefined
          const hasSubcategories = subcategories && subcategories.length > 0

          return (
            <CategoryProgressRow
              key={summary.groupId}
              category={summary}
              isExpandable={showSubcategories && !!hasSubcategories}
              subcategories={subcategories}
              icon={CATEGORY_ICONS[summary.groupName]}
            />
          )
        })}

        {dataToDisplay.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhuma categoria com orçamento definido para este mês
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
