import React from 'react'

interface LoadingStateProps {
  message?: string
  type?: 'card' | 'table' | 'chart' | 'full'
  rows?: number
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  type = 'full',
  rows = 3,
}) => {
  if (type === 'full') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'chart') {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  return null
}

// Skeleton component for granular control
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

// Card skeleton
export const CardSkeleton: React.FC = () => (
  <div className="card p-6 animate-pulse">
    <Skeleton className="h-4 w-1/4 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-3 w-full" />
  </div>
)

// Grid of card skeletons
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)
