import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPercentage } from '../format'

describe('format utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as Brazilian currency', () => {
      const result1 = formatCurrency(1000)
      const result2 = formatCurrency(1234.56)
      expect(result1).toContain('1.000,00')
      expect(result1).toContain('R$')
      expect(result2).toContain('1.234,56')
      expect(result2).toContain('R$')
    })

    it('formats zero correctly', () => {
      const result = formatCurrency(0)
      expect(result).toContain('0,00')
      expect(result).toContain('R$')
    })

    it('formats negative numbers correctly', () => {
      const result = formatCurrency(-500.25)
      expect(result).toContain('500,25')
      expect(result).toContain('-')
      expect(result).toContain('R$')
    })
  })

  describe('formatPercentage', () => {
    it('formats percentage with one decimal place', () => {
      expect(formatPercentage(50)).toBe('50.0%')
      expect(formatPercentage(33.333)).toBe('33.3%')
      expect(formatPercentage(100)).toBe('100.0%')
    })
  })
})
