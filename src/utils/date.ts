export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getTodayString = (): string => {
  return formatDate(new Date())
}

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}

export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month - 1] || ''
}

export const getCurrentYear = (): number => {
  return new Date().getFullYear()
}

export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1
}

export const isDateInMonth = (dateString: string, year: number, month: number): boolean => {
  const date = new Date(dateString)
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

/**
 * Converts a year and month to a linear month number for easy comparison
 * Example: 2024, 3 -> 24291 (2024 * 12 + 3)
 *
 * @param year - The year number
 * @param month - The month number (1-12)
 * @returns A linear month number that can be easily compared
 */
export const dateToMonthNumber = (year: number, month: number): number => {
  return year * 12 + month
}

/**
 * Converts a linear month number back to year and month
 * Example: 24291 -> { year: 2024, month: 3 }
 *
 * @param monthNum - The linear month number
 * @returns An object with year and month properties
 */
export const monthNumberToDate = (monthNum: number): { year: number; month: number } => {
  const year = Math.floor(monthNum / 12)
  const month = monthNum % 12
  return { year, month: month === 0 ? 12 : month }
}
