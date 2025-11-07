import React from 'react'

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  description,
  action,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {(title || description || action) && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              {title && <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{title}</h1>}
              {description && <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
