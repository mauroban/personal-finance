import React from 'react'
import { useNavigate } from 'react-router-dom'

export interface Alert {
  type: 'warning' | 'success' | 'info'
  message: string
  category?: string
  action?: {
    label: string
    route: string
  }
}

interface AlertBannerProps {
  alerts: Alert[]
  maxVisible?: number
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  maxVisible = 5,
}) => {
  const navigate = useNavigate()
  const [dismissedIndexes, setDismissedIndexes] = React.useState<number[]>([])

  if (alerts.length === 0) {
    return null
  }

  const visibleAlerts = alerts
    .filter((_, index) => !dismissedIndexes.includes(index))
    .slice(0, maxVisible)

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
          icon: '⚠️',
          text: 'text-amber-800 dark:text-amber-300',
          button: 'text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200',
        }
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
          icon: '✓',
          text: 'text-green-800 dark:text-green-300',
          button: 'text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200',
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
          icon: 'ℹ️',
          text: 'text-blue-800 dark:text-blue-300',
          button: 'text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200',
        }
    }
  }

  const handleDismiss = (index: number) => {
    setDismissedIndexes([...dismissedIndexes, index])
  }

  const handleAction = (action: Alert['action']) => {
    if (action?.route) {
      navigate(action.route)
    }
  }

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert, index) => {
        const styles = getAlertStyles(alert.type)

        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border ${styles.container} transition-all duration-300 animate-slideDown`}
          >
            {/* Icon */}
            <span className="text-xl flex-shrink-0">{styles.icon}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${styles.text}`}>
                {alert.message}
              </p>
              {alert.category && (
                <p className={`text-xs mt-1 opacity-75 ${styles.text}`}>
                  Categoria: {alert.category}
                </p>
              )}
            </div>

            {/* Action Button */}
            {alert.action && (
              <button
                onClick={() => handleAction(alert.action)}
                className={`text-sm font-medium ${styles.button} whitespace-nowrap flex-shrink-0`}
              >
                {alert.action.label}
              </button>
            )}

            {/* Dismiss Button */}
            <button
              onClick={() => handleDismiss(index)}
              className={`text-lg leading-none ${styles.button} flex-shrink-0`}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )
      })}

      {alerts.length > maxVisible && (
        <div className="text-center">
          <button
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            onClick={() => setDismissedIndexes([])}
          >
            Mostrar mais {alerts.length - visibleAlerts.length} alertas
          </button>
        </div>
      )}
    </div>
  )
}

// Add to global CSS:
// @keyframes slideDown {
//   from {
//     opacity: 0;
//     transform: translateY(-10px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
