import React from 'react'
import { ViewMode, DASHBOARD_TABS, DashboardTab } from '@/constants/viewModes'

interface TabNavigationProps {
  activeTab: ViewMode
  onTabChange: (tab: ViewMode) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        newIndex = (currentIndex + 1) % DASHBOARD_TABS.length
        break
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = currentIndex === 0 ? DASHBOARD_TABS.length - 1 : currentIndex - 1
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = DASHBOARD_TABS.length - 1
        break
      default:
        return
    }

    onTabChange(DASHBOARD_TABS[newIndex].id)
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div
        className="-mb-px flex space-x-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        role="tablist"
        aria-label="Visualizações do dashboard"
        style={{
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {DASHBOARD_TABS.map((tab: DashboardTab, index: number) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                group inline-flex items-center px-3 md:px-4 py-3 border-b-2 font-medium text-sm
                whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon && (
                <span className="mr-1 md:mr-2 text-base md:text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span className="text-xs md:text-sm">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
