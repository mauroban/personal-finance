import React from 'react'
import { GroupSummary } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils/format'

interface GroupBreakdownProps {
  summaries: GroupSummary[]
}

export const GroupBreakdown: React.FC<GroupBreakdownProps> = ({ summaries }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>

      <div className="space-y-4">
        {summaries.map(summary => {
          const isOverBudget = summary.actual > summary.budgeted
          const percentage = summary.budgeted > 0 ? (summary.actual / summary.budgeted) * 100 : 0

          return (
            <div key={summary.groupId} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{summary.groupName}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(summary.actual)} / {formatCurrency(summary.budgeted)}
                  </div>
                  <div className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverBudget ? 'Acima' : 'Dentro'} do orçamento
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>{formatPercentage(percentage)}</span>
                  <span>
                    {isOverBudget ? '+' : ''}
                    {formatCurrency(summary.remaining)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {summaries.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Nenhuma categoria com orçamento definido para este mês
          </p>
        )}
      </div>
    </div>
  )
}
