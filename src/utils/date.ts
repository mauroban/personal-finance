/**
 * Date utilities that treat dates as timezone-agnostic calendar dates.
 * All dates are set to noon (12:00:00) to prevent timezone conversions from shifting the calendar day.
 */

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
  // Ensure time is set to noon to avoid timezone issues
  newDate.setHours(12, 0, 0, 0)
  return newDate
}

export const parseDate = (dateString: string): Date => {
  // Parse as local date with time set to noon to completely avoid timezone issues
  // Setting time to 12:00:00 ensures the date never shifts to a different day
  // dateString format: "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
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
  // Parse date string manually to avoid timezone issues
  const [dateYear, dateMonth] = dateString.split('-').map(Number)
  return dateYear === year && dateMonth === month
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
  const year = Math.floor((monthNum - 1) / 12)
  const month = ((monthNum - 1) % 12) + 1
  return { year, month }
}
