import React from 'react'

interface EmptyStateProps {
  icon?: string | React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📊',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`card p-12 text-center ${className}`}>
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="text-6xl mb-4 opacity-50">
          {typeof icon === 'string' ? icon : icon}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

// Preset empty states
export const NoDataEmptyState: React.FC<{ message?: string }> = ({
  message = 'Nenhum dado disponível',
}) => (
  <EmptyState
    icon="📭"
    title="Sem dados"
    description={message}
  />
)

export const NoTransactionsEmptyState: React.FC = () => (
  <EmptyState
    icon="💳"
    title="Nenhuma transação registrada"
    description="Comece adicionando suas receitas e despesas para visualizar o dashboard."
  />
)

export const NoBudgetEmptyState: React.FC = () => (
  <EmptyState
    icon="📝"
    title="Nenhum orçamento definido"
    description="Configure seus orçamentos mensais para acompanhar suas metas financeiras."
  />
)

export const NoResultsEmptyState: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => (
  <EmptyState
    icon="🔍"
    title="Nenhum resultado encontrado"
    description={searchTerm ? `Não encontramos resultados para "${searchTerm}"` : 'Tente ajustar os filtros ou período.'}
  />
)
