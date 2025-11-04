import React from 'react'
import { getMonthName, getCurrentYear } from '@/utils/date'

interface PeriodSelectorProps {
  selectedYear: number
  selectedMonth?: number
  onYearChange: (year: number) => void
  onMonthChange?: (month: number) => void
  showMonths?: boolean
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  showMonths = true,
}) => {
  const currentYear = getCurrentYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-4">
      {/* Year Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ano
        </label>
        <div className="flex gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedYear === year
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selector */}
      {showMonths && onMonthChange && selectedMonth && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mês
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => onMonthChange(month)}
                className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedMonth === month
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={getMonthName(month)}
              >
                {getMonthName(month).substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
