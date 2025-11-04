import { describe, it, expect } from 'vitest'
import { formatDate, addMonths, getMonthName, isDateInMonth } from '../date'

describe('date utilities', () => {
  describe('formatDate', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2024, 2, 15) // Month is 0-indexed
      expect(formatDate(date)).toBe('2024-03-15')
    })
  })

  describe('addMonths', () => {
    it('adds months correctly', () => {
      const date = new Date(2024, 0, 15) // Jan 15, 2024
      const result = addMonths(date, 2)
      expect(result.getMonth()).toBe(2) // March (0-indexed)
    })

    it('handles year rollover', () => {
      const date = new Date(2024, 10, 15) // Nov 15, 2024
      const result = addMonths(date, 2)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January
    })
  })

  describe('getMonthName', () => {
    it('returns correct Portuguese month names', () => {
      expect(getMonthName(1)).toBe('Janeiro')
      expect(getMonthName(6)).toBe('Junho')
      expect(getMonthName(12)).toBe('Dezembro')
    })

    it('returns empty string for invalid month', () => {
      expect(getMonthName(0)).toBe('')
      expect(getMonthName(13)).toBe('')
    })
  })

  describe('isDateInMonth', () => {
    it('returns true for dates in the specified month', () => {
      // Use dates in middle of month to avoid timezone issues
      expect(isDateInMonth('2024-03-15T12:00:00', 2024, 3)).toBe(true)
      expect(isDateInMonth('2024-01-15T12:00:00', 2024, 1)).toBe(true)
    })

    it('returns false for dates in different months', () => {
      expect(isDateInMonth('2024-03-15T12:00:00', 2024, 4)).toBe(false)
      expect(isDateInMonth('2024-03-15T12:00:00', 2023, 3)).toBe(false)
    })
  })
})
