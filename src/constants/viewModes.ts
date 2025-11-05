export const VIEW_MODES = {
  OVERVIEW: 'overview',
  MONTH: 'month',
  YEAR: 'year',
  TRENDS: 'trends',
  // Legacy support - map old names to new ones
  MONTHLY: 'month',
  YEARLY: 'year',
} as const

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES]

// Dashboard tabs configuration
export interface DashboardTab {
  id: ViewMode
  label: string
  icon?: string
}

export const DASHBOARD_TABS: DashboardTab[] = [
  { id: VIEW_MODES.OVERVIEW, label: 'Visão Geral', icon: '📊' },
  { id: VIEW_MODES.MONTH, label: 'Mês', icon: '📅' },
  { id: VIEW_MODES.YEAR, label: 'Ano', icon: '📆' },
  { id: VIEW_MODES.TRENDS, label: 'Tendências', icon: '📈' },
]
