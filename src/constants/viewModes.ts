export const VIEW_MODES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES]
