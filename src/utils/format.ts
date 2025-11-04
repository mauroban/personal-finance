/**
 * Formats a number as Brazilian Real (BRL) currency
 *
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formats a number as a percentage with one decimal place
 *
 * @param value - The numeric value to format
 * @returns Formatted percentage string (e.g., "50.0%")
 * @example
 * formatPercentage(33.333) // "33.3%"
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}
