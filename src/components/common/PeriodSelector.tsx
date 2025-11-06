import React from 'react'
import { getMonthName, getCurrentYear, getCurrentMonth } from '@/utils/date'
import { shadows, transitions } from '@/constants/designSystem'

interface PeriodSelectorProps {
  selectedYear: number
  selectedMonth?: number
  onYearChange: (year: number) => void
  onMonthChange?: (month: number) => void
  showMonths?: boolean
  compact?: boolean
  showNavigation?: boolean
  showTodayButton?: boolean
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  showMonths = true,
  compact = false,
  showNavigation = false,
  showTodayButton = false,
}) => {
  const currentYear = getCurrentYear()
  const currentMonth = getCurrentMonth()
  const [yearRangeStart, setYearRangeStart] = React.useState(() => {
    // Center the selected year in the range on initial load
    return selectedYear - 2
  })

  // Update year range when selected year changes - always center it
  React.useEffect(() => {
    setYearRangeStart(selectedYear - 2)
  }, [selectedYear])

  const handlePrevYears = () => {
    setYearRangeStart(prev => prev - 1)
  }

  const handleNextYears = () => {
    setYearRangeStart(prev => prev + 1)
  }

  const years = Array.from({ length: 5 }, (_, i) => yearRangeStart + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handlePrevPeriod = () => {
    if (showMonths && selectedMonth) {
      if (selectedMonth === 1) {
        onYearChange(selectedYear - 1)
        onMonthChange?.(12)
      } else {
        onMonthChange?.(selectedMonth - 1)
      }
    } else {
      onYearChange(selectedYear - 1)
    }
  }

  const handleNextPeriod = () => {
    if (showMonths && selectedMonth) {
      if (selectedMonth === 12) {
        onYearChange(selectedYear + 1)
        onMonthChange?.(1)
      } else {
        onMonthChange?.(selectedMonth + 1)
      }
    } else {
      onYearChange(selectedYear + 1)
    }
  }

  const handleToday = () => {
    onYearChange(currentYear)
    if (showMonths && onMonthChange) {
      onMonthChange(currentMonth)
    }
  }

  const isCurrentPeriod = showMonths
    ? selectedYear === currentYear && selectedMonth === currentMonth
    : selectedYear === currentYear

  return (
    <div className={compact ? 'space-y-3' : 'space-y-5'}>
      {/* Navigation-based selector (for Month Tab) */}
      {showNavigation && showMonths && selectedMonth ? (
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <button
            onClick={handlePrevPeriod}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Período anterior"
          >
            <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Current period display */}
          <div className="flex-1 text-center">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {getMonthName(selectedMonth)} {selectedYear}
            </h2>
          </div>

          {/* Next button */}
          <button
            onClick={handleNextPeriod}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Próximo período"
          >
            <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Today button */}
          {showTodayButton && !isCurrentPeriod && (
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              style={{ boxShadow: shadows.sm }}
            >
              Hoje
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Year Selector */}
          <div>
            <label
              className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wide"
              style={{ letterSpacing: '0.05em' }}
            >
              Ano
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={handlePrevYears}
                  className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Anos anteriores"
                >
                  <svg className="w-4 h-4 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  {years.map((year) => {
                    const isSelected = selectedYear === year
                    return (
                      <button
                        key={year}
                        onClick={() => onYearChange(year)}
                        className={`
                          px-4 py-1.5 rounded-md text-sm font-semibold transition-all
                          ${
                            isSelected
                              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }
                        `}
                        style={{
                          transition: `all ${transitions.fast}`,
                          ...(isSelected ? { boxShadow: shadows.sm } : {}),
                        }}
                        aria-pressed={isSelected}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={handleNextYears}
                  className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label="Próximos anos"
                >
                  <svg className="w-4 h-4 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {!isCurrentPeriod && (
                <button
                  onClick={handleToday}
                  className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                  style={{ boxShadow: shadows.sm }}
                >
                  Hoje
                </button>
              )}
            </div>
          </div>

          {/* Month Selector */}
          {showMonths && onMonthChange && selectedMonth && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide"
                  style={{ letterSpacing: '0.05em' }}
                >
                  Mês
                </label>
                {showTodayButton && !isCurrentPeriod && (
                  <button
                    onClick={handleToday}
                    className="px-3 py-1 rounded-md bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Hoje
                  </button>
                )}
              </div>
              <div className={`grid gap-${compact ? '1.5' : '2'} grid-cols-4 sm:grid-cols-6 md:grid-cols-12`}>
                {months.map((month) => {
                  const isSelected = selectedMonth === month
                  const isCurrent = selectedYear === currentYear && month === currentMonth
                  const monthName = getMonthName(month)
                  return (
                    <button
                      key={month}
                      onClick={() => onMonthChange(month)}
                      className={`
                        px-2 py-2 rounded-md text-xs font-semibold transition-all relative
                        ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md scale-105'
                            : isCurrent
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40 hover:scale-105 ring-2 ring-green-500 dark:ring-green-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-105'
                        }
                      `}
                      style={{
                        transition: `all ${transitions.fast}`,
                        ...(isSelected ? { boxShadow: shadows.md } : {}),
                      }}
                      title={monthName}
                      aria-label={monthName}
                      aria-pressed={isSelected}
                    >
                      {monthName.substring(0, 3)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
