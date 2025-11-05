import React from 'react'
import { ViewMode, DASHBOARD_TABS, DashboardTab } from '@/constants/viewModes'

interface TabNavigationProps {
  activeTab: ViewMode
  onTabChange: (tab: ViewMode) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {DASHBOARD_TABS.map((tab: DashboardTab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm
                whitespace-nowrap transition-all duration-200
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <span className="mr-2 text-lg" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
