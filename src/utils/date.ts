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
